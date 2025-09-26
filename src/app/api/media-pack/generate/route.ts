import { NextRequest, NextResponse } from 'next/server'
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo';
import { flags } from '@/lib/flags'
import { prisma } from '@/lib/prisma'
import { signPayload } from '@/lib/signing'
import { nanoid } from 'nanoid'
import { env } from '@/lib/env'
import { hasPro } from '@/lib/entitlements';
import { buildPackData } from '@/lib/mediaPack/buildPackData'
import { generateMediaPackCopy } from '@/ai/useMediaPackCopy'
import { uploadPDF } from '@/lib/storage'
import { getChromium } from '@/lib/chromium'
import { generateStubPDF } from '@/lib/stub-pdf'
import { log } from '@/lib/log'
import { withRequestContext } from '@/lib/with-request-context'
import { withIdempotency, tx } from '@/lib/idempotency'
import puppeteer from 'puppeteer-core'

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export const maxDuration = 60

async function handlePOST(req: NextRequest) {
  const startTime = Date.now()
  
  try {
    log.info('Media pack generation started', { feature: 'mediapack-generate' })
    
    if (!flags.mediapackV2) {
      log.warn('Media pack generation blocked - feature flag disabled', { feature: 'mediapack-generate' })
      return NextResponse.json({ error: 'mediapack.v2 disabled' }, { status: 403 })
    }

    // Get workspace ID using unified helper
    const workspaceId = await requireSessionOrDemo(req);
    if (!workspaceId) {
      return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
    }

    // Check plan entitlement for PDF generation (skip for demo)
    if (workspaceId !== 'demo-workspace') {
      const ws = await prisma.workspace.findUnique({ 
        where: { id: workspaceId }, 
        select: { plan: true }
      });
      if (!ws || !hasPro(ws.plan)) {
        return NextResponse.json({ ok: false, error: 'REQUIRES_PRO' }, { status: 200 });
      }
    }
    
    const body = await req.json()
    const { packId, variant = 'classic', dark = false } = body
    
    if (!packId) {
      return NextResponse.json({ error: 'packId required' }, { status: 400 })
    }

    // Look up the real workspace ID if we're using a slug
    let realWorkspaceId = workspaceId
    
    // If no workspaceId was returned, try to find the demo workspace
    if (!realWorkspaceId || realWorkspaceId === 'demo-workspace') {
      const demoWorkspace = await prisma.workspace.findFirst({
        where: { slug: 'demo' },
        select: { id: true }
      })
      if (demoWorkspace) {
        realWorkspaceId = demoWorkspace.id
      }
    }

    if (!realWorkspaceId) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    log.info('Building pack data', { 
      feature: 'mediapack-generate',
      workspaceId: realWorkspaceId,
      packId,
      variant 
    })

    // Build pack data and generate AI copy
    const packData = await buildPackData({ workspaceId: realWorkspaceId })
    const aiCopy = await generateMediaPackCopy(packData)
    
    // Merge AI copy and theme settings
    const finalData = {
      ...packData,
      packId,
      ai: {
        ...packData.ai,
        ...aiCopy
      },
      theme: {
        variant: variant as 'classic' | 'bold' | 'editorial',
        dark,
        brandColor: '#3b82f6'
      }
    }

    // Get Chromium configuration
    const chromiumConfig = getChromium()
    const isChromiumAvailable = chromiumConfig.executablePath !== undefined
    
    log.info('Chromium configuration', {
      feature: 'mediapack-generate',
      available: isChromiumAvailable,
      executablePath: chromiumConfig.executablePath,
      timeoutMs: chromiumConfig.timeoutMs
    })

    let pdfBuffer: Buffer
    let filename: string
    let isStub = false

    if (isChromiumAvailable) {
      // Generate real PDF with Chromium
      try {
        log.info('Generating PDF with Chromium', { 
          feature: 'mediapack-generate',
          executablePath: chromiumConfig.executablePath
        })
        const browser = await puppeteer.launch({
          executablePath: chromiumConfig.executablePath || undefined,
          headless: chromiumConfig.headless,
          args: chromiumConfig.args,
          timeout: chromiumConfig.timeoutMs
        })
        
        const page = await browser.newPage()
        
        // Create a temporary media pack record for the URL
        const tempMediaPack = await prisma.mediaPack.create({
          data: {
            id: packId,
            workspaceId: realWorkspaceId,
            variant: variant as string,
            theme: finalData.theme as any,
            brandIds: [],
            htmlUrl: '',
            pdfUrl: '',
            shareToken: nanoid(24),
          }
        })

        // Generate URL for the media pack
        const tempUrl = `${env.APP_URL}/media-pack/view?mp=${packId}&sig=${encodeURIComponent(tempMediaPack.shareToken)}`
        
        // Navigate to the media pack URL
        await page.goto(tempUrl, { waitUntil: 'networkidle', timeout: 60000 })
        
        // Generate PDF with optimized settings
        pdfBuffer = await page.pdf({
          format: 'A4',
          printBackground: true,
          preferCSSPageSize: true,
          scale: 1.0,
          margin: {
            top: '20mm',
            right: '15mm',
            bottom: '20mm',
            left: '15mm'
          },
          displayHeaderFooter: false,
          tagged: false,
          outline: false
        })
        
        await page.close()
        await browser.close()
        
        filename = `media-pack-${packId}-${variant}${dark ? '-dark' : ''}.pdf`
        
        log.info('PDF generated successfully with Chromium', {
          feature: 'mediapack-generate',
          sizeBytes: pdfBuffer.length,
          renderTimeMs: Date.now() - startTime
        })
        
      } catch (error) {
        log.error('Chromium PDF generation failed, falling back to stub', {
          feature: 'mediapack-generate',
          error: error instanceof Error ? error.message : 'Unknown error',
          renderTimeMs: Date.now() - startTime
        })
        
        // Fallback to stub PDF
        const stubResult = await generateStubPDF(
          `media-pack-${packId}-${variant}${dark ? '-dark' : ''}.pdf`,
          {
            brandName: packData.brand?.name,
            creatorName: packData.creator?.name,
            generatedAt: new Date().toISOString()
          }
        )
        
        pdfBuffer = stubResult.buffer
        filename = stubResult.filename
        isStub = true
      }
    } else {
      // Generate stub PDF directly
      log.warn('Chromium not available, generating stub PDF', {
        feature: 'mediapack-generate',
        executablePath: chromiumConfig.executablePath
      })
      
      const stubResult = await generateStubPDF(
        `media-pack-${packId}-${variant}${dark ? '-dark' : ''}.pdf`,
        {
          brandName: packData.brand?.name,
          creatorName: packData.creator?.name,
          generatedAt: new Date().toISOString()
        }
      )
      
      pdfBuffer = stubResult.buffer
      filename = stubResult.filename
      isStub = true
    }

    // Upload PDF to storage
    log.info('Uploading PDF to storage', { 
      feature: 'mediapack-generate',
      filename,
      isStub 
    })
    
    const { url, key } = await uploadPDF(pdfBuffer, filename)

    // Update the media pack record with the PDF URL using transaction
    const mediaPack = await tx(async (p) => {
      // First, try to create the temporary record if it doesn't exist
      try {
        await p.mediaPack.create({
          data: {
            id: packId,
            workspaceId: realWorkspaceId,
            variant: variant as string,
            theme: finalData.theme as any,
            brandIds: [],
            htmlUrl: '',
            pdfUrl: url,
            shareToken: nanoid(24),
          }
        })
      } catch (error: any) {
        // If it already exists, update it
        if (error.code === 'P2002') {
          return await p.mediaPack.update({
            where: { id: packId },
            data: {
              pdfUrl: url,
              updatedAt: new Date()
            }
          })
        }
        throw error
      }
      
      // Return the created record
      return await p.mediaPack.findUnique({
        where: { id: packId }
      })!
    })

    // Generate signed share URL
    const payload = {
      mp: mediaPack.id,
      exp: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
    }
    const token = signPayload(payload, '30d')
    const shareUrl = `${env.APP_URL}/media-pack/view?mp=${mediaPack.id}&sig=${encodeURIComponent(token)}`

    const totalTime = Date.now() - startTime
    
    log.info('Media pack generation completed', {
      feature: 'mediapack-generate',
      packId: mediaPack.id,
      filename,
      isStub,
      fallback: isStub,
      sizeBytes: pdfBuffer.length,
      renderTimeMs: totalTime,
      totalTimeMs: totalTime,
      pdfUrl: url
    })

    // Return PDF as download
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'X-PDF-URL': url,
        'X-Share-URL': shareUrl,
        'X-Is-Stub': isStub.toString()
      }
    })
    
  } catch (error) {
    const totalTime = Date.now() - startTime
    
    log.error('Media pack generation failed', {
      feature: 'mediapack-generate',
      error: error instanceof Error ? error.message : 'Unknown error',
      totalTimeMs: totalTime
    })
    
    return NextResponse.json({ 
      ok: false, 
      code: 'PDF_RENDER_FAILED',
      hint: 'Chromium not found or timed out',
      error: 'Failed to generate media pack PDF' 
    }, { status: 500 })
  }
}

export const POST = withRequestContext(withIdempotency(handlePOST))
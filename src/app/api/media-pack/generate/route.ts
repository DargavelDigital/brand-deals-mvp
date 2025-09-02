import { NextRequest, NextResponse } from 'next/server'
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo';
import { flags } from '@/lib/flags'
import { prisma } from '@/lib/prisma'
import { signPayload } from '@/lib/signing'
import { nanoid } from 'nanoid'
import { env } from '@/lib/env'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth-options';
import { hasPro } from '@/lib/entitlements';
import { getBrowser } from '@/lib/browser'
import { buildPackData } from '@/lib/mediaPack/buildPackData'
import { generateMediaPackCopy } from '@/ai/useMediaPackCopy'
import { uploadPDF } from '@/lib/storage'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    console.log('MediaPack generate: checking feature flag...')
    if (!flags.mediapackV2) {
      console.log('MediaPack generate: feature flag disabled')
      return NextResponse.json({ error: 'mediapack.v2 disabled' }, { status: 403 })
    }
    console.log('MediaPack generate: feature flag enabled')

    // Check plan entitlement for PDF generation
    const session = await getServerSession(authOptions);
    if (!session?.user?.workspaceId) {
      // If demo auth is enabled, skip the session check
      if (env.ENABLE_DEMO_AUTH === "1" || env.FEATURE_DEMO_AUTH === "true") {
        console.log('MediaPack generate: skipping session check for demo auth');
      } else {
        return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
      }
    } else {
      const ws = await prisma.workspace.findUnique({ 
        where: { id: session.user.workspaceId }, 
        select: { plan: true }
      });
      if (!ws || !hasPro(ws.plan)) {
        return NextResponse.json({ ok: false, error: 'REQUIRES_PRO' }, { status: 200 });
      }
    }

    let workspaceId: string | null = null;
    try {
      workspaceId = await requireSessionOrDemo(req);
      console.log('MediaPack generate: requireSessionOrDemo returned workspaceId:', workspaceId);
    } catch (error) {
      console.log('MediaPack generate: requireSessionOrDemo failed:', error);
      // If demo auth is enabled, use demo workspace
      if (env.ENABLE_DEMO_AUTH === "1" || env.FEATURE_DEMO_AUTH === "true") {
        console.log('MediaPack generate: using demo workspace fallback');
        workspaceId = "demo-workspace";
      } else {
        return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
      }
    }
    
    const body = await req.json()
    const { packId, variant = 'classic', dark = false } = body
    
    if (!packId) {
      return NextResponse.json({ error: 'packId required' }, { status: 400 })
    }

    // Look up the real workspace ID if we're using a slug
    let realWorkspaceId = workspaceId
    console.log('MediaPack generate: initial realWorkspaceId:', realWorkspaceId)
    
    // If no workspaceId was returned, try to find the demo workspace
    if (!realWorkspaceId || realWorkspaceId === 'demo-workspace') {
      console.log('MediaPack generate: looking up demo workspace')
      const demoWorkspace = await prisma.workspace.findFirst({
        where: { slug: 'demo' },
        select: { id: true }
      })
      if (demoWorkspace) {
        realWorkspaceId = demoWorkspace.id
        console.log('MediaPack generate: found demo workspace ID:', realWorkspaceId)
      }
    }

    if (!realWorkspaceId) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    console.log('MediaPack generate: using workspace ID:', realWorkspaceId)

    // Build pack data and generate AI copy
    console.log('MediaPack generate: building pack data...')
    const packData = await buildPackData({ workspaceId: realWorkspaceId })
    
    console.log('MediaPack generate: generating AI copy...')
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

    console.log('MediaPack generate: generating PDF...')
    const browser = await getBrowser()
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
    
    // Navigate to the media pack URL instead of rendering HTML directly
    await page.goto(tempUrl, { waitUntil: 'networkidle', timeout: 60000 })
    
    // Generate PDF with optimized settings for crisp output
    const pdfBuffer = await page.pdf({
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
      // Ensure crisp rendering
      tagged: false,
      outline: false
    })
    
    await page.close()

    console.log('MediaPack generate: uploading PDF...')
    const filename = `media-pack-${packId}-${variant}${dark ? '-dark' : ''}.pdf`
    const { url, key } = await uploadPDF(pdfBuffer, filename)

    // Update the temporary media pack record with the PDF URL
    const mediaPack = await prisma.mediaPack.update({
      where: { id: packId },
      data: {
        pdfUrl: url,
        updatedAt: new Date()
      }
    })

    console.log('MediaPack generate: created/updated media pack:', mediaPack.id)

    // Generate signed share URL
    const payload = {
      mp: mediaPack.id,
      exp: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
    }
    const token = signPayload(payload, '30d')
    const shareUrl = `${env.APP_URL}/media-pack/view?mp=${mediaPack.id}&sig=${encodeURIComponent(token)}`

    console.log('MediaPack generate: generated share URL')

    // Return PDF as download
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'X-PDF-URL': url,
        'X-Share-URL': shareUrl
      }
    })
  } catch (error) {
    console.error('MediaPack generate error:', error)
    return NextResponse.json({ error: 'Failed to generate media pack PDF' }, { status: 500 })
  }
}
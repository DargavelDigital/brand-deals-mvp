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
import { isToolEnabled } from '@/lib/launch'
import { isOn } from '@/config/flags'
import { renderPdfFromUrl, renderPdf } from '@/services/mediaPack/renderer'
import { headers } from "next/headers"

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export const maxDuration = 60

export async function POST(req: NextRequest) {
  console.info('[mpgen] start', { ts: new Date().toISOString() });
  
  try {
    // Check if pack tool is enabled
    if (!isToolEnabled('pack')) {
      return NextResponse.json({ ok: false, mode: 'DISABLED' }, { status: 200 });
    }

    console.log('MediaPack generate: checking feature flag...')
    
    // Log flag values for debugging
    console.log('mp.generate.flags', {
      mediapackV2: process.env.MEDIAPACK_V2,
      featureMediapackV2: process.env.FEATURE_MEDIAPACK_V2,
      nextPublic: process.env.NEXT_PUBLIC_MEDIAPACK_V2,
      flagsMediapackV2: flags.mediapackV2,
      unifiedFlag: isOn('mediapack.v2'),
    });
    
    if (!isOn('mediapack.v2')) {
      console.log('MediaPack generate: feature flag disabled')
      return NextResponse.json({ error: 'mediapack.v2 disabled' }, { status: 403 })
    }
    console.log('MediaPack generate: feature flag enabled')

    // Get workspace ID using unified helper
    const workspaceId = await requireSessionOrDemo(req);
    if (!workspaceId) {
      return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
    }

    // Check plan entitlement for PDF generation (skip for demo)
    if (workspaceId !== 'demo-workspace') {
      const ws = await prisma().workspace.findUnique({ 
        where: { id: workspaceId }, 
        select: { plan: true }
      });
      if (!ws || !hasPro(ws.plan)) {
        return NextResponse.json({ ok: false, error: 'REQUIRES_PRO' }, { status: 200 });
      }
    }
    
    const body = await req.json().catch(() => ({}));
    const { packId, variant = 'classic', dark = false, html, url, fileName = 'media-pack.pdf' } = body ?? {}
    
    // packId is required only for URL-based mode, not for inline HTML mode
    if (!packId && !html) {
      return NextResponse.json({ error: 'packId or html required' }, { status: 400 })
    }

    // Check for inline HTML fallback (bypasses URL navigation/CSP issues)
    if (html && typeof html === 'string') {
      console.log('[mpgen] using inline HTML mode');
      let pdfBuffer: Buffer;
      try {
        pdfBuffer = await renderPdf(html);
        console.log('[mpgen] inline HTML success', { size: pdfBuffer?.length ?? 0 });
        
        return new NextResponse(pdfBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${fileName}"`,
          },
        });
      } catch (err: any) {
        console.error('[mpgen] fail', {
          message: err?.message,
          stack: err?.stack,
          name: err?.name,
          cause: err?.cause,
        });
        return NextResponse.json({ error: 'Failed to generate media pack PDF', detail: String(err?.message || err) }, { status: 500 });
      } finally {
        console.info('[mpgen] end');
      }
    }
    
    // URL-based mode: Look up the real workspace ID if we're using a slug
    let realWorkspaceId = workspaceId
    console.log('MediaPack generate: initial realWorkspaceId:', realWorkspaceId)
    
    // If no workspaceId was returned, try to find the demo workspace
    if (!realWorkspaceId || realWorkspaceId === 'demo-workspace') {
      console.log('MediaPack generate: looking up demo workspace')
      const demoWorkspace = await prisma().workspace.findFirst({
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
    
    // Create a temporary media pack record for the URL
    const tempMediaPack = await prisma().mediaPack.create({
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

    // Generate URL for the media pack with absolute URL safety
    const hs = headers();
    const proto = hs.get('x-forwarded-proto') || 'https';
    const host = hs.get('x-forwarded-host') || hs.get('host');
    const origin = host ? `${proto}://${host}` : env.APP_URL;
    const relativeUrl = `/media-pack/view?mp=${packId}&sig=${encodeURIComponent(tempMediaPack.shareToken)}`;
    const absUrl = new URL(relativeUrl, origin).toString();
    
    const requestId = hs.get("x-nf-request-id") || hs.get("x-request-id") || crypto.randomUUID();
    console.log("mp.generate.start", {
      requestId,
      mode: "url",
      htmlLength: null,
      urlHost: (() => { try { return new URL(absUrl).host; } catch { return "bad-url"; } })(),
      origin,
    });

    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await renderPdfFromUrl(absUrl);
      console.log("mp.generate.success", { requestId, size: pdfBuffer?.length ?? 0 });
    } catch (err: any) {
      console.error('[mpgen] fail', {
        message: err?.message,
        stack: err?.stack,
        name: err?.name,
        cause: err?.cause,
      });
      return NextResponse.json({ error: 'Failed to generate media pack PDF', detail: String(err?.message || err) }, { status: 500 });
    } finally {
      console.info('[mpgen] end');
    }

    console.log('MediaPack generate: uploading PDF...')
    const filename = `media-pack-${packId}-${variant}${dark ? '-dark' : ''}.pdf`
    const { url: uploadedUrl, key } = await uploadPDF(pdfBuffer, filename)

    // Update the temporary media pack record with the PDF URL
    const mediaPack = await prisma().mediaPack.update({
      where: { id: packId },
      data: {
        pdfUrl: uploadedUrl,
        updatedAt: new Date()
      }
    })

    console.log('MediaPack generate: created/updated media pack:', mediaPack.id)

    // Generate signed share URL with absolute URL safety
    const payload = {
      mp: mediaPack.id,
      exp: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
    }
    const token = signPayload(payload, '30d')
    const shareUrlRelative = `/media-pack/view?mp=${mediaPack.id}&sig=${encodeURIComponent(token)}`;
    const shareUrl = new URL(shareUrlRelative, origin).toString();

    console.log('MediaPack generate: generated share URL')

    // Return PDF as download
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'X-PDF-URL': uploadedUrl,
        'X-Share-URL': shareUrl
      }
    })
  } catch (error: any) {
    // Add structured logging for debugging
    console.error('mp.generate.error', { 
      message: error?.message,
      stack: error?.stack,
      name: error?.name 
    });
    
    return NextResponse.json({ error: 'Failed to generate media pack PDF' }, { status: 500 })
  }
}
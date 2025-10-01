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
export const maxDuration = 120;

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
    
    // Determine renderer path based on request body
    if (html && typeof html === 'string') {
      // HTML mode - direct rendering
      console.log('[media-pack/generate] using HTML mode');
      try {
        const pdf = await renderPdf(html);
        return new Response(pdf, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${fileName}.pdf"`
          }
        });
      } catch (err) {
        console.error('[media-pack/generate] render error', {
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined
        });
        return NextResponse.json({ error: 'Failed to generate media pack PDF' }, { status: 500 });
      }
    } else if (url && typeof url === 'string') {
      // URL mode - compute absolute URL and render
      console.log('[media-pack/generate] using URL mode');
      try {
        const hs = await headers();
        const proto = hs.get('x-forwarded-proto') || 'https';
        const host = hs.get('x-forwarded-host') || hs.get('host');
        const origin = host ? `${proto}://${host}` : env.APP_URL;
        const absUrl = new URL(url, origin).toString();
        
        const pdf = await renderPdfFromUrl(absUrl);
        return new Response(pdf, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${fileName}.pdf"`
          }
        });
      } catch (err) {
        console.error('[media-pack/generate] render error', {
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined
        });
        return NextResponse.json({ error: 'Failed to generate media pack PDF' }, { status: 500 });
      }
    } else {
      // Neither HTML nor URL provided
      return NextResponse.json({ error: 'html_or_url_required' }, { status: 400 });
    }
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
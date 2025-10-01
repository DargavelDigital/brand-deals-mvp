export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

import { renderPdf } from '@/services/mediaPack/renderer';
import chromium from '@sparticuz/chromium';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const exec = await chromium.executablePath().catch(() => null);
    const proto = headers().get('x-forwarded-proto') || 'https';
    const host = headers().get('x-forwarded-host') || headers().get('host') || 'localhost:3000';
    const origin = `${proto}://${host}`;
    
    const html = '<html><body><h1>PDF OK</h1><p>Self-test</p></body></html>'
    const pdf = await renderPdf(html)
    
    return NextResponse.json({
      ok: true,
      check: 'PDF OK',
      exec: exec ? exec.split('/').slice(-1)[0] : null,
      origin,
    });
  } catch (err) {
    console.error('[media-pack/selftest] error', err)
    return NextResponse.json({ ok: false, error: 'selftest_failed' }, { status: 500 })
  }
}

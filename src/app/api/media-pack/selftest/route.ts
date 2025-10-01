export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

import { renderPdf } from '@/services/mediaPack/renderer';

export async function GET() {
  try {
    const html = '<html><body><h1>PDF OK</h1><p>Self-test</p></body></html>'
    const pdf = await renderPdf(html)
    return new Response(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="selftest.pdf"'
      }
    })
  } catch (err) {
    console.error('[media-pack/selftest] error', err)
    return Response.json({ ok: false, error: 'selftest_failed' }, { status: 500 })
  }
}

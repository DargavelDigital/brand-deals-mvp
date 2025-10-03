export async function generatePdf(html: string): Promise<Buffer> {
  const runtime = (process.env.PDF_RUNTIME || '').toLowerCase() || (process.env.VERCEL ? 'vercel' : 'local')
  if (runtime === 'vercel') {
    const mod = await import('./vercel-pdf')
    return mod.generatePdf(html)
  }
  if (runtime === 'netlify') {
    const mod = await import('./netlify-pdf')
    return mod.generatePdf(html)
  }
  // local dev fallback — try installed Chrome or full Puppeteer if your old local code exists
  const mod = await import('./vercel-pdf')
  return mod.generatePdf(html)
}

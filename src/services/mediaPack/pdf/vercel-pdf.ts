import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'

export async function generatePdf(html: string): Promise<Buffer> {
  const executablePath =
    process.env.CHROME_EXECUTABLE_PATH || (await chromium.executablePath())

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: true,
  })
  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '16mm', right: '12mm', bottom: '16mm', left: '12mm' }
    })
    return Buffer.from(pdf)
  } finally {
    await browser.close()
  }
}

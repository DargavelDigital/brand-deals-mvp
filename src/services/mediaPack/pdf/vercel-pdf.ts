import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'

export async function generatePdf(html: string): Promise<Buffer> {
  let executablePath: string
  
  // For local development, try to use system Chrome first
  if (process.env.NODE_ENV === 'development' || !process.env.VERCEL) {
    const systemChrome = process.platform === 'darwin' 
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : process.platform === 'win32'
      ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
      : '/usr/bin/google-chrome'
    
    try {
      // Try system Chrome first
      executablePath = systemChrome
    } catch (error) {
      // Fall back to Chromium
      executablePath = process.env.CHROME_EXECUTABLE_PATH || (await chromium.executablePath())
    }
  } else {
    // For Vercel, use Chromium
    executablePath = process.env.CHROME_EXECUTABLE_PATH || (await chromium.executablePath())
  }

  const browser = await puppeteer.launch({
    args: process.env.VERCEL ? chromium.args : [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ],
    defaultViewport: process.env.VERCEL ? chromium.defaultViewport : { width: 1200, height: 800 },
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

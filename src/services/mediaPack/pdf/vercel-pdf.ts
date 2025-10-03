import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'

export async function generatePdf(html: string): Promise<Buffer> {
  let executablePath: string
  let browser: any = null
  
  try {
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

    console.log('Launching browser with executable:', executablePath)
    
    browser = await puppeteer.launch({
      args: process.env.VERCEL ? chromium.args : [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ],
      defaultViewport: process.env.VERCEL ? chromium.defaultViewport : { width: 1200, height: 800 },
      executablePath,
      headless: true,
      timeout: 30000, // 30 second timeout
    })
    
    const page = await browser.newPage()
    
    // Set viewport for consistent rendering
    await page.setViewport({ 
      width: 1200, 
      height: 800, 
      deviceScaleFactor: 2 
    })
    
    // Set content with timeout
    await page.setContent(html, { 
      waitUntil: 'networkidle0',
      timeout: 15000 
    })
    
    // Wait a bit for any dynamic content
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('Generating PDF...')
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { 
        top: '16mm', 
        right: '12mm', 
        bottom: '16mm', 
        left: '12mm' 
      },
      preferCSSPageSize: true,
      displayHeaderFooter: false
    })
    
    console.log('PDF generated successfully, size:', pdf.length)
    return Buffer.from(pdf)
    
  } catch (error) {
    console.error('PDF generation error:', error)
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  } finally {
    if (browser) {
      try {
        await browser.close()
        console.log('Browser closed successfully')
      } catch (closeError) {
        console.error('Error closing browser:', closeError)
      }
    }
  }
}

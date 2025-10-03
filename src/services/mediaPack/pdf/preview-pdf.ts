import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'

export async function generateMediaPackPDFFromPreview(previewUrl: string): Promise<Buffer> {
  let browser: any = null
  
  try {
    // For local development, try to use system Chrome first
    let executablePath: string
    if (process.env.NODE_ENV === 'development' || !process.env.VERCEL) {
      const systemChrome = process.platform === 'darwin' 
        ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        : process.platform === 'win32'
        ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        : '/usr/bin/google-chrome'
      
      try {
        executablePath = systemChrome
      } catch (error) {
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
      timeout: 30000,
    })
    
    const page = await browser.newPage()
    
    // Set viewport for consistent rendering
    await page.setViewport({ 
      width: 1200, 
      height: 800, 
      deviceScaleFactor: 2 
    })
    
    console.log('Navigating to preview URL:', previewUrl)
    
    // Navigate to the preview URL
    await page.goto(previewUrl, { 
      waitUntil: 'networkidle0',
      timeout: 15000 
    })
    
    // Wait a bit for any dynamic content to load
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log('Generating PDF from preview...')
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
    
    console.log('PDF generated successfully from preview, size:', pdf.length)
    return Buffer.from(pdf)
    
  } catch (error) {
    console.error('Preview PDF generation error:', error)
    throw new Error(`Preview PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
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

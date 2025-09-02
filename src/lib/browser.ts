import { chromium, Browser } from 'playwright'

let browser: Browser | null = null

export async function getBrowser(): Promise<Browser> {
  if (browser && browser.isConnected()) {
    return browser
  }

  try {
    // Primary: Try Playwright with standard launch
    browser = await chromium.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    })
    
    console.log('Browser launched successfully with Playwright')
    return browser
  } catch (error) {
    console.warn('Primary browser launch failed:', error)
    
    try {
      // Fallback: Try with executablePath for Netlify/Lambda environments
      const executablePath = process.env.CHROME_EXECUTABLE_PATH || 
                           process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
                           '/opt/chrome/chrome' // Netlify default
      
      browser = await chromium.launch({
        executablePath,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--single-process'
        ]
      })
      
      console.log('Browser launched successfully with fallback executablePath')
      return browser
    } catch (fallbackError) {
      console.error('All browser launch attempts failed:', fallbackError)
      throw new Error('Failed to launch browser for PDF generation')
    }
  }
}

export async function closeBrowser(): Promise<void> {
  if (browser && browser.isConnected()) {
    await browser.close()
    browser = null
  }
}

// Cleanup on process exit
if (typeof process !== 'undefined') {
  process.on('exit', closeBrowser)
  process.on('SIGINT', closeBrowser)
  process.on('SIGTERM', closeBrowser)
}

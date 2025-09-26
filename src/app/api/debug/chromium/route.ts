import { NextRequest, NextResponse } from 'next/server'
import { getChromium } from '@/lib/chromium'
import { log } from '@/lib/log'
import { withRequestContext } from '@/lib/with-request-context'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function handleGET(req: NextRequest) {
  try {
    log.info('Chromium debug check started', { feature: 'debug-chromium' })
    
    // Get Chromium configuration
    const chromiumConfig = getChromium()
    const isAvailable = chromiumConfig.executablePath !== undefined
    
    // Check if puppeteer-core is available
    let hasPuppeteerCore = false
    try {
      require('puppeteer-core')
      hasPuppeteerCore = true
    } catch (error) {
      hasPuppeteerCore = false
    }
    
    const result = {
      chromium: chromiumConfig,
      hasPuppeteerCore
    }
    
    log.info('Chromium debug check completed', {
      feature: 'debug-chromium',
      available: isAvailable,
      executablePath: chromiumConfig.executablePath,
      hasPuppeteerCore
    })
    
    // If executablePath is undefined, return 200 with note about stub-only mode
    if (!isAvailable) {
      return NextResponse.json({
        ok: true,
        chromium: chromiumConfig,
        hasPuppeteerCore,
        note: 'stub-only'
      })
    }
    
    return NextResponse.json({
      ok: true,
      chromium: chromiumConfig,
      hasPuppeteerCore
    })
    
  } catch (error) {
    log.error('Chromium debug check failed', {
      feature: 'debug-chromium',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    return NextResponse.json({
      ok: false,
      error: 'Debug check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export const GET = withRequestContext(handleGET)

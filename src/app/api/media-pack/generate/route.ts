import { NextRequest, NextResponse } from 'next/server'
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo';
import { flags } from '@/lib/flags'
import { prisma } from '@/lib/prisma'
import { MediaPackInput, defaultTheme } from '@/services/mediaPack/types'
import { signPayload } from '@/lib/signing'
import { nanoid } from 'nanoid'
import { env } from '@/lib/env'

// PDF generation dependencies (imported on demand)

export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    console.log('MediaPack generate: checking feature flag...')
    if (!flags.mediapackV2) {
      console.log('MediaPack generate: feature flag disabled')
      return NextResponse.json({ error: 'mediapack.v2 disabled' }, { status: 403 })
    }
    console.log('MediaPack generate: feature flag enabled')

    const workspaceId = await requireSessionOrDemo(req)
    console.log('MediaPack generate: requireSessionOrDemo returned workspaceId:', workspaceId)
    
    const body = (await req.json()) as MediaPackInput
    const { variant, brandIds } = body
    if (!variant || !brandIds?.length) {
      return NextResponse.json({ error: 'variant, brandIds required' }, { status: 400 })
    }

    // Look up the real workspace ID if we're using a slug
    let realWorkspaceId = workspaceId
    console.log('MediaPack generate: initial realWorkspaceId:', realWorkspaceId)
    
    // If no workspaceId was returned, try to find the demo workspace
    if (!realWorkspaceId) {
      console.log('MediaPack generate: no workspaceId returned, looking for demo workspace')
      const demoWorkspace = await prisma.workspace.findUnique({
        where: { slug: 'demo-workspace' },
        select: { id: true }
      })
      if (demoWorkspace) {
        realWorkspaceId = demoWorkspace.id
        console.log('MediaPack generate: found demo workspace, using ID:', realWorkspaceId)
      } else {
        console.log('MediaPack generate: demo workspace not found, creating one')
        // Create a demo workspace if it doesn't exist
        const newDemoWorkspace = await prisma.workspace.create({
          data: {
            slug: 'demo-workspace',
            name: 'Demo Workspace',
            type: 'CREATOR'
          }
        })
        realWorkspaceId = newDemoWorkspace.id
        console.log('MediaPack generate: created new demo workspace with ID:', realWorkspaceId)
      }
    } else if (workspaceId === 'demo-workspace') {
      const workspace = await prisma.workspace.findUnique({
        where: { slug: 'demo-workspace' },
        select: { id: true }
      })
      if (workspace) {
        realWorkspaceId = workspace.id
        console.log('MediaPack generate: using real workspace ID:', realWorkspaceId)
      } else {
        console.log('MediaPack generate: demo workspace not found, using provided ID')
      }
    }
    
    console.log('MediaPack generate: final realWorkspaceId:', realWorkspaceId)
    
    // Ensure we have a valid workspace ID
    if (!realWorkspaceId) {
      console.error('MediaPack generate: no valid workspace ID found')
      return NextResponse.json({ error: 'No valid workspace ID found' }, { status: 400 })
    }

    console.log('MediaPack generate: input validated, creating payload...')

    // Get workspace information for brand logo
    const workspace = await prisma.workspace.findUnique({
      where: { id: realWorkspaceId },
      select: { name: true, slug: true }
    })

    // TODO: fetch real audit + brand insights; use AI for summary if includeAISummary
    const payload = {
      variant,
      theme: { ...defaultTheme, ...(body.theme || {}) },
      summary: 'Your audience is primed for partnerships in tech & lifestyle. Strong US/UK base and above-average ER.',
      audience: { followers: 156000, engagement: 0.053, topGeo: ['US','UK','CA'] },
      brands: [{ name: 'Acme Co', reasons: ['Audience overlap', 'Content affinity'], website: 'https://acme.com' }],
      coverQR: undefined as string | undefined,
      brand: workspace ? { name: workspace.name, domain: workspace.slug + '.com' } : { name: 'Demo Creator', domain: 'demo.com' },
    }
    // Create share token for the media pack
    const shareToken = nanoid(24)
    
    // Save to database first to get the ID
    const saved = await prisma.mediaPack.create({
      data: {
        id: nanoid(),
        workspaceId: realWorkspaceId,
        variant,
        theme: payload.theme as any,
        brandIds,
        htmlUrl: '',
        pdfUrl: '',
        shareToken,
      },
      select: { id: true }
    })

    const token = signPayload(payload, '15m')
    const appUrl = env.APP_URL
    const viewUrl = `${appUrl}/media-pack/view?mp=${saved.id}&token=${encodeURIComponent(token)}`

    console.log('MediaPack generate: view URL created:', viewUrl)

    // Prepare filesystem target (local simple store)
    const id = saved.id
    const htmlPath = `public/media-packs/${id}.html`
    const pdfPath = `public/media-packs/${id}.pdf`
    const htmlUrl = `/media-packs/${id}.html`
    const pdfUrl = `/media-packs/${id}.pdf`

    console.log('MediaPack generate: rendering HTML...')

    // Render HTML (fetch and save)
    const htmlRes = await fetch(viewUrl, { cache: 'no-store' })
    if (!htmlRes.ok) {
      throw new Error(`Failed to fetch preview: ${htmlRes.status} ${htmlRes.statusText}`)
    }
    const html = await htmlRes.text()
    
    console.log('MediaPack generate: HTML fetched, writing to file...')

    // Use dynamic import for fs to avoid runtime issues
    try {
      const fs = await import('fs/promises')
      await fs.mkdir('public/media-packs', { recursive: true })
      await fs.writeFile(htmlPath, html, 'utf8')
      console.log('MediaPack generate: HTML file written')
    } catch (fsError) {
      console.error('MediaPack generate: fs error:', fsError)
      // Fallback: try to use require
      try {
        const fs = require('fs')
        if (!fs.existsSync('public/media-packs')) {
          fs.mkdirSync('public/media-packs', { recursive: true })
        }
        fs.writeFileSync(htmlPath, html, 'utf8')
        console.log('MediaPack generate: HTML file written (fallback)')
      } catch (fallbackError) {
        console.error('MediaPack generate: fallback fs error:', fallbackError)
        throw new Error('Failed to write HTML file')
      }
    }

    console.log('MediaPack generate: launching browser...')

    // Try Playwright first, fallback to Puppeteer + @sparticuz/chromium
    let browser
    let pdfBuffer: Buffer
    
    try {
      // Try Playwright on demand
      const { chromium: pwChromium } = await import('playwright')
      console.log('MediaPack generate: using Playwright')
      
      browser = await pwChromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--single-process',
          '--no-zygote'
        ]
      })
      
      const page = await browser.newPage({ viewport: { width: 1240, height: 1754 } })
      await page.goto(viewUrl, { waitUntil: 'networkidle', timeout: 60000 })
      await page.emulateMedia({ media: 'print' })
      
      pdfBuffer = await page.pdf({
        printBackground: true,
        preferCSSPageSize: true,
        landscape: false,
        scale: 1.5,
        margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' }
      })
      
      console.log('MediaPack generate: PDF generated successfully with Playwright')
    } catch (playwrightError) {
      console.error('MediaPack generate: Playwright failed, trying Puppeteer fallback:', playwrightError)
      
      try {
        // Fallback to Puppeteer + @sparticuz/chromium
        const chromiumBin = await import('@sparticuz/chromium')
        const puppeteer = await import('puppeteer-core')
        console.log('MediaPack generate: using Puppeteer + @sparticuz/chromium')
        
        browser = await puppeteer.launch({
          args: chromiumBin.args,
          defaultViewport: chromiumBin.defaultViewport,
          executablePath: await chromiumBin.executablePath,
          headless: chromiumBin.headless,
        })
        
        const page = await browser.newPage()
        await page.goto(viewUrl, { waitUntil: 'networkidle', timeout: 60000 })
        await page.emulateMediaType('print')
        
        pdfBuffer = await page.pdf({
          printBackground: true,
          preferCSSPageSize: true,
          landscape: false,
          scale: 1.5,
          margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' }
        })
        
        console.log('MediaPack generate: PDF generated successfully with Puppeteer')
      } catch (puppeteerError) {
        console.error('MediaPack generate: Puppeteer fallback failed:', puppeteerError)
        throw new Error('Failed to generate PDF with both Playwright and Puppeteer')
      }
    } finally {
      if (browser) {
        await browser.close()
        console.log('MediaPack generate: browser closed')
      }
    }

    // Write PDF to file
    try {
      const fs = await import('fs/promises')
      await fs.writeFile(pdfPath, pdfBuffer)
      console.log('MediaPack generate: PDF file written')
    } catch (fsError) {
      console.error('MediaPack generate: fs error:', fsError)
      // Fallback: try to use require
      try {
        const fs = require('fs')
        fs.writeFileSync(pdfPath, pdfBuffer)
        console.log('MediaPack generate: PDF file written (fallback)')
      } catch (fallbackError) {
        console.error('MediaPack generate: fallback fs error:', fallbackError)
        throw new Error('Failed to write PDF file')
      }
    }

    console.log('MediaPack generate: PDF generated')

    console.log('MediaPack generate: updating database with file URLs...')

    const updated = await prisma.mediaPack.update({
      where: { id },
      data: {
        htmlUrl,
        pdfUrl,
      },
      select: { id: true, htmlUrl: true, pdfUrl: true, variant: true, shareToken: true }
    })

    const shareUrl = `${appUrl}/media-pack/${updated.id}?s=${updated.shareToken}`
    console.log('MediaPack generate: success, returning JSON response')
    
    // Return JSON with media pack data and file URLs
    return NextResponse.json({ 
      mediaPack: {
        ...updated,
        shareUrl
      }
    })
  } catch (err: any) {
    if (err instanceof Response) throw err
    console.error('MediaPack generate error:', err)
    return NextResponse.json({ error: 'Failed to generate media pack', details: err.message }, { status: 500 })
  }
}

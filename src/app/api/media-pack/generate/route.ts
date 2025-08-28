import { NextRequest, NextResponse } from 'next/server'
import { flags } from '@/lib/flags'
import { prisma } from '@/lib/prisma'
import { MediaPackInput, defaultTheme } from '@/services/mediaPack/types'
import { signPayload } from '@/lib/signing'
import { nanoid } from 'nanoid'

// Playwright serverless deps
import chromium from '@sparticuz/chromium'
import { chromium as pwChromium } from 'playwright-core'

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

    const body = (await req.json()) as MediaPackInput
    const { workspaceId, variant, brandIds } = body
    if (!workspaceId || !variant || !brandIds?.length) {
      return NextResponse.json({ error: 'workspaceId, variant, brandIds required' }, { status: 400 })
    }

    // Look up the real workspace ID if we're using a slug
    let realWorkspaceId = workspaceId
    if (workspaceId === 'demo-workspace') {
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

    console.log('MediaPack generate: input validated, creating payload...')

    // TODO: fetch real audit + brand insights; use AI for summary if includeAISummary
    const payload = {
      variant,
      theme: { ...defaultTheme, ...(body.theme || {}) },
      summary: 'Your audience is primed for partnerships in tech & lifestyle. Strong US/UK base and above-average ER.',
      audience: { followers: 156000, engagement: 0.053, topGeo: ['US','UK','CA'] },
      brands: [{ name: 'Acme Co', reasons: ['Audience overlap', 'Content affinity'], website: 'https://acme.com' }],
      coverQR: undefined as string | undefined,
    }
    const token = signPayload(payload, '15m')
    const appUrl = process.env.APP_URL || 'http://localhost:3000'
    const previewUrl = `${appUrl}/media-pack/preview?t=${encodeURIComponent(token)}`

    console.log('MediaPack generate: preview URL created:', previewUrl)

    // Prepare filesystem target (local simple store)
    const id = nanoid()
    const htmlPath = `public/media-packs/${id}.html`
    const pdfPath = `public/media-packs/${id}.pdf`
    const htmlUrl = `/media-packs/${id}.html`
    const pdfUrl = `/media-packs/${id}.pdf`

    console.log('MediaPack generate: rendering HTML...')

    // Render HTML (fetch and save)
    const htmlRes = await fetch(previewUrl, { cache: 'no-store' })
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

    // Launch headless chromium (serverless-friendly)
    let browser
    try {
      const execPath = await chromium.executablePath()
      console.log('MediaPack generate: chromium executable path:', execPath)
      
      browser = await pwChromium.launch({
        args: [
          ...chromium.args,
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--single-process',
          '--no-zygote'
        ],
        executablePath: execPath,
        headless: true,
      })
      console.log('MediaPack generate: browser launched successfully')
    } catch (browserError) {
      console.error('MediaPack generate: browser launch error:', browserError)
      // Fallback: try without executable path
      try {
        browser = await pwChromium.launch({
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--single-process',
            '--no-zygote'
          ],
          headless: true,
        })
        console.log('MediaPack generate: browser launched with fallback')
      } catch (fallbackError) {
        console.error('MediaPack generate: fallback browser launch error:', fallbackError)
        throw new Error('Failed to launch browser for PDF generation')
      }
    }

    try {
      const page = await browser.newPage({ viewport: { width: 1240, height: 1754 } }) // A4-ish at 96dpi
      await page.goto(previewUrl, { waitUntil: 'networkidle' })
      await page.emulateMedia({ media: 'print' })
      await page.pdf({
        path: pdfPath,
        printBackground: true,
        scale: 1,
        margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
        preferCSSPageSize: true,
      })
      console.log('MediaPack generate: PDF generated successfully')
    } finally {
      await browser.close()
      console.log('MediaPack generate: browser closed')
    }

    console.log('MediaPack generate: PDF generated')

    // Create share token
    const shareToken = nanoid(24)

    console.log('MediaPack generate: saving to database...')

    const saved = await prisma.mediaPack.create({
      data: {
        id,
        workspaceId: realWorkspaceId,
        variant,
        theme: payload.theme as any,
        brandIds,
        htmlUrl,
        pdfUrl,
        shareToken,
      },
      select: { id: true, htmlUrl: true, pdfUrl: true, variant: true, shareToken: true }
    })

    const shareUrl = `${appUrl}/media-pack/${saved.id}?s=${saved.shareToken}`
    console.log('MediaPack generate: success, returning response')
    return NextResponse.json({ mediaPack: { ...saved, shareUrl } })
  } catch (err: any) {
    console.error('MediaPack generate error:', err)
    return NextResponse.json({ error: 'Failed to generate media pack', details: err.message }, { status: 500 })
  }
}

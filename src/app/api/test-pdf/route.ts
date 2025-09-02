import { NextRequest, NextResponse } from 'next/server'
import { createDemoMediaPackData } from '@/lib/mediaPack/demoData'
import { getBrowser } from '@/lib/browser'

export async function GET(req: NextRequest) {
  try {
    console.log('🧪 Testing PDF generation...')
    
    // Create demo data
    const demoData = createDemoMediaPackData()
    const variant = req.nextUrl.searchParams.get('variant') || 'classic'
    const dark = req.nextUrl.searchParams.get('dark') === 'true'
    
    const testData = {
      ...demoData,
      theme: {
        variant: variant as 'classic' | 'bold' | 'editorial',
        dark,
        brandColor: '#3b82f6'
      }
    }
    
    // Create simple HTML template
    console.log('📝 Creating HTML template...')
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Test Media Pack</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .content { max-width: 800px; margin: 0 auto; }
        </style>
      </head>
      <body>
        <div class="content">
          <div class="header">
            <h1>${testData.creator.name}'s Media Pack</h1>
            <p>Variant: ${variant}, Dark: ${dark}</p>
          </div>
          <p>This is a test PDF generation for the media pack system.</p>
        </div>
      </body>
      </html>
    `
    
    // Generate PDF
    console.log('🖨️ Generating PDF...')
    const browser = await getBrowser()
    const page = await browser.newPage()
    
    await page.setContent(html, { waitUntil: 'networkidle' })
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      scale: 1.0,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      displayHeaderFooter: false
    })
    
    await page.close()
    
    const filename = `test-media-pack-${variant}${dark ? '-dark' : ''}.pdf`
    
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    })
    
  } catch (error) {
    console.error('❌ PDF generation test failed:', error)
    return NextResponse.json({ 
      error: 'PDF generation test failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

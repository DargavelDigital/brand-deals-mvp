import { NextRequest } from 'next/server'
import { generatePdf } from '@/services/mediaPack/pdf'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { html } = await req.json()
    
    if (!html) {
      return new Response(JSON.stringify({ error: 'HTML content required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log('Generating PDF with Vercel adapter...')
    const pdfBuffer = await generatePdf(html)
    console.log('PDF generated successfully, size:', pdfBuffer.length)
    
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="test.pdf"',
        'Cache-Control': 'no-store'
      }
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return new Response(JSON.stringify({ 
      error: 'PDF generation failed', 
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

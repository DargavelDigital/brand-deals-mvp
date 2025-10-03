import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/signing'
import { defaultTheme } from '@/services/mediaPack/types'
import { generateMediaPackPDFFromPreview } from '@/services/mediaPack/pdf/preview-pdf'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()
    
    if (!token) {
      return NextResponse.json({ ok: false, error: 'Token required' }, { status: 400 })
    }

    // Verify the token to get the exact data used in the preview
    const data = verifyToken(token)
    if (!data) {
      return NextResponse.json({ ok: false, error: 'Invalid token' }, { status: 400 })
    }

    console.log('Captured preview data:', data)

    // Use the original token for the preview URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
    const previewUrl = `${baseUrl}/media-pack/preview?t=${encodeURIComponent(token)}`
    
    console.log('Generating PDF from preview URL:', previewUrl)

    // Generate PDF by capturing the actual preview page
    const pdfBuffer = await generateMediaPackPDFFromPreview(previewUrl)
    
    console.log('PDF generated from preview URL, size:', pdfBuffer.length)
    
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="media-pack-preview.pdf"',
        'Cache-Control': 'no-store'
      }
    })
  } catch (error) {
    console.error('Preview capture error:', error)
    return NextResponse.json({ 
      ok: false, 
      error: 'Failed to capture preview', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

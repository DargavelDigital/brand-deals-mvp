import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/signing'
import { defaultTheme } from '@/services/mediaPack/types'
import { generateMediaPackPDFWithReactPDF } from '@/services/mediaPack/pdf/reactpdf-generator'

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

    // Use the exact same data structure as the preview
    const theme = { ...defaultTheme, ...(data.theme || {}) }
    
    // Create the exact same props that the preview uses
    const props = {
      theme,
      summary: data.summary || 'Your audience is primed for partnerships in tech & lifestyle. Strong US/UK base and above-average ER.',
      audience: data.audience || { followers: 156000, engagement: 0.053, topGeo: ['US','UK','CA'] },
      brands: data.brands || [{ name: 'Acme Co', reasons: ['Audience overlap', 'Content affinity'], website: 'https://acme.com' }],
      coverQR: data.coverQR,
      brand: data.brand || { name: 'Example Creator', domain: 'example.com' },
      creator: data.creator || { displayName: 'Sarah Johnson', tagline: 'Lifestyle Creator • Tech Enthusiast • Storyteller' },
      metrics: data.metrics || [
        { key: 'followers', label: 'Followers', value: '1.2M' },
        { key: 'engagement', label: 'Engagement', value: '4.8%' },
        { key: 'topGeo', label: 'Top Geo', value: 'US/UK' }
      ],
      cta: data.cta || { bookUrl: '#', proposalUrl: '#' }
    }

    // Generate PDF using the exact same data as the preview
    const pdfBuffer = await generateMediaPackPDFWithReactPDF(props, theme, data.variant || 'classic')
    
    console.log('PDF generated from preview data, size:', pdfBuffer.length)
    
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

import { NextRequest, NextResponse } from 'next/server'
import { generateMediaPackPDFWithHTML } from '@/services/mediaPack/pdf/html-generator'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  try {
    const testData = {
      creator: { displayName: 'Alex Rodriguez', tagline: 'Fitness Influencer • Health Coach • 500K Followers' },
      summary: 'Alex Rodriguez is a certified personal trainer and nutritionist with over 500K engaged followers. His content focuses on sustainable fitness, healthy eating, and lifestyle transformation. He has worked with major fitness brands and has a highly engaged audience in the 25-45 age range.',
      audience: { followers: 485000, engagement: 0.067, topGeo: ['US','CA','AU'] },
      brands: [
        { name: 'Nike', reasons: ['Perfect brand alignment', 'Target audience match', 'Content quality'], website: 'https://nike.com' },
        { name: 'MyFitnessPal', reasons: ['Health focus', 'Audience overlap'], website: 'https://myfitnesspal.com' }
      ],
      metrics: [
        { key: 'followers', label: 'Followers', value: '485K' },
        { key: 'engagement', label: 'Engagement', value: '6.7%' },
        { key: 'topGeo', label: 'Top Geo', value: 'US/CA/AU' }
      ],
      cta: { bookUrl: 'https://calendly.com/alex-rodriguez', proposalUrl: 'https://alexrodriguez.com/partnerships' }
    }

    const themeData = {
      brandColor: '#e11d48',
      dark: false,
      variant: 'classic',
      onePager: false
    }
    
    const htmlBuffer = await generateMediaPackPDFWithHTML(testData, themeData, 'classic')
    
    return new Response(htmlBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': 'inline; filename="test-html.html"',
        'Cache-Control': 'no-store'
      }
    })
  } catch (error) {
    console.error('HTML test error:', error)
    return NextResponse.json({ 
      error: 'HTML generation failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

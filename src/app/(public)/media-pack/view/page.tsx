import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/signing'
import { prisma } from '@/lib/prisma'
import { MPClassic } from '../_components/MPClassic'
import { MPBold } from '../_components/MPBold'
import { MPEditorial } from '../_components/MPEditorial'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const mpId = searchParams.get('mp')
    const token = searchParams.get('token')

    if (!mpId || !token) {
      return new NextResponse('Missing required parameters', { status: 400 })
    }

    // Verify the signature
    const payload = verifyToken(token)
    if (!payload) {
      return new NextResponse('Invalid or expired token', { status: 403 })
    }

    // Fetch media pack by ID
    const mediaPack = await prisma.mediaPack.findUnique({
      where: { id: mpId },
      select: {
        id: true,
        variant: true,
        theme: true,
        brandIds: true,
        workspace: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    })

    if (!mediaPack) {
      return new NextResponse('Media pack not found', { status: 404 })
    }

    // Prepare data for rendering
    const brand = {
      name: mediaPack.workspace.name,
      domain: mediaPack.workspace.slug + '.com'
    }

    const creator = {
      displayName: mediaPack.workspace.name,
      tagline: 'Creator • Partnerships • Storytelling'
    }

    const metrics = [
      { key: 'followers', label: 'Followers', value: '156K' },
      { key: 'engagement', label: 'Engagement', value: '5.3%' },
      { key: 'top-geo', label: 'Top Geo', value: 'US, UK, CA' }
    ]

    const cta = {
      bookUrl: 'https://calendly.com/demo-creator',
      proposalUrl: 'mailto:demo@example.com?subject=Partnership Proposal Request'
    }

    const commonProps = {
      theme: mediaPack.theme as any,
      summary: 'Your audience is primed for partnerships in tech & lifestyle. Strong US/UK base and above-average ER.',
      audience: { followers: 156000, engagement: 0.053, topGeo: ['US','UK','CA'] },
      brands: [{ name: 'Acme Co', reasons: ['Audience overlap', 'Content affinity'], website: 'https://acme.com' }],
      brand,
      creator,
      metrics,
      cta,
      preview: false
    }

    // Render the appropriate template
    let template
    switch (mediaPack.variant) {
      case 'classic':
        template = <MPClassic {...commonProps} />
        break
      case 'bold':
        template = <MPBold {...commonProps} />
        break
      case 'editorial':
        template = <MPEditorial {...commonProps} />
        break
      default:
        template = <MPClassic {...commonProps} />
    }

    return new NextResponse(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Media Pack - ${mediaPack.workspace.name}</title>
  <style>
    body { margin: 0; padding: 0; }
  </style>
</head>
<body>
  ${template}
</body>
</html>`,
      {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    )
  } catch (error) {
    console.error('Media pack view error:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}

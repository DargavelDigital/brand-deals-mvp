import { verifyToken } from '@/lib/signing'
import { MPClassic } from '../_components/MPClassic'
import { MPBold } from '../_components/MPBold'
import { MPEditorial } from '../_components/MPEditorial'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function MediaPackView({ searchParams }: { searchParams: Promise<{ mp?: string; token?: string }> }) {
  const resolvedSearchParams = await searchParams
  const mpId = resolvedSearchParams.mp
  const token = resolvedSearchParams.token

  if (!mpId || !token) {
    notFound()
  }

  // Verify the signature
  const payload = verifyToken(token)
  if (!payload) {
    notFound()
  }

  // Lazy import Prisma to avoid build-time issues
  const { prisma } = await import('@/lib/prisma')
  
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
    notFound()
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
  switch (mediaPack.variant) {
    case 'classic':
      return <MPClassic {...commonProps} />
    case 'bold':
      return <MPBold {...commonProps} />
    case 'editorial':
      return <MPEditorial {...commonProps} />
    default:
      return <MPClassic {...commonProps} />
  }
}

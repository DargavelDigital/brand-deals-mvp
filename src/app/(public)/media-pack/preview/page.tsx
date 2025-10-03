import { defaultTheme, ThemeTokens } from '@/services/mediaPack/types'
import { verifyToken } from '@/lib/signing'
import { MPClassic } from '../_components/MPClassic'
import { MPBold } from '../_components/MPBold'
import { MPEditorial } from '../_components/MPEditorial'

export const dynamic = 'force-dynamic'

export default async function PreviewPage({ searchParams }: any) {
  const params = await searchParams
  const token = params?.t as string
  const data = token ? verifyToken<any>(token) : null
  if (!data) return <div>Invalid preview token.</div>

  const theme: ThemeTokens = { ...defaultTheme, ...(data.theme || {}) }
  const props = {
    theme,
    summary: data.summary || 'Your audience is primed for partnerships in tech & lifestyle. Strong US/UK base and above-average ER.',
    audience: data.audience || { followers: 156000, engagement: 0.053, topGeo: ['US','UK','CA'] },
    brands: data.brands || [{ name: 'Acme Co', reasons: ['Audience overlap', 'Content affinity'], website: 'https://acme.com' }],
    coverQR: data.coverQR,
    brand: data.brand || { name: 'Example Creator', domain: 'example.com' },
    creator: data.creator || { displayName: 'Creator Name', tagline: 'Creator • Partnerships • Storytelling' },
    metrics: data.metrics || [
      { key: 'followers', label: 'Followers', value: '1.2M' },
      { key: 'engagement', label: 'Engagement', value: '4.8%' },
      { key: 'topGeo', label: 'Top Geo', value: 'US/UK' }
    ],
    cta: data.cta || { bookUrl: '#', proposalUrl: '#' }
  }

  switch (data.variant as string) {
    case 'bold': return <MPBold {...props} preview={true} />
    case 'editorial': return <MPEditorial {...props} preview={true} />
    default: return <MPClassic {...props} preview={true} />
  }
}

import { prisma } from '@/lib/prisma'
import { MPClassic } from '../_components/MPClassic'
import { MPBold } from '../_components/MPBold'
import { MPEditorial } from '../_components/MPEditorial'
import { defaultTheme, ThemeTokens } from '@/services/mediaPack/types'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function MediaPackShare({ params, searchParams }: any) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  
  const id = resolvedParams.id as string
  const s = resolvedSearchParams?.s as string

  const mp = await prisma.mediaPack.findUnique({ 
    where: { id },
    select: {
      id: true,
      variant: true,
      theme: true,
      shareToken: true,
      htmlUrl: true,
      pdfUrl: true,
      workspace: {
        select: {
          name: true,
          slug: true
        }
      }
    }
  })
  if (!mp) return <div>Not found</div>
  if (!mp.shareToken || mp.shareToken !== s) return <div>Invalid link</div>

  const theme: ThemeTokens = { ...defaultTheme, ...(mp.theme as any || {}) }
  const props = {
    theme,
    summary: 'AI summary coming soon…', // optionally load from db snapshot
    audience: { followers: 156000, engagement: 0.053, topGeo: ['US','UK','CA'] },
    brands: [{ name:'Example Brand', reasons:['Audience fit','Content match'], website:'https://example.com'}],
    brand: {
      name: mp.workspace.name,
      domain: mp.workspace.slug + '.com'
    }
  }

  const Variant = mp.variant === 'bold' ? MPBold : mp.variant === 'editorial' ? MPEditorial : MPClassic

  // Fire-and-forget view track (SSR safe is via route below using img/beacon)
  return (
    <Variant {...props}>
      {/* extra: add footer share or logo */}
      <div style={{marginTop:16}}>
        <Link href="https://hypeandswagger.com" style={{color:'var(--accent)'}}>Powered by HYPER</Link>
      </div>
      <img src={`/api/media-pack/track?mp=${id}&t=${Date.now()}`} alt="" width="1" height="1" />
    </Variant>
  )
}

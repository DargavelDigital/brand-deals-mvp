import { verifyToken } from '@/lib/signing'
import { MediaPackData } from '@/lib/mediaPack/types'
import MPEditorial from '@/components/media-pack/templates/MPEditorial'
import MPClassic from '@/components/media-pack/templates/MPClassic'
import MPBold from '@/components/media-pack/templates/MPBold'

export const dynamic = 'force-dynamic'

export default async function PreviewPage({ searchParams }: any) {
  const params = await searchParams
  const token = params?.t as string
  console.log('Preview page - token received:', token ? 'yes' : 'no')
  console.log('Preview page - token length:', token?.length)
  console.log('Preview page - MEDIA_PACK_SIGNING_SECRET set:', !!process.env.MEDIA_PACK_SIGNING_SECRET)
  
  const data = token ? verifyToken<MediaPackData>(token) : null
  console.log('Preview page - token verification result:', data ? 'success' : 'failed')
  if (!data) return <div>Invalid preview token.</div>

  // Ensure we have all required fields with defaults
  const mediaPackData: MediaPackData = {
    packId: data.packId || 'demo-pack-123',
    workspaceId: data.workspaceId || 'demo-workspace',
    brandContext: data.brandContext || { name: 'Acme Corp', domain: 'acme.com' },
    creator: data.creator || { 
      name: 'Creator Name', 
      tagline: 'Creator • Partnerships • Storytelling',
      logoUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=100&h=100&fit=crop'
    },
    socials: data.socials || [
      { platform: 'instagram', followers: 125000, avgViews: 45000, engagementRate: 0.045, growth30d: 0.08 },
      { platform: 'tiktok', followers: 89000, avgViews: 120000, engagementRate: 0.062, growth30d: 0.15 },
      { platform: 'youtube', followers: 45000, avgViews: 25000, engagementRate: 0.038, growth30d: 0.05 }
    ],
    audience: data.audience || {
      age: [
        { label: '18-24', value: 0.35 },
        { label: '25-34', value: 0.42 },
        { label: '35-44', value: 0.18 },
        { label: '45-54', value: 0.05 }
      ],
      gender: [
        { label: 'Female', value: 0.68 },
        { label: 'Male', value: 0.28 },
        { label: 'Other', value: 0.04 }
      ],
      geo: [
        { label: 'United States', value: 0.45 },
        { label: 'United Kingdom', value: 0.18 },
        { label: 'Canada', value: 0.12 },
        { label: 'Australia', value: 0.08 },
        { label: 'Germany', value: 0.07 }
      ],
      interests: ['Technology', 'Fashion', 'Travel', 'Fitness', 'Food']
    },
    contentPillars: data.contentPillars || [
      'Tech Reviews & Unboxings',
      'Lifestyle & Fashion',
      'Travel & Adventure',
      'Behind-the-Scenes',
      'Product Recommendations'
    ],
    caseStudies: data.caseStudies || [
      {
        brand: { name: 'TechGear Pro', domain: 'techgearpro.com' },
        goal: 'Increase brand awareness among tech enthusiasts',
        work: 'Created 3 unboxing videos and 2 review posts showcasing the latest smartphone features',
        result: 'Generated 2.3M views, 45K engagement, and 12% increase in brand mentions'
      },
      {
        brand: { name: 'StyleCo', domain: 'styleco.com' },
        goal: 'Drive traffic to new fashion collection',
        work: 'Styled and photographed 5 outfits from the collection with lifestyle content',
        result: 'Achieved 1.8M reach with 8.2% engagement rate and 15% click-through to website'
      }
    ],
    services: data.services || [
      { label: 'Instagram Reel + Story', price: 2500, notes: 'Includes 1 Reel + 3 Stories' },
      { label: 'TikTok Video', price: 1800, notes: '30-60 second video' },
      { label: 'YouTube Integration', price: 3500, notes: 'Product placement in existing video' },
      { label: 'Multi-Platform Package', price: 6500, notes: 'Instagram + TikTok + YouTube' }
    ],
    contact: data.contact || {
      email: 'creator@example.com',
      phone: '+1 (555) 123-4567',
      website: 'creator.com',
      socials: [
        { platform: 'Instagram', url: 'https://instagram.com/creator' },
        { platform: 'TikTok', url: 'https://tiktok.com/@creator' },
        { platform: 'YouTube', url: 'https://youtube.com/creator' }
      ]
    },
    ai: data.ai || {
      elevatorPitch: 'I help brands connect with engaged audiences through authentic storytelling and creative content that drives real results.',
      whyThisBrand: 'Your brand aligns perfectly with my audience\'s interests in technology and lifestyle, and I can create content that showcases your products in an authentic, engaging way.',
      highlights: [
        '125K+ engaged followers across Instagram, TikTok, and YouTube',
        'Average 5.2% engagement rate (industry average: 2.1%)',
        'Proven track record with 15+ successful brand partnerships',
        'Strong US/UK audience with high purchasing power',
        'Authentic content style that drives genuine brand affinity'
      ]
    },
    theme: data.theme || {
      variant: 'editorial',
      dark: false,
      brandColor: '#3b82f6',
      onePager: false
    },
    cta: data.cta || {
      meetingUrl: 'https://calendly.com/creator',
      proposalUrl: 'https://creator.com/partnerships'
    }
  }

  switch (data.theme?.variant || 'editorial') {
    case 'bold': return <MPBold data={mediaPackData} isPublic={true} />
    case 'classic': return <MPClassic data={mediaPackData} isPublic={true} />
    default: return <MPEditorial data={mediaPackData} isPublic={true} />
  }
}

'use client'
import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MediaPackData } from '@/lib/mediaPack/types'

export default function MediaPackToolPage() {
  const [variant, setVariant] = useState<'classic' | 'bold' | 'editorial'>('editorial')
  const [brandColor, setBrandColor] = useState('#3b82f6')
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const mediaPackData: MediaPackData = useMemo(() => ({
    packId: 'demo-pack-123',
    workspaceId: 'demo-workspace',
    brandContext: {
      name: 'Acme Corp',
      domain: 'acme.com'
    },
    creator: {
      name: 'Sarah Johnson',
      tagline: 'Lifestyle Creator • Tech Enthusiast • Storyteller',
      headshotUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      logoUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=100&h=100&fit=crop',
      niche: ['Lifestyle', 'Technology', 'Fashion']
    },
    socials: [
      {
        platform: 'instagram',
        followers: 125000,
        avgViews: 45000,
        engagementRate: 0.045,
        growth30d: 0.08
      },
      {
        platform: 'tiktok',
        followers: 89000,
        avgViews: 120000,
        engagementRate: 0.062,
        growth30d: 0.15
      },
      {
        platform: 'youtube',
        followers: 45000,
        avgViews: 25000,
        engagementRate: 0.038,
        growth30d: 0.05
      }
    ],
    audience: {
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
    contentPillars: [
      'Tech Reviews & Unboxings',
      'Lifestyle & Fashion',
      'Travel & Adventure',
      'Behind-the-Scenes',
      'Product Recommendations'
    ],
    caseStudies: [
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
    services: [
      { label: 'Instagram Reel + Story', price: 2500, notes: 'Includes 1 Reel + 3 Stories' },
      { label: 'TikTok Video', price: 1800, notes: '30-60 second video' },
      { label: 'YouTube Integration', price: 3500, notes: 'Product placement in existing video' },
      { label: 'Multi-Platform Package', price: 6500, notes: 'Instagram + TikTok + YouTube' }
    ],
    contact: {
      email: 'sarah@example.com',
      phone: '+1 (555) 123-4567',
      website: 'sarahjohnson.com',
      socials: [
        { platform: 'Instagram', url: 'https://instagram.com/sarahjohnson' },
        { platform: 'TikTok', url: 'https://tiktok.com/@sarahjohnson' },
        { platform: 'YouTube', url: 'https://youtube.com/sarahjohnson' }
      ]
    },
    ai: {
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
    theme: {
      variant,
      dark: false,
      brandColor,
      onePager: false
    },
    cta: {
      meetingUrl: 'https://calendly.com/sarah-johnson',
      proposalUrl: 'https://sarahjohnson.com/partnerships'
    }
  }), [variant, brandColor])

  useEffect(() => {
    const run = async () => {
      const res = await fetch('/api/util/sign', { method:'POST', body: JSON.stringify(mediaPackData) })
      const { t } = await res.json()
      setToken(t)
    }
    run()
  }, [mediaPackData])

  const previewUrl = token ? `/media-pack/preview?t=${encodeURIComponent(token)}` : ''

  const generate = async () => {
    setLoading(true)
    try {
      // Generate a token with the exact preview data
      const tokenRes = await fetch('/api/util/sign', { 
        method:'POST', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(mediaPackData)
      })
      const { t } = await tokenRes.json()
      
      if (!t) {
        throw new Error('Failed to generate preview token')
      }

      // Generate PDF using the exact same data as the preview
      const pdfRes = await fetch('/api/media-pack/capture-preview', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ token: t })
      })
      
      if (!pdfRes.ok) {
        const error = await pdfRes.json()
        throw new Error(error.error || 'Failed to generate PDF')
      }

      // Create blob and download
      const blob = await pdfRes.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `media-pack-${variant}-${Date.now()}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      
      alert('PDF generated successfully!')
    } catch (error: any) {
      alert(error.message || 'Failed to generate PDF')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Media Pack</h1>
          <p className="text-[var(--muted-fg)]">Pick a template, tweak theme, preview, and export PDF.</p>
        </div>
        <Button onClick={generate} disabled={loading}>{loading ? 'Generating…' : 'Generate & Share'}</Button>
      </div>

      <Card className="p-4">
        <div className="flex gap-4 flex-wrap">
          {(['classic','bold','editorial'] as const).map(v => (
            <button key={v}
              className={`px-3 py-2 rounded-md border ${variant===v?'border-[var(--brand-600)]':'border-[var(--border)]'}`}
              onClick={()=>setVariant(v)}
            >
              {v}
            </button>
          ))}
          <div className="grow" />
          <label className="text-sm">Brand Color
            <input type="color" value={brandColor}
              onChange={(e)=>setBrandColor(e.target.value)}
              className="ml-2 align-middle" />
          </label>
        </div>

        <div className="mt-4 border rounded-lg overflow-hidden">
          {previewUrl ? (
            <iframe src={previewUrl} className="w-full h-[900px]" />
          ) : (
            <div className="h-[300px] grid place-items-center text-[var(--muted-fg)]">Preparing preview…</div>
          )}
        </div>
      </Card>
    </div>
  )
}

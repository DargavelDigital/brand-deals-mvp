import { MediaPackData } from './types'

export function createDemoMediaPackData(): MediaPackData {
  return {
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
        brand: { name: 'TechGear Pro', domain: 'techgear.com' },
        goal: 'Increase brand awareness among tech enthusiasts',
        work: 'Created 3 unboxing videos and 2 review posts showcasing the latest smartphone features',
        result: 'Generated 2.3M views, 45K engagement, and 12% increase in brand mentions',
        proof: ['2.3M total views', '45K engagement', '12% brand mention increase']
      },
      {
        brand: { name: 'StyleCo', domain: 'styleco.com' },
        goal: 'Drive traffic to new fashion collection',
        work: 'Styled and photographed 5 outfits from the collection with lifestyle content',
        result: 'Achieved 1.8M reach with 8.2% engagement rate and 15% click-through to website',
        proof: ['1.8M reach', '8.2% engagement rate', '15% CTR to website']
      }
    ],
    services: [
      {
        label: 'Instagram Reel + Story',
        price: 2500,
        notes: 'Includes 1 Reel + 3 Stories',
        sku: 'IG_REEL_STORY'
      },
      {
        label: 'TikTok Video',
        price: 1800,
        notes: '30-60 second video',
        sku: 'TIKTOK_VIDEO'
      },
      {
        label: 'YouTube Integration',
        price: 3500,
        notes: 'Product placement in existing video',
        sku: 'YT_INTEGRATION'
      },
      {
        label: 'Multi-Platform Package',
        price: 6500,
        notes: 'Instagram + TikTok + YouTube',
        sku: 'MULTI_PLATFORM'
      }
    ],
    rateCardNote: 'Rates are for single-use content. Custom packages available upon request.',
    contact: {
      email: 'sarah@example.com',
      phone: '+1 (555) 123-4567',
      website: 'https://sarahjohnson.com',
      socials: [
        { platform: 'Instagram', url: 'https://instagram.com/sarahjohnson' },
        { platform: 'TikTok', url: 'https://tiktok.com/@sarahjohnson' },
        { platform: 'YouTube', url: 'https://youtube.com/@sarahjohnson' }
      ]
    },
    ai: {
      elevatorPitch: 'I help brands connect with engaged audiences through authentic storytelling and creative content that drives real results.',
      whyThisBrand: 'Your brand perfectly aligns with my audience\'s interests in technology and lifestyle. My followers trust my recommendations and actively engage with tech and fashion content.',
      highlights: [
        '125K+ engaged followers across Instagram, TikTok, and YouTube',
        'Average 5.2% engagement rate (industry average: 2.1%)',
        'Proven track record with 15+ successful brand partnerships',
        'Strong US/UK audience with high purchasing power',
        'Authentic content style that drives genuine brand affinity'
      ]
    },
    theme: {
      variant: 'classic',
      dark: false,
      brandColor: '#3b82f6'
    },
    cta: {
      meetingUrl: 'https://calendly.com/sarahjohnson/partnership-call',
      proposalUrl: 'https://sarahjohnson.com/partnership-proposal'
    }
  }
}

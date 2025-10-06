import { verifyToken } from '@/lib/signing'
import { MediaPackData } from '@/lib/mediaPack/types'
import MPEditorial from '@/components/media-pack/templates/MPEditorial'
import MPClassic from '@/components/media-pack/templates/MPClassic'
import MPBold from '@/components/media-pack/templates/MPBold'

export const dynamic = 'force-dynamic'

export default async function PreviewPage({ searchParams }: any) {
  const params = searchParams
  const token = params?.t as string
  const previewId = params?.id as string
  
  let data: MediaPackData | null = null
  
  if (previewId) {
    // New approach: lookup data by ID
    console.log('Looking up preview data by ID:', previewId);
    try {
      const { prisma } = await import('@/lib/prisma');
      const mediaPack = await prisma().mediaPack.findUnique({
        where: { id: previewId },
        select: { payload: true, theme: true }
      });
      
      if (mediaPack?.payload) {
        data = mediaPack.payload as MediaPackData;
        console.log('Preview data found in database');
      } else {
        console.log('Preview data not found in database');
      }
    } catch (error) {
      console.error('Error looking up preview data:', error);
    }
  } else if (token) {
    // Legacy approach: verify token
    console.log('Received token, length:', token?.length);
    console.log('Received token preview:', token?.substring(0, 50) + '...');
    data = verifyToken<MediaPackData>(token);
    console.log('Token verification result:', data ? 'SUCCESS' : 'FAILED');
  }
  
  if (!data) return <div>Invalid preview data.</div>

  // Use the exact same data structure as your main preview
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

  // Render the exact same component as your main preview with PDF-optimized wrapper
  const PreviewComponent = () => {
    switch (data.theme?.variant || 'editorial') {
      case 'bold': return <MPBold data={mediaPackData} isPublic={true} />
      case 'classic': return <MPClassic data={mediaPackData} isPublic={true} />
      default: return <MPEditorial data={mediaPackData} isPublic={true} />
    }
  }

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Media Pack Preview</title>
        <style dangerouslySetInnerHTML={{
          __html: `
            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              
              body {
                margin: 0;
                padding: 0;
              }
              
              .page-break-before {
                page-break-before: always;
              }
              
              .page-break-after {
                page-break-after: always;
              }
              
              .avoid-break {
                page-break-inside: avoid;
              }
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
              line-height: 1.6;
              color: #000;
              background: #fff;
            }
            .container {
              max-width: 1200px;
              margin: 0 auto;
              padding: 20px;
            }
            /* Ensure all Tailwind classes work */
            .bg-white { background-color: #ffffff !important; }
            .text-black { color: #000000 !important; }
            .text-gray-600 { color: #6b7280 !important; }
            .text-gray-800 { color: #1f2937 !important; }
            .border { border: 1px solid #e5e7eb !important; }
            .rounded-lg { border-radius: 0.5rem !important; }
            .p-6 { padding: 1.5rem !important; }
            .mb-4 { margin-bottom: 1rem !important; }
            .mb-6 { margin-bottom: 1.5rem !important; }
            .text-xl { font-size: 1.25rem !important; }
            .text-2xl { font-size: 1.5rem !important; }
            .text-3xl { font-size: 1.875rem !important; }
            .font-bold { font-weight: 700 !important; }
            .font-semibold { font-weight: 600 !important; }
            .grid { display: grid !important; }
            .flex { display: flex !important; }
            .items-center { align-items: center !important; }
            .justify-center { justify-content: center !important; }
            .space-y-4 > * + * { margin-top: 1rem !important; }
            .space-y-6 > * + * { margin-top: 1.5rem !important; }
            .gap-4 { gap: 1rem !important; }
            .gap-6 { gap: 1.5rem !important; }
            .w-full { width: 100% !important; }
            .h-full { height: 100% !important; }
            .min-h-screen { min-height: 100vh !important; }
            /* Ensure images are visible */
            img {
              max-width: 100%;
              height: auto;
              display: block;
            }
            /* Ensure text is visible */
            p, h1, h2, h3, h4, h5, h6, span, div {
              color: #000000 !important;
            }
          `
        }} />
      </head>
      <body>
        <div className="container avoid-break">
          <PreviewComponent />
        </div>
      </body>
    </html>
  )
}

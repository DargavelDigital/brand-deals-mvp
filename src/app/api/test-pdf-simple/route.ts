import { generateMediaPackPDFWithReactPDF } from '@/services/mediaPack/pdf/reactpdf-generator';
import { NextResponse } from 'next/server';

export async function GET() {
  const testData = {
    creator: {
      name: 'TEST CREATOR',
      tagline: 'This is a test'
    },
    socials: [
      { platform: 'instagram', followers: 999999, avgViews: 50000, engagementRate: 0.05, growth30d: 0.1 }
    ],
    brandContext: {
      name: 'TEST BRAND',
      domain: 'test.com'
    },
    ai: {
      highlights: ['TEST HIGHLIGHT 1', 'TEST HIGHLIGHT 2', 'TEST HIGHLIGHT 3'],
      elevatorPitch: 'This is a test elevator pitch'
    },
    cta: {
      meetingUrl: 'https://test.com',
      proposalUrl: 'https://test.com'
    },
    caseStudies: [
      {
        brand: { name: 'TechGear Pro' },
        goal: 'Increase brand awareness among tech enthusiasts',
        work: 'Created 3 unboxing videos and 2 review posts showcasing the latest smartphone features',
        result: 'Generated 2.3M views, 45K engagement, and 12% increase in brand mentions'
      },
      {
        brand: { name: 'StyleCo' },
        goal: 'Drive traffic to new fashion collection',
        work: 'Styled and photographed 5 outfits from the collection with lifestyle content',
        result: 'Achieved 1.8M reach with 8.2% engagement rate and 15% click-through to website'
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
    ]
  };
  
  console.log('🚀 TEST PDF: Generating with hardcoded data');
  
  const pdf = await generateMediaPackPDFWithReactPDF(
    testData, 
    { brandColor: '#3b82f6', dark: false }, 
    'classic'
  );
  
  console.log('🚀 TEST PDF: Generated successfully, size:', pdf.length);
  
  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="test.pdf"'
    }
  });
}

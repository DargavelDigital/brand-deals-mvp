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
    }
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

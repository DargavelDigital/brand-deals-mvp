import puppeteer from 'puppeteer';
import { renderToString } from 'react-dom/server';
import React from 'react';
import { MPClassic } from '@/app/(public)/media-pack/_components/MPClassic';
import { MPBold } from '@/app/(public)/media-pack/_components/MPBold';
import { MPEditorial } from '@/app/(public)/media-pack/_components/MPEditorial';

export interface MediaPackData {
  creator?: {
    displayName?: string;
    name?: string;
    bio?: string;
    title?: string;
    tagline?: string;
    avatar?: string;
  };
  socials?: {
    platform: string;
    followers: number;
    avgViews?: number;
    engagementRate: number;
    growth30d?: number;
  }[];
  audience?: {
    age?: { label: string; value: number }[];
    gender?: { label: string; value: number }[];
    geo?: { label: string; value: number }[];
    interests?: string[];
  };
  brands?: {
    name: string;
    reasons: string[];
    website: string;
  }[];
  services?: {
    label: string;
    price: number;
    notes: string;
    sku: string;
  }[];
  caseStudies?: {
    brand: { name: string; domain?: string };
    goal: string;
    work: string;
    result: string;
    proof?: string[];
  }[];
  contentPillars?: string[];
  contact?: {
    email?: string;
    phone?: string;
    website?: string;
  };
  ai?: {
    elevatorPitch?: string;
    highlights?: string[];
  };
  brandContext?: {
    name: string;
    domain?: string;
  };
}

export interface ThemeData {
  brandColor: string;
  dark?: boolean;
  variant?: string;
  onePager?: boolean;
}

export async function generateMediaPackHTML(data: any, theme: ThemeData, variant: string = 'classic'): Promise<string> {
  // Transform the data to match what the React components expect
  const transformedData = transformDataForComponents(data, theme);
  
  // Create the appropriate component based on variant
  let Component;
  switch (variant) {
    case 'bold':
      Component = MPBold;
      break;
    case 'editorial':
      Component = MPEditorial;
      break;
    default:
      Component = MPClassic;
  }
  
  // Render the component to HTML string
  const htmlString = renderToString(
    React.createElement(Component, {
      ...transformedData,
      preview: false // Full HTML mode for PDF generation
    })
  );
  
  return htmlString;
}

function transformDataForComponents(data: any, theme: any) {
  const creator = data.creator || {};
  const socials = data.socials || [];
  const audience = data.audience || {};
  const caseStudies = data.caseStudies || [];
  const services = data.services || [];
  const ai = data.ai || {};
  const brandContext = data.brandContext || {};
  const contentPillars = data.contentPillars || [];
  const contact = data.contact || {};
  
  // Calculate total followers and average engagement
  const totalFollowers = socials.reduce((sum: number, social: any) => sum + (social.followers || 0), 0);
  const avgEngagement = socials.length > 0 ? 
    socials.reduce((sum: number, social: any) => sum + (social.engagementRate || 0), 0) / socials.length : 0;
  
  // Get top geo locations
  const topGeo = audience.geo && audience.geo.length > 0 ? 
    audience.geo.slice(0, 3).map((g: any) => g.label) : [];
  
  // Create metrics array for the components
  const metrics = [
    { key: 'followers', label: 'Followers', value: formatNumber(totalFollowers) },
    { key: 'engagement', label: 'Engagement', value: `${(avgEngagement * 100).toFixed(1)}%` },
    { key: 'top-geo', label: 'Top Geo', value: topGeo.join(', ') }
  ];
  
  // Create audience object for components
  const audienceData = {
    followers: totalFollowers,
    engagement: avgEngagement,
    topGeo: topGeo
  };
  
  // Create brands array for components (using case studies as brands)
  const brands = caseStudies.map((study: any) => ({
    name: study.brand.name,
    reasons: [study.goal],
    website: study.brand.domain || ''
  }));
  
  // Create CTA object
  const cta = {
    bookUrl: contact.email ? `mailto:${contact.email}` : '#',
    proposalUrl: contact.website || '#'
  };
  
  return {
    theme: {
      brandColor: theme?.brandColor || '#3b82f6',
      accent: theme?.brandColor || '#3b82f6',
      surface: theme?.dark ? '#1f2937' : '#ffffff',
      text: theme?.dark ? '#ffffff' : '#0b0b0c'
    },
    summary: ai.elevatorPitch || 'Your audience is primed for partnerships in tech & lifestyle. Strong US/UK base and above-average engagement rate.',
    audience: audienceData,
    brands: brands,
    brand: brandContext,
    creator: {
      displayName: creator.name || creator.displayName,
      tagline: creator.tagline
    },
    metrics: metrics,
    cta: cta
  };
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export async function generateMediaPackPDFWithPuppeteer(data: any, theme: ThemeData, variant: string = 'classic'): Promise<Buffer> {
  let browser;
  
  try {
    // Generate HTML from React components directly (server-side)
    const htmlContent = await generateMediaPackHTML(data, theme, variant);
    
    // Launch Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set viewport for consistent rendering
    await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 2 });
    
    // Set content
    await page.setContent(htmlContent, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Wait for any dynamic content to load
    await page.waitForTimeout(2000);
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      },
      preferCSSPageSize: true,
      displayHeaderFooter: false
    });
    
    return Buffer.from(pdfBuffer);
    
  } catch (error) {
    console.error('Puppeteer PDF generation error:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

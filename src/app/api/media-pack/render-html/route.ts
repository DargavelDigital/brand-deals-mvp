import { NextRequest, NextResponse } from "next/server";
import { renderToString } from "react-dom/server";
import React from "react";
import { MPClassic } from '@/app/(public)/media-pack/_components/MPClassic';
import { MPBold } from '@/app/(public)/media-pack/_components/MPBold';
import { MPEditorial } from '@/app/(public)/media-pack/_components/MPEditorial';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data, theme, variant = 'classic' } = body;

    if (!data) {
      return NextResponse.json({ ok: false, error: "data required" }, { status: 400 });
    }

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
    
    return NextResponse.json({ ok: true, html: htmlString });
    
  } catch (error: any) {
    console.error('HTML rendering error:', error);
    return NextResponse.json({ ok: false, error: error.message || "HTML rendering failed" }, { status: 500 });
  }
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

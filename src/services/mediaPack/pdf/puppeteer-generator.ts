import puppeteer from 'puppeteer-core';
import { generateMediaPackPDFWithReactPDF } from './reactpdf-generator';

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
  // For ReactPDF, we don't need HTML generation - we'll use the PDF directly
  // This function is kept for compatibility but will not be used
  return generateSimpleHTMLTemplate(data, theme, variant);
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

function generateSimpleHTMLTemplate(data: any, theme: ThemeData, variant: string): string {
  const brandColor = theme?.brandColor || '#3b82f6';
  const isDark = theme?.dark || false;
  
  // Enhanced template with better styling and layout
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Media Pack - ${data.creator?.displayName || 'Creator'}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: ${isDark ? '#ffffff' : '#1a1a1a'};
            background: ${isDark ? '#0f172a' : '#ffffff'};
            font-size: 16px;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 30px;
            min-height: 100vh;
        }
        
        .header {
            text-align: center;
            margin-bottom: 50px;
            padding-bottom: 30px;
            border-bottom: 4px solid ${brandColor};
            position: relative;
        }
        
        .header::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 4px;
            background: ${brandColor};
        }
        
        .creator-name {
            font-size: 3rem;
            font-weight: 800;
            color: ${brandColor};
            margin-bottom: 15px;
            letter-spacing: -0.02em;
        }
        
        .tagline {
            font-size: 1.3rem;
            color: ${isDark ? '#cbd5e1' : '#64748b'};
            margin-bottom: 25px;
            font-weight: 300;
        }
        
        .summary {
            font-size: 1.2rem;
            line-height: 1.8;
            margin-bottom: 40px;
            padding: 30px;
            background: ${isDark ? '#1e293b' : '#f8fafc'};
            border-radius: 12px;
            border-left: 6px solid ${brandColor};
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 25px;
            margin-bottom: 50px;
        }
        
        .metric {
            text-align: center;
            padding: 25px;
            background: ${isDark ? '#1e293b' : '#ffffff'};
            border-radius: 12px;
            border: 1px solid ${isDark ? '#334155' : '#e2e8f0'};
            box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s ease;
        }
        
        .metric:hover {
            transform: translateY(-2px);
        }
        
        .metric-value {
            font-size: 2.5rem;
            font-weight: 800;
            color: ${brandColor};
            margin-bottom: 8px;
            line-height: 1;
        }
        
        .metric-label {
            font-size: 0.95rem;
            color: ${isDark ? '#94a3b8' : '#64748b'};
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
        }
        
        .section {
            margin-bottom: 50px;
        }
        
        .section-title {
            font-size: 1.8rem;
            font-weight: 700;
            color: ${brandColor};
            margin-bottom: 25px;
            position: relative;
            padding-bottom: 15px;
        }
        
        .section-title::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 50px;
            height: 3px;
            background: ${brandColor};
        }
        
        .brands-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 25px;
        }
        
        .brand-card {
            padding: 25px;
            background: ${isDark ? '#1e293b' : '#ffffff'};
            border-radius: 12px;
            border: 1px solid ${isDark ? '#334155' : '#e2e8f0'};
            box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
            transition: all 0.2s ease;
        }
        
        .brand-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px -1px rgba(0, 0, 0, 0.15);
        }
        
        .brand-name {
            font-weight: 700;
            color: ${brandColor};
            margin-bottom: 12px;
            font-size: 1.1rem;
        }
        
        .brand-reasons {
            color: ${isDark ? '#cbd5e1' : '#475569'};
            line-height: 1.6;
        }
        
        .cta-section {
            text-align: center;
            margin-top: 60px;
            padding: 40px;
            background: linear-gradient(135deg, ${brandColor} 0%, ${brandColor}dd 100%);
            color: white;
            border-radius: 16px;
            box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.2);
        }
        
        .cta-title {
            font-size: 1.8rem;
            font-weight: 700;
            margin-bottom: 15px;
        }
        
        .cta-text {
            font-size: 1.2rem;
            margin-bottom: 30px;
            opacity: 0.95;
        }
        
        .cta-buttons {
            display: flex;
            gap: 20px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .cta-button {
            display: inline-block;
            padding: 15px 35px;
            background: white;
            color: ${brandColor};
            text-decoration: none;
            border-radius: 8px;
            font-weight: 700;
            font-size: 1.1rem;
            transition: all 0.2s ease;
            box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px -1px rgba(0, 0, 0, 0.2);
        }
        
        .footer {
            margin-top: 50px;
            padding-top: 30px;
            border-top: 1px solid ${isDark ? '#334155' : '#e2e8f0'};
            text-align: center;
            color: ${isDark ? '#94a3b8' : '#64748b'};
            font-size: 0.9rem;
        }
        
        @media print {
            body { 
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .container { 
                max-width: none;
                padding: 20px;
            }
            .cta-button {
                color: ${brandColor} !important;
                background: white !important;
            }
        }
        
        @page {
            margin: 0.5in;
            size: A4;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="creator-name">${data.creator?.displayName || 'Creator Name'}</h1>
            <p class="tagline">${data.creator?.tagline || 'Your tagline here'}</p>
        </div>
        
        <div class="summary">
            ${data.summary || 'Your audience is primed for partnerships in tech & lifestyle. Strong US/UK base and above-average engagement rate.'}
        </div>
        
        <div class="metrics">
            ${data.metrics?.map((metric: any) => `
                <div class="metric">
                    <div class="metric-value">${metric.value}</div>
                    <div class="metric-label">${metric.label}</div>
                </div>
            `).join('') || `
                <div class="metric">
                    <div class="metric-value">1.2M</div>
                    <div class="metric-label">Followers</div>
                </div>
                <div class="metric">
                    <div class="metric-value">4.8%</div>
                    <div class="metric-label">Engagement</div>
                </div>
                <div class="metric">
                    <div class="metric-value">US/UK</div>
                    <div class="metric-label">Top Geo</div>
                </div>
            `}
        </div>
        
        <div class="section">
            <h2 class="section-title">Brand Partnerships</h2>
            <div class="brands-grid">
                ${data.brands?.map((brand: any) => `
                    <div class="brand-card">
                        <div class="brand-name">${brand.name}</div>
                        <div class="brand-reasons">${brand.reasons?.join(', ') || 'Partnership opportunity'}</div>
                    </div>
                `).join('') || `
                    <div class="brand-card">
                        <div class="brand-name">Tech Brands</div>
                        <div class="brand-reasons">Perfect audience alignment for tech products and services</div>
                    </div>
                    <div class="brand-card">
                        <div class="brand-name">Lifestyle Brands</div>
                        <div class="brand-reasons">High engagement with lifestyle and fashion content</div>
                    </div>
                `}
            </div>
        </div>
        
        <div class="cta-section">
            <h2 class="cta-title">Ready to Partner?</h2>
            <p class="cta-text">Let's create something amazing together</p>
            <div class="cta-buttons">
                <a href="${data.cta?.bookUrl || '#'}" class="cta-button">Book a Call</a>
                <a href="${data.cta?.proposalUrl || '#'}" class="cta-button">View Proposal</a>
            </div>
        </div>
        
        <div class="footer">
            <p>Generated on ${new Date().toLocaleDateString()} • Contact for partnership opportunities</p>
        </div>
    </div>
</body>
</html>
  `.trim();
}

export async function generateMediaPackPDFWithPuppeteer(data: any, theme: ThemeData, variant: string = 'classic'): Promise<Buffer> {
  // Use ReactPDF instead of Puppeteer for better compatibility and identical preview matching
  try {
    console.log('Generating PDF with ReactPDF...');
    const pdfBuffer = await generateMediaPackPDFWithReactPDF(data, theme, variant);
    console.log('PDF generated successfully with ReactPDF, size:', pdfBuffer.length);
    return pdfBuffer;
  } catch (error) {
    console.error('ReactPDF generation error:', error);
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

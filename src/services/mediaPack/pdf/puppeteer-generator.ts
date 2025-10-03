import puppeteer from 'puppeteer';

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
  // Transform the data to match what the components expect
  const transformedData = transformDataForComponents(data, theme);
  
  // Generate simple HTML template for PDF generation
  const htmlString = generateSimpleHTMLTemplate(transformedData, theme, variant);
  
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

function generateSimpleHTMLTemplate(data: any, theme: ThemeData, variant: string): string {
  const brandColor = theme?.brandColor || '#3b82f6';
  const isDark = theme?.dark || false;
  
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
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: ${isDark ? '#ffffff' : '#0b0b0c'};
            background: ${isDark ? '#1f2937' : '#ffffff'};
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid ${brandColor};
            padding-bottom: 20px;
        }
        
        .creator-name {
            font-size: 2.5rem;
            font-weight: 700;
            color: ${brandColor};
            margin-bottom: 10px;
        }
        
        .tagline {
            font-size: 1.2rem;
            color: ${isDark ? '#d1d5db' : '#6b7280'};
            margin-bottom: 20px;
        }
        
        .summary {
            font-size: 1.1rem;
            line-height: 1.8;
            margin-bottom: 30px;
            padding: 20px;
            background: ${isDark ? '#374151' : '#f9fafb'};
            border-radius: 8px;
            border-left: 4px solid ${brandColor};
        }
        
        .metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        
        .metric {
            text-align: center;
            padding: 20px;
            background: ${isDark ? '#374151' : '#f9fafb'};
            border-radius: 8px;
        }
        
        .metric-value {
            font-size: 2rem;
            font-weight: 700;
            color: ${brandColor};
            margin-bottom: 5px;
        }
        
        .metric-label {
            font-size: 0.9rem;
            color: ${isDark ? '#d1d5db' : '#6b7280'};
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .section {
            margin-bottom: 40px;
        }
        
        .section-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: ${brandColor};
            margin-bottom: 20px;
            border-bottom: 2px solid ${brandColor};
            padding-bottom: 10px;
        }
        
        .brands-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
        
        .brand-card {
            padding: 20px;
            background: ${isDark ? '#374151' : '#f9fafb'};
            border-radius: 8px;
            border: 1px solid ${isDark ? '#4b5563' : '#e5e7eb'};
        }
        
        .brand-name {
            font-weight: 600;
            color: ${brandColor};
            margin-bottom: 10px;
        }
        
        .cta-section {
            text-align: center;
            margin-top: 40px;
            padding: 30px;
            background: ${brandColor};
            color: white;
            border-radius: 8px;
        }
        
        .cta-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 10px;
        }
        
        .cta-text {
            font-size: 1.1rem;
            margin-bottom: 20px;
        }
        
        .cta-button {
            display: inline-block;
            padding: 12px 30px;
            background: white;
            color: ${brandColor};
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 0 10px;
        }
        
        @media print {
            body { -webkit-print-color-adjust: exact; }
            .container { max-width: none; }
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
            `).join('') || ''}
        </div>
        
        <div class="section">
            <h2 class="section-title">Brand Partnerships</h2>
            <div class="brands-grid">
                ${data.brands?.map((brand: any) => `
                    <div class="brand-card">
                        <div class="brand-name">${brand.name}</div>
                        <p>${brand.reasons?.join(', ') || 'Partnership opportunity'}</p>
                    </div>
                `).join('') || ''}
            </div>
        </div>
        
        <div class="cta-section">
            <h2 class="cta-title">Ready to Partner?</h2>
            <p class="cta-text">Let's create something amazing together</p>
            <a href="${data.cta?.bookUrl || '#'}" class="cta-button">Book a Call</a>
            <a href="${data.cta?.proposalUrl || '#'}" class="cta-button">View Proposal</a>
        </div>
    </div>
</body>
</html>
  `.trim();
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

import { NextResponse } from 'next/server';
import { signPayload } from '@/lib/signing';
import { MediaPackData } from '@/lib/mediaPack/types';

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const { selectedBrandIds, packData, theme } = await req.json();
    
    console.log('Starting PDFShift HTML generation for brands:', selectedBrandIds);
    console.log('PDFShift API Key:', process.env.PDFSHIFT_API_KEY ? 'SET' : 'NOT SET');
    
    const results = [];
    
    for (const brandId of selectedBrandIds) {
      try {
        // Get brand info
        const demoBrands = {
          'demo-1': { name: 'Nike', domain: 'nike.com' },
          'demo-2': { name: 'Apple', domain: 'apple.com' },
          'demo-3': { name: 'Starbucks', domain: 'starbucks.com' }
        };
        
        const brand = demoBrands[brandId];
        if (!brand) continue;
        
        // Create brand-specific data
        const brandSpecificData: MediaPackData = {
          ...packData,
          brandContext: {
            name: brand.name,
            domain: brand.domain
          },
          theme: theme
        };

        console.log('Generating HTML template for brand:', brand.name);
        
        // Generate HTML template based on the data
        const componentHtml = generateMediaPackHTML(brandSpecificData, theme?.variant || 'editorial');
        
        // Create complete HTML document with inline CSS
        const htmlDocument = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Media Pack - ${brand.name}</title>
  <style>
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
  </style>
  <script>
    // Wait function for PDFShift
    function isPageReady() {
      // Check if the main content is rendered
      const container = document.querySelector('.container');
      if (!container) return false;
      
      // Check if images are loaded
      const images = document.querySelectorAll('img');
      for (let img of images) {
        if (!img.complete) return false;
      }
      
      // Check if fonts are loaded
      if (document.fonts && !document.fonts.ready) return false;
      
      return true;
    }
    
    // Set a timeout as fallback
    setTimeout(() => {
      window.pageReady = true;
    }, 3000);
  </script>
</head>
<body>
  <div class="container">
    ${componentHtml}
  </div>
</body>
</html>`;

        console.log('HTML document length:', htmlDocument.length);
        console.log('Calling PDFShift for:', brand.name);
        
        // Call PDFShift API with raw HTML
        const pdfResponse = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': process.env.PDFSHIFT_API_KEY!
          },
          body: JSON.stringify({
            source: htmlDocument,
            format: '1280xauto', // Responsive width with auto height
            margins: { top: '20mm', left: '10mm', bottom: '20mm', right: '10mm' },
            use_print: false, // Use screen CSS
            wait_for: 'isPageReady', // Wait for content to be ready
            sandbox: false
          })
        });
        
        if (!pdfResponse.ok) {
          const error = await pdfResponse.text();
          console.error('PDFShift API error:', error);
          throw new Error(`PDFShift API error: ${error}`);
        }
        
        const pdfBuffer = await pdfResponse.arrayBuffer();
        const pdfSize = pdfBuffer.byteLength;
        
        console.log(`PDF generated for ${brand.name}: ${pdfSize} bytes`);
        
        // Store PDF in database (using existing MediaPackFile table)
        const { prisma } = await import('@/lib/prisma');
        
        // Create or update MediaPack record
        const mediaPack = await prisma().mediaPack.upsert({
          where: { 
            workspaceId_brandId: { 
              workspaceId: 'demo-workspace', 
              brandId: brandId 
            } 
          },
          update: {
            updatedAt: new Date()
          },
          create: {
            workspaceId: 'demo-workspace',
            brandId: brandId,
            data: brandSpecificData,
            theme: theme
          }
        });
        
        // Store PDF file
        const pdfFile = await prisma().mediaPackFile.create({
          data: {
            mediaPackId: mediaPack.id,
            filename: `media-pack-${brand.name.toLowerCase().replace(/\s+/g, '-')}.pdf`,
            contentType: 'application/pdf',
            size: pdfSize,
            data: Buffer.from(pdfBuffer)
          }
        });
        
        // Generate public URL for the PDF
        const pdfUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://brand-deals-mvp.vercel.app'}/api/media-pack/file/${pdfFile.id}`;
        
        results.push({
          brandId,
          brandName: brand.name,
          success: true,
          size: pdfSize,
          url: pdfUrl
        });
        
      } catch (error) {
        console.error(`Error generating PDF for brand: ${brandId}`, error);
        results.push({
          brandId,
          brandName: brand?.name || 'Unknown',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return NextResponse.json({ 
      ok: true, 
      results,
      message: `Generated ${results.filter(r => r.success).length} PDFs successfully`
    });
    
  } catch (error) {
    console.error('PDF generation failed:', error);
    return NextResponse.json({ 
      ok: false, 
      error: error instanceof Error ? error.message : 'PDF generation failed'
    }, { status: 500 });
  }
}

// Generate HTML template for media pack
function generateMediaPackHTML(data: MediaPackData, variant: string = 'editorial'): string {
  const creator = data.creator || {};
  const socials = data.socials || [];
  const brandContext = data.brandContext || {};
  const ai = data.ai || {};
  const cta = data.cta || {};
  
  // Calculate metrics
  const totalFollowers = socials.reduce((sum, s) => sum + (s.followers || 0), 0);
  const avgEngagement = socials.reduce((sum, s) => sum + (s.engagementRate || 0), 0) / socials.length;
  const avgViews = socials.reduce((sum, s) => sum + (s.avgViews || 0), 0) / socials.length;
  
  return `
    <div class="min-h-screen bg-white">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-4xl font-bold mb-2">${creator.name || 'Creator Name'}</h1>
          <p class="text-xl opacity-90">${creator.tagline || 'Creator • Partnerships • Storytelling'}</p>
        </div>
      </div>
      
      <!-- Main Content -->
      <div class="max-w-4xl mx-auto p-8 space-y-8">
        
        <!-- Metrics Section -->
        <div class="bg-gray-50 rounded-lg p-6">
          <h2 class="text-2xl font-bold mb-4 text-gray-800">Audience Reach</h2>
          <div class="grid grid-cols-3 gap-6">
            <div class="text-center">
              <div class="text-3xl font-bold text-blue-600">${totalFollowers.toLocaleString()}</div>
              <div class="text-sm text-gray-600">Total Followers</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-green-600">${(avgEngagement * 100).toFixed(1)}%</div>
              <div class="text-sm text-gray-600">Avg Engagement</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-purple-600">${Math.round(avgViews).toLocaleString()}</div>
              <div class="text-sm text-gray-600">Avg Views</div>
            </div>
          </div>
        </div>
        
        <!-- Social Media Reach -->
        ${socials.length > 0 ? `
        <div class="bg-white border rounded-lg p-6">
          <h2 class="text-2xl font-bold mb-4 text-gray-800">Social Media Reach</h2>
          <div class="grid grid-cols-3 gap-4">
            ${socials.slice(0, 3).map(social => `
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-lg font-semibold capitalize">${social.platform}</div>
                <div class="text-2xl font-bold text-gray-800">${social.followers.toLocaleString()}</div>
                <div class="text-sm text-gray-600">Followers</div>
                <div class="text-xs text-gray-500 mt-2">
                  Avg Views: ${social.avgViews.toLocaleString()}<br>
                  Engagement: ${(social.engagementRate * 100).toFixed(1)}%
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
        
        <!-- Brand Partnership -->
        <div class="bg-white border rounded-lg p-6">
          <h2 class="text-2xl font-bold mb-4 text-gray-800">Perfect Partnership with ${brandContext.name}</h2>
          <p class="text-gray-700 mb-4">${ai.elevatorPitch || 'Your audience is primed for partnerships.'}</p>
          <div class="space-y-2">
            ${(ai.highlights || []).slice(0, 3).map(highlight => `
              <div class="flex items-start">
                <div class="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span class="text-gray-700">${highlight}</span>
              </div>
            `).join('')}
          </div>
        </div>
        
        <!-- Services & Pricing -->
        ${data.services && data.services.length > 0 ? `
        <div class="bg-white border rounded-lg p-6">
          <h2 class="text-2xl font-bold mb-4 text-gray-800">Services & Pricing</h2>
          <div class="space-y-3">
            ${data.services.slice(0, 4).map(service => `
              <div class="flex justify-between items-center py-2 border-b border-gray-100">
                <div>
                  <div class="font-semibold text-gray-800">${service.label}</div>
                  <div class="text-sm text-gray-600">${service.notes}</div>
                </div>
                <div class="text-lg font-bold text-gray-800">$${service.price.toLocaleString()}</div>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
        
        <!-- Case Studies -->
        ${data.caseStudies && data.caseStudies.length > 0 ? `
        <div class="bg-white border rounded-lg p-6">
          <h2 class="text-2xl font-bold mb-4 text-gray-800">Case Studies</h2>
          <div class="grid grid-cols-2 gap-6">
            ${data.caseStudies.slice(0, 2).map(study => `
              <div class="bg-gray-50 rounded-lg p-4">
                <h3 class="font-semibold text-gray-800 mb-2">${study.brand?.name || 'Brand'}</h3>
                <div class="space-y-2 text-sm">
                  <div><strong>Goal:</strong> ${study.goal}</div>
                  <div><strong>Work:</strong> ${study.work}</div>
                  <div><strong>Result:</strong> ${study.result}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
        
        <!-- Content Pillars -->
        ${data.contentPillars && data.contentPillars.length > 0 ? `
        <div class="bg-white border rounded-lg p-6">
          <h2 class="text-2xl font-bold mb-4 text-gray-800">Content Pillars</h2>
          <div class="flex flex-wrap gap-2">
            ${data.contentPillars.map(pillar => `
              <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">${pillar}</span>
            `).join('')}
          </div>
        </div>
        ` : ''}
        
        <!-- Demographics -->
        ${data.demographics ? `
        <div class="bg-white border rounded-lg p-6">
          <h2 class="text-2xl font-bold mb-4 text-gray-800">Audience Demographics</h2>
          <div class="grid grid-cols-3 gap-6">
            ${data.demographics.age ? `
            <div>
              <h3 class="font-semibold text-gray-800 mb-3">Age Distribution</h3>
              <div class="space-y-2">
                ${data.demographics.age.map(item => `
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">${item.label}</span>
                    <span class="text-sm font-medium">${item.percentage}%</span>
                  </div>
                `).join('')}
              </div>
            </div>
            ` : ''}
            ${data.demographics.gender ? `
            <div>
              <h3 class="font-semibold text-gray-800 mb-3">Gender Split</h3>
              <div class="space-y-2">
                ${data.demographics.gender.map(item => `
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">${item.label}</span>
                    <span class="text-sm font-medium">${item.percentage}%</span>
                  </div>
                `).join('')}
              </div>
            </div>
            ` : ''}
            ${data.demographics.locations ? `
            <div>
              <h3 class="font-semibold text-gray-800 mb-3">Top Locations</h3>
              <div class="space-y-2">
                ${data.demographics.locations.slice(0, 3).map(item => `
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">${item.label}</span>
                    <span class="text-sm font-medium">${item.percentage}%</span>
                  </div>
                `).join('')}
              </div>
            </div>
            ` : ''}
          </div>
        </div>
        ` : ''}
        
        <!-- CTA Section -->
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 text-center">
          <h2 class="text-2xl font-bold mb-4">Ready to Partner?</h2>
          <p class="text-lg mb-6 opacity-90">Let's create something amazing together</p>
          <div class="space-x-4">
            ${cta.meetingUrl ? `<a href="${cta.meetingUrl}" class="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">Schedule Meeting</a>` : ''}
            ${cta.proposalUrl ? `<a href="${cta.proposalUrl}" class="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">View Proposal</a>` : ''}
          </div>
        </div>
        
      </div>
    </div>
  `;
}

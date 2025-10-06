import { NextResponse } from 'next/server';
import { renderToString } from 'react-dom/server';
import { signPayload } from '@/lib/signing';
import { MediaPackData } from '@/lib/mediaPack/types';
import MPClassic from '@/components/media-pack/templates/MPClassic';
import MPBold from '@/components/media-pack/templates/MPBold';
import MPEditorial from '@/components/media-pack/templates/MPEditorial';
import React from 'react';

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

        console.log('Rendering React component for brand:', brand.name);
        
        // Render React component to HTML string
        const PreviewComponent = () => {
          switch (theme?.variant || 'editorial') {
            case 'bold': return React.createElement(MPBold, { data: brandSpecificData, isPublic: true });
            case 'classic': return React.createElement(MPClassic, { data: brandSpecificData, isPublic: true });
            default: return React.createElement(MPEditorial, { data: brandSpecificData, isPublic: true });
          }
        };

        const componentHtml = renderToString(React.createElement(PreviewComponent));
        
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

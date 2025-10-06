import { NextResponse } from 'next/server';

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const { selectedBrandIds, packData, theme } = await req.json();
    
    console.log('Starting PDFShift generation for brands:', selectedBrandIds);
    
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
        
        // Build the preview URL with brand-specific data
        const baseUrl = process.env.NEXT_PUBLIC_APP_HOST 
          ? `https://${process.env.NEXT_PUBLIC_APP_HOST}` 
          : 'http://localhost:3000';
        
        const brandSpecificData = {
          ...packData,
          brandContext: {
            name: brand.name,
            domain: brand.domain
          }
        };
        
        const dataParam = encodeURIComponent(JSON.stringify(brandSpecificData));
        const themeParam = encodeURIComponent(JSON.stringify(theme));
        
        const sourceUrl = `${baseUrl}/media-pack/preview?data=${dataParam}&theme=${themeParam}`;
        
        console.log('Calling PDFShift for:', brand.name);
        
        // Call PDFShift API
        const pdfResponse = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${Buffer.from(`api:${process.env.PDFSHIFT_API_KEY}`).toString('base64')}`
          },
          body: JSON.stringify({
            source: sourceUrl,
            sandbox: false,
            landscape: false,
            use_print: true,
            format: 'A4',
            margin: '0mm'
          })
        });
        
        if (!pdfResponse.ok) {
          const error = await pdfResponse.text();
          throw new Error(`PDFShift API error: ${error}`);
        }
        
        const pdfBuffer = await pdfResponse.arrayBuffer();
        
        console.log('PDF generated for:', brand.name, 'Size:', pdfBuffer.byteLength);
        
        results.push({
          brandId,
          brandName: brand.name,
          success: true,
          size: pdfBuffer.byteLength
        });
        
      } catch (error) {
        console.error('Error generating PDF for brand:', brandId, error);
        results.push({
          brandId,
          success: false,
          error: error.message
        });
      }
    }
    
    return NextResponse.json({ 
      ok: true, 
      results 
    });
    
  } catch (error) {
    console.error('PDFShift generation failed:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

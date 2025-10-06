import { NextResponse } from 'next/server';
import { signPayload } from '@/lib/signing';

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const { selectedBrandIds, packData, theme } = await req.json();
    
    console.log('Starting PDFShift generation for brands:', selectedBrandIds);
    console.log('PDFShift API Key:', process.env.PDFSHIFT_API_KEY ? 'SET' : 'NOT SET');
    console.log('Media Pack Signing Secret:', process.env.MEDIA_PACK_SIGNING_SECRET ? 'SET' : 'NOT SET');
    console.log('All env vars with PDFSHIFT:', Object.keys(process.env).filter(key => key.includes('PDFSHIFT')));
    console.log('All env vars with MEDIA_PACK:', Object.keys(process.env).filter(key => key.includes('MEDIA_PACK')));
    
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
        
        // Build the main page URL with brand-specific data
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                       process.env.NEXT_PUBLIC_APP_HOST ? `https://${process.env.NEXT_PUBLIC_APP_HOST}` : 
                       'https://brand-deals-mvp.vercel.app'; // Fallback to your Vercel URL
        
        // Create brand-specific data for URL parameters
        const brandSpecificData = {
          ...packData,
          brandContext: {
            name: brand.name,
            domain: brand.domain
          }
        };

        // Build URL with data as parameters
        const params = new URLSearchParams({
          brand: brand.name,
          domain: brand.domain,
          creator: packData.creator?.name || 'Test Creator',
          theme: theme.variant || 'classic'
        });

        const sourceUrl = `${baseUrl}/en/tools/pack?${params.toString()}`;
        
        console.log('=== PDFSHIFT DEBUG ===');
        console.log('Base URL:', baseUrl);
        console.log('Main page URL:', sourceUrl);
        console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);
        console.log('NEXT_PUBLIC_APP_HOST:', process.env.NEXT_PUBLIC_APP_HOST);
        console.log('URL parameters:', params.toString());
        
        // Test the URL locally first
        try {
          const testResponse = await fetch(sourceUrl);
          console.log('Preview URL test response:', testResponse.status, testResponse.statusText);
          if (!testResponse.ok) {
            const errorText = await testResponse.text();
            console.log('Preview URL error:', errorText);
          } else {
            const htmlContent = await testResponse.text();
            console.log('Preview URL HTML length:', htmlContent.length);
            console.log('Preview URL contains "Sarah Johnson":', htmlContent.includes('Sarah Johnson'));
            console.log('Preview URL contains "Creator":', htmlContent.includes('Creator'));
            console.log('Preview URL contains "Nike":', htmlContent.includes('Nike'));
            console.log('Preview URL first 500 chars:', htmlContent.substring(0, 500));
          }
        } catch (urlError) {
          console.log('Preview URL test failed:', urlError.message);
        }
        
        console.log('Calling PDFShift for:', brand.name);
        
        // Add a small delay to ensure the page is fully loaded
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Call PDFShift API
        const pdfResponse = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${Buffer.from(`api:${process.env.PDFSHIFT_API_KEY}`).toString('base64')}`
          },
          body: JSON.stringify({
            source: sourceUrl, // Back to using our preview URL
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

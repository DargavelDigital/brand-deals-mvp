import { NextResponse } from 'next/server';
import { signPayload } from '@/lib/signing';
import { MediaPackData } from '@/lib/mediaPack/types';
import crypto from 'crypto';

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
        
        // Build the public preview URL with brand-specific data
        const baseUrl = 'https://brand-deals-mvp.vercel.app'; // Use hardcoded Vercel URL for now
        
        // Create brand-specific data
        const brandSpecificData = {
          ...packData,
          brandContext: {
            name: brand.name,
            domain: brand.domain
          }
        };

        // Create signed token with the data
        const tokenPayload = {
          ...brandSpecificData,
          theme: theme
        };

        const token = signPayload(tokenPayload, '1h'); // Token valid for 1 hour
        console.log('Token created, length:', token.length);
        console.log('Token preview:', token.substring(0, 50) + '...');

        // Build public preview URL with token
        const sourceUrl = `${baseUrl}/media-pack/preview?t=${token}`;
        console.log('Source URL:', sourceUrl);        
        console.log('=== PDFSHIFT DEBUG ===');
        console.log('Base URL:', baseUrl);
        console.log('Main page URL:', sourceUrl);
        console.log('Full URL being sent to PDFShift:', sourceUrl);
        console.log('Token length:', token.length);
        console.log('Token preview:', token.substring(0, 50) + '...');
        console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);
        console.log('NEXT_PUBLIC_APP_HOST:', process.env.NEXT_PUBLIC_APP_HOST);
        
        
        // Test the URL locally first
        try {
          console.log('Testing URL:', sourceUrl);
          const testResponse = await fetch(sourceUrl);
          console.log('URL test response:', testResponse.status, testResponse.statusText);
          if (!testResponse.ok) {
            const errorText = await testResponse.text();
            console.log('URL error response:', errorText);
          } else {
            const htmlContent = await testResponse.text();
            console.log('URL HTML length:', htmlContent.length);
            console.log('URL contains "Loading":', htmlContent.includes('Loading'));
            console.log('URL contains "Creator":', htmlContent.includes('Creator'));
            console.log('URL contains "Nike":', htmlContent.includes('Nike'));
            console.log('URL first 200 chars:', htmlContent.substring(0, 200));
          }
        } catch (urlError) {
          console.log('URL test failed:', urlError.message);
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
        
        // Generate IDs
        const packId = `pack_${Date.now()}_${brandId}`;
        const fileId = `file_${Date.now()}_${brandId}`;

        // Calculate hash
        const sha256 = crypto.createHash('sha256').update(Buffer.from(pdfBuffer)).digest('hex');

        // Store PDF in database (using existing MediaPackFile table)
        const { prisma } = await import('@/lib/prisma');

        // Save to database
        const mediaPack = await prisma().mediaPack.create({
          data: {
            id: packId,
            packId: packId,
            workspaceId: 'demo-workspace',
            variant: 'classic',
            payload: tokenPayload,
            theme: theme,
            shareToken: null
          }
        });

        const mediaPackFile = await prisma().mediaPackFile.create({
          data: {
            id: fileId,
            packId: mediaPack.id,
            variant: 'classic',
            mime: 'application/pdf',
            size: pdfBuffer.byteLength,
            sha256: sha256,
            data: Buffer.from(pdfBuffer)
          }
        });

        console.log('PDF saved to database:', fileId);

        results.push({
          brandId,
          brandName: brand.name,
          success: true,
          size: pdfBuffer.byteLength,
          fileId: mediaPackFile.id,
          fileUrl: `/api/media-pack/file/${mediaPackFile.id}`
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

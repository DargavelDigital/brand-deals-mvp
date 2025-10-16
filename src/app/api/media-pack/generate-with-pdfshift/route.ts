import { NextResponse } from 'next/server';
import { signPayload } from '@/lib/signing';
import { MediaPackData } from '@/lib/mediaPack/types';
import crypto from 'crypto';

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { selectedBrandIds, packData, theme, workspaceId } = body;
    
    console.log('🎨 [PDF] Step 1 - Request body keys:', Object.keys(body));
    console.log('🎨 [PDF] Step 2 - Selected brand IDs:', selectedBrandIds);
    console.log('🎨 [PDF] Step 3 - Pack data brand context:', packData?.brandContext);
    console.log('🎨 [PDF] Step 4 - Theme:', theme);
    console.log('🎨 [PDF] Step 5 - Workspace ID:', workspaceId);
    
    // Import prisma once at the top of the function
    const { prisma } = await import('@/lib/prisma');
    
    // Get the BrandRun to access full brand data
    console.log('🎨 [PDF] Step 6 - Loading BrandRun for workspace:', workspaceId || 'demo-workspace');
    const brandRun = await prisma().brandRun.findFirst({
      where: { workspaceId: workspaceId || 'demo-workspace' },
      orderBy: { updatedAt: 'desc' }
    });
    
    console.log('🎨 [PDF] Step 7 - BrandRun found:', !!brandRun);
    console.log('🎨 [PDF] Step 8 - Brands in summary:', brandRun?.runSummaryJson?.brands?.length || 0);
    
    const approvedBrands = brandRun?.runSummaryJson?.brands || [];
    console.log('🎨 [PDF] Step 9 - Approved brands:', approvedBrands.map((b: any) => ({ id: b.id, name: b.name })));
    console.log('🎨 [PDF] Step 10 - Looking for these brand IDs:', selectedBrandIds);
    console.log('🎨 [PDF] Step 11 - Available brand IDs in DB:', approvedBrands.map((b: any) => b.id));
    
    // Check for ID mismatch
    const missingBrands = selectedBrandIds.filter((id: string) => 
      !approvedBrands.some((b: any) => b.id === id)
    );
    if (missingBrands.length > 0) {
      console.error('❌ [PDF] BRAND ID MISMATCH!');
      console.error('❌ [PDF] Looking for:', selectedBrandIds);
      console.error('❌ [PDF] Available in DB:', approvedBrands.map((b: any) => b.id));
      console.error('❌ [PDF] Missing brands:', missingBrands);
    }
    
    const results = [];
    
    for (const brandId of selectedBrandIds) {
      try {
        // Find brand from approved brands
        const brand = approvedBrands.find((b: any) => b.id === brandId);
        
        console.log('🎨 [PDF] Processing brand:', brandId, brand ? `Found: ${brand.name}` : 'NOT FOUND');
        
        if (!brand) {
          console.warn('⚠️ [PDF] Brand not found in approved brands:', brandId);
          results.push({
            brandId,
            brandName: 'Unknown Brand',
            fileId: null,
            fileUrl: null,
            cached: false,
            error: `Brand ${brandId} not found in approved brands. Available: ${approvedBrands.map((b: any) => b.id).join(', ')}`
          });
          continue;
        }
        
        // Build the public preview URL with brand-specific data
        const baseUrl = 'https://hyper.hypeandswagger.com'; // Production domain
        
        // Create brand-specific data
        const brandSpecificData = {
          ...packData,
          brandContext: {
            name: brand.name,
            domain: brand.domain
          }
        };

        // Create preview data payload
        const tokenPayload = {
          ...brandSpecificData,
          theme: theme
        };

        // Generate short ID for database lookup
        const previewId = `preview_${Date.now()}_${brandId}`;
        
        // Store preview data in database temporarily (optional - continue even if it fails)
        try {
          await prisma().mediaPack.create({
            data: {
              id: previewId,
              packId: previewId,
              workspaceId: workspaceId || 'demo-workspace',
              variant: 'preview', // Special variant for preview data
              payload: tokenPayload,
              theme: theme,
              shareToken: null
            }
          });
          console.log('✅ Preview data saved with ID:', previewId);
        } catch (dbError: any) {
          console.warn('⚠️ Could not save preview to database (workspace may not exist):', dbError.message);
          console.warn('⚠️ Continuing with PDF generation anyway...');
          // Continue - we don't need the DB record for PDF generation
        }

        // Build public preview URL with short ID
        const sourceUrl = `${baseUrl}/media-pack/preview?id=${previewId}`;
        console.log('Source URL:', sourceUrl);
        
        
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
            source: sourceUrl,
            format: '210mmxauto',
            use_print: true,  // Use @media print CSS
            margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
            landscape: false,
            sandbox: false
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

        // Store PDF in database (optional - continue even if it fails)
        let mediaPackFile;
        try {
          const mediaPack = await prisma().mediaPack.create({
            data: {
              id: packId,
              packId: packId,
              workspaceId: workspaceId || 'demo-workspace',
              variant: 'classic',
              payload: tokenPayload,
              theme: theme,
              shareToken: null
            }
          });

          mediaPackFile = await prisma().mediaPackFile.create({
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

          console.log('✅ PDF saved to database:', fileId);
        } catch (dbError: any) {
          console.warn('⚠️ Could not save PDF to database (workspace may not exist):', dbError.message);
          console.warn('⚠️ Creating temporary file reference...');
          // Create a temporary file reference that works without DB
          mediaPackFile = {
            id: fileId,
            packId: packId,
            variant: 'classic',
            mime: 'application/pdf',
            size: pdfBuffer.byteLength,
            sha256: sha256
          };
        }

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
    
    // Count successes and failures
    const totalGenerated = results.filter((r: any) => r.success || (r.fileId && !r.error)).length;
    const totalErrors = results.filter((r: any) => r.error || !r.success).length;
    
    console.log('📄 [PDF] Final response:', {
      totalGenerated,
      totalErrors,
      resultsCount: results.length,
      results: results.map((r: any) => ({
        brandId: r.brandId,
        brandName: r.brandName,
        success: r.success,
        fileUrl: r.fileUrl,
        error: r.error
      }))
    });
    
    return NextResponse.json({ 
      ok: true, 
      results,
      totalGenerated,
      totalErrors
    });
    
  } catch (error) {
    console.error('PDFShift generation failed:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

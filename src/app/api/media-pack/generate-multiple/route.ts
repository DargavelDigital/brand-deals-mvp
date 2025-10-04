import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { generateMediaPackPDFWithReactPDF } from "@/services/mediaPack/pdf/reactpdf-generator.tsx";
import { stableHash, sha256 } from "@/lib/hash";
import { getOrigin } from "@/lib/urls";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  console.log('=== PDF GENERATION API CALLED ===');
  console.log('=== API VERSION 3.0 - FORCE TEST ===');
  console.log('=== THIS SHOULD APPEAR IN TERMINAL ===');
  
  // Force return test response
  return NextResponse.json({
    ok: true,
    results: [{
      brandId: 'demo-1',
      brandName: 'FORCE TEST SUCCESS',
      fileId: 'force-test-file-id',
      fileUrl: 'https://example.com/force-test.pdf',
      cached: false
    }],
    totalGenerated: 1,
    totalErrors: 0
  });
  
  try {
    const body = await req.json().catch(() => ({}));
    console.log('Request body:', JSON.stringify(body, null, 2));
    const { 
      workspaceId, 
      selectedBrandIds, 
      packData, 
      theme, 
      variant = "classic" 
    } = body;

    if (!workspaceId || !selectedBrandIds || !Array.isArray(selectedBrandIds) || selectedBrandIds.length === 0) {
      return NextResponse.json({ 
        ok: false, 
        error: "workspaceId and selectedBrandIds array required" 
      }, { status: 400 });
    }

    if (!packData) {
      return NextResponse.json({ 
        ok: false, 
        error: "packData required" 
      }, { status: 400 });
    }

    const origin = getOrigin(req);
    const results = [];

    // Generate PDF for each selected brand
    for (const brandId of selectedBrandIds) {
      try {
        console.log(`Processing brand ID: ${brandId}`);
        
        let brand: {
          id: string;
          name: string;
          website: string;
          BrandProfile?: { domain: string };
        } | null = null;
        
        // Check if it's a demo brand first
        const demoBrands: Record<string, { name: string; domain: string; industry: string }> = {
          'demo-1': { name: 'Nike', domain: 'nike.com', industry: 'Sports & Fitness' },
          'demo-2': { name: 'Coca-Cola', domain: 'coca-cola.com', industry: 'Food & Beverage' },
          'demo-3': { name: 'Apple', domain: 'apple.com', industry: 'Technology' },
          'demo-4': { name: 'Tesla', domain: 'tesla.com', industry: 'Automotive' },
          'demo-5': { name: 'Spotify', domain: 'spotify.com', industry: 'Music & Entertainment' },
          'demo-6': { name: 'Airbnb', domain: 'airbnb.com', industry: 'Travel & Hospitality' }
        };

        console.log(`Checking if ${brandId} is in demo brands:`, demoBrands[brandId]);
        console.log(`Demo brands object:`, demoBrands);
        console.log(`Brand ID type:`, typeof brandId);
        console.log(`Brand ID value:`, JSON.stringify(brandId));

        if (demoBrands[brandId]) {
          // Use demo brand data
          brand = {
            id: brandId,
            name: demoBrands[brandId].name,
            website: `https://${demoBrands[brandId].domain}`,
            BrandProfile: { domain: demoBrands[brandId].domain }
          };
          console.log('Using demo brand:', brand.name);
        } else {
          // Try to get brand from database
          brand = await db().brand.findUnique({
            where: { id: brandId },
            select: { 
              id: true, 
              name: true, 
              website: true,
              BrandProfile: {
                select: { domain: true }
              }
            }
          });
        }

        if (!brand) {
          console.warn(`Brand ${brandId} not found, skipping`);
          console.warn(`Available demo brands:`, Object.keys(demoBrands));
          results.push({
            brandId,
            brandName: `Unknown (${brandId})`,
            error: 'Brand not found in database',
            fileId: null,
            fileUrl: null
          });
          continue;
        }

        // Create a simple, safe data structure for ReactPDF
        const transformedData = {
          creator: {
            displayName: 'Test Creator',
            name: 'Test Creator',
            bio: 'Test Bio',
            title: 'Test Title',
            tagline: 'Test Tagline',
            avatar: undefined
          },
          socials: [
            {
              platform: 'instagram',
              followers: 100000,
              avgViews: 50000,
              engagementRate: 0.05,
              growth30d: 0.1
            }
          ],
          audience: {
            age: [
              { label: '18-24', value: 0.5 },
              { label: '25-34', value: 0.5 }
            ],
            gender: [
              { label: 'Female', value: 0.6 },
              { label: 'Male', value: 0.4 }
            ],
            geo: [
              { label: 'US', value: 0.7 },
              { label: 'UK', value: 0.3 }
            ],
            interests: ['Tech', 'Fashion']
          },
          brands: [
            {
              name: 'Test Brand',
              reasons: ['Great fit', 'Similar audience'],
              website: 'https://test.com'
            }
          ],
          services: [],
          caseStudies: [],
          contentPillars: ['Tech', 'Lifestyle'],
          contact: {
            email: 'test@creator.com',
            phone: undefined,
            website: undefined
          },
          ai: {
            elevatorPitch: 'Test pitch',
            brandFit: 'Test fit',
            contentStrategy: 'Test strategy'
          },
          summary: 'Test summary',
          metrics: [
            {
              key: 'followers',
              label: 'Followers',
              value: '100K',
              sub: '5% engagement'
            }
          ],
          cta: {
            bookUrl: 'https://test.com/book',
            proposalUrl: 'https://test.com/proposal'
          }
        };

        // Create brand-specific pack data
        const brandSpecificData = {
          ...transformedData,
          brand: {
            name: brand.name,
            domain: brand.BrandProfile?.domain || brand.website || '',
            id: brand.id
          },
          brandContext: {
            name: brand.name,
            domain: brand.BrandProfile?.domain || brand.website || '',
            id: brand.id
          }
        };

        // Create or find media pack record
        const packId = `mp_${workspaceId}_${brandId}_${Date.now()}`;
        const contentHash = stableHash({ 
          payload: brandSpecificData, 
          theme, 
          variant,
          brandId 
        });

        let mediaPack = await db().mediaPack.findFirst({
          where: { 
            workspaceId,
            packId: { contains: `${workspaceId}_${brandId}` }
          },
          select: { id: true, contentHash: true }
        });

        if (!mediaPack) {
          mediaPack = await db().mediaPack.create({
            data: {
              id: `mp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              packId,
              workspaceId,
              variant,
              payload: brandSpecificData,
              theme,
              contentHash
            },
            select: { id: true, contentHash: true }
          });
        } else if (mediaPack.contentHash !== contentHash) {
          // Update existing pack with new data
          await db().mediaPack.update({
            where: { id: mediaPack.id },
            data: { 
              payload: brandSpecificData,
              theme,
              contentHash,
              updatedAt: new Date()
            }
          });
        }

        // Check if PDF already exists and is up to date
        const existingFile = await db().mediaPackFile.findFirst({
          where: { 
            packId: mediaPack.id, 
            variant 
          },
          select: { id: true },
          orderBy: { createdAt: "desc" }
        });

        if (existingFile && mediaPack.contentHash === contentHash) {
          // Use existing PDF
          results.push({
            brandId: brand.id,
            brandName: brand.name,
            fileId: existingFile.id,
            fileUrl: `${origin}/api/media-pack/file/${existingFile.id}`,
            cached: true
          });
          continue;
        }

        // Generate new PDF
        const themeData = {
          brandColor: theme?.brandColor || "#3b82f6",
          dark: theme?.dark || false,
          variant: theme?.variant || variant,
          onePager: theme?.onePager || false
        };
        
        console.log('Generating PDF for brand:', brand.name);
        
        // Safe logging to avoid circular reference issues
        try {
          console.log('Original packData keys:', Object.keys(packData || {}));
          console.log('Transformed data keys:', Object.keys(transformedData || {}));
          console.log('Brand specific data keys:', Object.keys(brandSpecificData || {}));
          console.log('Theme data:', themeData);
        } catch (logError) {
          console.error('Error logging data:', logError);
        }
        
        let pdf: Buffer;
        try {
          pdf = await generateMediaPackPDFWithReactPDF(brandSpecificData, themeData, variant);
        } catch (pdfError: unknown) {
          console.error('PDF generation failed for brand', brand.name, ':', pdfError);
          throw new Error(`PDF generation failed: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}`);
        }
        const digest = sha256(pdf);

        // Save PDF to database
        const fileId = `mpf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await db().mediaPackFile.create({
          data: {
            id: fileId,
            packId: mediaPack.id,
            variant,
            mime: "application/pdf",
            size: pdf.length,
            sha256: digest,
            data: pdf
          }
        });

        results.push({
          brandId: brand.id,
          brandName: brand.name || 'Unknown Brand',
          fileId,
          fileUrl: `${origin}/api/media-pack/file/${fileId}`,
          cached: false
        });

      } catch (brandError: unknown) {
        console.error(`Failed to generate PDF for brand ${brandId}:`, brandError);
        console.error(`Brand error details:`, {
          brandId,
          error: brandError,
          message: brandError instanceof Error ? brandError.message : 'Unknown error',
          stack: brandError instanceof Error ? brandError.stack : undefined
        });
        results.push({
          brandId,
          brandName: 'Unknown',
          error: brandError instanceof Error ? brandError.message : 'Unknown error',
          fileId: null,
          fileUrl: null
        });
      }
    }

    return NextResponse.json({
      ok: true,
      results,
      totalGenerated: results.filter(r => r.fileId).length,
      totalErrors: results.filter(r => r.error).length
    });

  } catch (e: unknown) {
    console.error('Multiple PDF generation failed:', e);
    const errorMessage = e instanceof Error ? e.message : "generate multiple failed"
    return NextResponse.json({ 
      ok: false, 
      error: errorMessage
    }, { status: 500 });
  }
}

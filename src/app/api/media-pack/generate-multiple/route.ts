import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { generateMediaPackPDFWithReactPDF } from "@/services/mediaPack/pdf/reactpdf-generator";
import { stableHash, sha256 } from "@/lib/hash";
import { getOrigin } from "@/lib/urls";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
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

        if (demoBrands[brandId]) {
          // Use demo brand data
          brand = {
            id: brandId,
            name: demoBrands[brandId].name,
            website: `https://${demoBrands[brandId].domain}`,
            BrandProfile: { domain: demoBrands[brandId].domain }
          };
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
          results.push({
            brandId,
            brandName: 'Unknown',
            error: 'Brand not found in database',
            fileId: null,
            fileUrl: null
          });
          continue;
        }

        // Transform packData to ReactPDF format
        const transformedData = {
          creator: {
            displayName: packData.creator?.name || 'Creator Name',
            name: packData.creator?.name || 'Creator Name',
            bio: packData.creator?.tagline || 'Creator • Partnerships • Storytelling',
            title: packData.creator?.tagline || 'Creator • Partnerships • Storytelling',
            tagline: packData.creator?.tagline || 'Creator • Partnerships • Storytelling',
            avatar: packData.creator?.headshotUrl || packData.creator?.logoUrl
          },
          socials: packData.socials?.map(social => ({
            platform: social.platform,
            followers: social.followers,
            avgViews: social.avgViews,
            engagementRate: social.engagementRate,
            growth30d: social.growth30d
          })) || [],
          audience: {
            age: packData.audience?.age || [],
            gender: packData.audience?.gender || [],
            geo: packData.audience?.geo || [],
            interests: packData.audience?.interests || []
          },
          brands: packData.caseStudies?.map(study => ({
            name: study.brand.name,
            reasons: [study.goal, study.work, study.result],
            website: study.brand.domain || '#'
          })) || [],
          services: packData.services?.map(service => ({
            label: service.label,
            price: service.price,
            notes: service.notes,
            sku: service.sku
          })) || [],
          caseStudies: packData.caseStudies?.map(study => ({
            brand: { name: study.brand.name, domain: study.brand.domain },
            goal: study.goal,
            work: study.work,
            result: study.result,
            proof: study.proof
          })) || [],
          contentPillars: packData.contentPillars || [],
          contact: {
            email: packData.contact?.email || 'hello@creator.com',
            phone: packData.contact?.phone,
            website: packData.contact?.website
          },
          ai: {
            elevatorPitch: packData.ai?.elevatorPitch,
            brandFit: packData.ai?.whyThisBrand,
            contentStrategy: packData.ai?.highlights?.join('\n')
          },
          summary: packData.ai?.elevatorPitch || 'Your audience is primed for partnerships. Strong engagement and targeted demographics.',
          metrics: packData.socials?.map(social => ({
            key: social.platform,
            label: social.platform.charAt(0).toUpperCase() + social.platform.slice(1),
            value: `${Math.floor(social.followers / 1000)}K`,
            sub: `${(social.engagementRate * 100).toFixed(1)}% engagement`
          })) || [],
          cta: {
            bookUrl: packData.cta?.meetingUrl,
            proposalUrl: packData.cta?.proposalUrl
          }
        };

        // Create brand-specific pack data
        const brandSpecificData = {
          ...transformedData,
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
        console.log('Brand specific data:', JSON.stringify(brandSpecificData, null, 2));
        console.log('Theme data:', JSON.stringify(themeData, null, 2));
        
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
          brandName: brand.name,
          fileId,
          fileUrl: `${origin}/api/media-pack/file/${fileId}`,
          cached: false
        });

      } catch (brandError: unknown) {
        console.error(`Failed to generate PDF for brand ${brandId}:`, brandError);
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

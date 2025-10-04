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
        // Get brand data
        const brand = await db().brand.findUnique({
          where: { id: brandId },
          select: { id: true, name: true, domain: true }
        });

        if (!brand) {
          console.warn(`Brand ${brandId} not found, skipping`);
          continue;
        }

        // Create brand-specific pack data
        const brandSpecificData = {
          ...packData,
          brandContext: {
            name: brand.name,
            domain: brand.domain || '',
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
        
        const pdf = await generateMediaPackPDFWithReactPDF(brandSpecificData, themeData, variant);
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

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { stableHash } from "@/lib/hash";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      packId, workspaceId,
      variant = "professional",
      payload, theme,
      // PDF metadata fields
      brandId, brandName,
      fileUrl, fileId, fileName,
      format = "pdf",
      status = "READY"
    } = body || {};

    // Validate required fields
    if (!packId || !workspaceId) {
      return NextResponse.json({ 
        ok: false, 
        success: false, 
        error: "packId and workspaceId required" 
      }, { status: 400 });
    }

    console.log('💾 Saving media pack:', { 
      packId, 
      workspaceId, 
      variant,
      brandName: brandName || 'N/A',
      fileUrl: fileUrl ? '✓' : '✗'
    });

    const shareToken = cryptoRandom();
    const contentHash = payload ? stableHash({ payload, theme, variant }) : undefined;
    
    // Save media pack with all fields
    const saved = await db().mediaPack.upsert({
      where: { packId: packId },
      create: { 
        id: `mp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        packId: packId, 
        workspaceId: workspaceId, 
        variant, 
        payload, 
        theme, 
        contentHash,
        shareToken,
        // PDF metadata fields
        brandId: brandId || null,
        brandName: brandName || null,
        fileUrl: fileUrl || null,
        fileId: fileId || null,
        fileName: fileName || (brandName ? `${brandName}-MediaPack.pdf` : null),
        format: format,
        status: status,
        generatedAt: fileUrl ? new Date() : null
      },
      update: { 
        workspaceId: workspaceId, 
        variant, 
        payload, 
        theme,
        contentHash,
        // Update PDF metadata if provided
        brandId: brandId || null,
        brandName: brandName || null,
        fileUrl: fileUrl || null,
        fileId: fileId || null,
        fileName: fileName || null,
        format: format,
        status: status,
        generatedAt: fileUrl ? new Date() : null
      },
      select: { 
        id: true, 
        shareToken: true,
        fileUrl: true,
        fileName: true,
        brandName: true,
        generatedAt: true
      }
    });

    console.log('✅ Media pack saved:', saved.id);

    return NextResponse.json({ 
      ok: true, 
      success: true,
      id: saved.id, 
      shareToken: saved.shareToken,
      fileUrl: saved.fileUrl,
      fileName: saved.fileName,
      shareableLink: saved.fileUrl || undefined,
      mediaPack: {
        id: saved.id,
        fileUrl: saved.fileUrl,
        fileName: saved.fileName,
        brandName: saved.brandName,
        generatedAt: saved.generatedAt
      }
    });
  } catch (e: any) {
    console.error('❌ Failed to save media pack:', e);
    return NextResponse.json({ 
      ok: false, 
      success: false,
      error: e?.message || "save failed" 
    }, { status: 500 });
  }
}

// GET endpoint to retrieve media pack history
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');
    
    if (!workspaceId) {
      return NextResponse.json(
        { ok: false, success: false, error: 'workspaceId required' },
        { status: 400 }
      );
    }
    
    console.log('📊 Fetching media pack history for workspace:', workspaceId);
    
    const mediaPacks = await db().mediaPack.findMany({
      where: { workspaceId },
      orderBy: { generatedAt: 'desc' },
      take: 50,
      select: {
        id: true,
        packId: true,
        brandId: true,
        brandName: true,
        variant: true,
        fileUrl: true,
        fileName: true,
        format: true,
        status: true,
        generatedAt: true,
        createdAt: true
      }
    });
    
    console.log(`✅ Found ${mediaPacks.length} media packs`);
    
    return NextResponse.json({
      ok: true,
      success: true,
      mediaPacks,
      total: mediaPacks.length
    });
    
  } catch (error) {
    console.error('❌ Failed to fetch media packs:', error);
    return NextResponse.json(
      { 
        ok: false,
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch media packs' 
      },
      { status: 500 }
    );
  }
}

function cryptoRandom() {
  return Array.from(crypto.getRandomValues(new Uint32Array(4)))
    .map(n => n.toString(36)).join("").slice(0, 20);
}
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { stableHash } from "@/lib/hash";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      packId, workspaceId,
      variant = "classic",
      payload, theme,
      // New PDF metadata fields
      brandId, brandName,
      fileUrl, fileId, fileName,
      format = "pdf",
      status = "READY"
    } = body || {};

    // Validate required fields
    if (!packId || !workspaceId) {
      return NextResponse.json({ ok: false, error: "packId and workspaceId required" }, { status: 400 });
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
    
    // Check if workspace exists (skip for demo workspaces)
    let workspaceExists = false;
    if (workspaceId !== 'demo-workspace' && workspaceId !== 'preview') {
      try {
        const workspace = await db().workspace.findUnique({
          where: { id: workspaceId }
        });
        workspaceExists = !!workspace;
      } catch (err) {
        console.warn('⚠️ Could not verify workspace, using as-is:', err);
        workspaceExists = true; // Assume it exists if query fails
      }
    }
    
    const effectiveWorkspaceId = workspaceExists ? workspaceId : 'demo-workspace';
    
    // Try to save with new schema fields first, fall back to core fields if that fails
    let saved;
    try {
      saved = await db().mediaPack.upsert({
        where: { packId: packId },
        create: { 
          id: `mp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          packId: packId, 
          workspaceId: effectiveWorkspaceId, 
          variant, 
          payload, 
          theme, 
          contentHash,
          shareToken,
          // Try to include PDF metadata fields
          ...(brandId && { brandId }),
          ...(brandName && { brandName }),
          ...(fileUrl && { fileUrl }),
          ...(fileId && { fileId }),
          ...(fileName && { fileName }),
          ...(format && { format }),
          ...(status && { status }),
          ...(fileUrl && { generatedAt: new Date() })
        },
        update: { 
          workspaceId: effectiveWorkspaceId, 
          variant, 
          payload, 
          theme,
          contentHash,
          // Update PDF metadata if provided
          ...(brandId && { brandId }),
          ...(brandName && { brandName }),
          ...(fileUrl && { fileUrl }),
          ...(fileId && { fileId }),
          ...(fileName && { fileName }),
          ...(format && { format }),
          ...(status && { status }),
          ...(fileUrl && { generatedAt: new Date() })
        },
        select: { 
          id: true, 
          shareToken: true
        }
      });
    } catch (schemaError: any) {
      console.warn('⚠️ New schema fields not available, using core fields only:', schemaError.message);
      
      // Fallback: Save with only core fields that definitely exist
      saved = await db().mediaPack.upsert({
        where: { packId: packId },
        create: { 
          id: `mp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          packId: packId, 
          workspaceId: effectiveWorkspaceId, 
          variant, 
          payload, 
          theme, 
          contentHash,
          shareToken
        },
        update: { 
          workspaceId: effectiveWorkspaceId, 
          variant, 
          payload, 
          theme,
          contentHash
        },
        select: { 
          id: true, 
          shareToken: true
        }
      });
    }

    console.log('✅ Media pack saved:', saved.id);

    // Return success with all metadata (even if not saved to DB)
    return NextResponse.json({ 
      ok: true, 
      success: true,
      id: saved.id, 
      shareToken: saved.shareToken,
      fileUrl: fileUrl || undefined,
      fileName: fileName || undefined,
      shareableLink: fileUrl || undefined,
      mediaPack: {
        id: saved.id,
        fileUrl: fileUrl || undefined,
        fileName: fileName || undefined,
        generatedAt: new Date()
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
    
    // Try to fetch with new fields, fall back to core fields if that fails
    let mediaPacks;
    try {
      mediaPacks = await db().mediaPack.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          packId: true,
          variant: true,
          createdAt: true
        }
      });
    } catch (err) {
      console.error('❌ Failed to fetch media packs:', err);
      mediaPacks = [];
    }
    
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
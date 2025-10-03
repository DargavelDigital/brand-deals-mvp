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
    } = body || {};

    if (!packId || !workspaceId || !payload) {
      return NextResponse.json({ ok: false, error: "packId, workspaceId, payload required" }, { status: 400 });
    }

    const contentHash = stableHash({ payload, theme, variant });
    const shareToken = cryptoRandom();

    const saved = await db().mediaPack.upsert({
      where: { id: packId },
      create: { 
        id: packId, 
        workspaceId, 
        variant, 
        payload, 
        theme, 
        contentHash, 
        shareToken 
      },
      update: { 
        workspaceId, 
        variant, 
        payload, 
        theme, 
        contentHash 
      },
      select: { id: true, shareToken: true }
    });

    return NextResponse.json({ ok: true, id: saved.id, shareToken: saved.shareToken });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "save failed" }, { status: 500 });
  }
}

function cryptoRandom() {
  return Array.from(crypto.getRandomValues(new Uint32Array(4)))
    .map(n => n.toString(36)).join("").slice(0, 20);
}
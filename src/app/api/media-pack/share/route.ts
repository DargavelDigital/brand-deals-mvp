// src/app/api/media-pack/share/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createShareToken } from "@/lib/storage-db";

export async function POST(req: Request) {
  const { fileId } = await req.json().catch(() => ({}));
  if (!fileId) {
    return NextResponse.json({ ok: false, error: "fileId required" }, { status: 400 });
  }
  const { token, url } = await createShareToken(fileId);
  return NextResponse.json({ ok: true, token, url });
}
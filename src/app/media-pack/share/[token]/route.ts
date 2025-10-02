// src/app/media-pack/share/[token]/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import type { PrismaClient } from "@prisma/client";

let prismaFn: () => PrismaClient;
try {
  const svc = require("@/services/prisma");
  prismaFn = svc.prisma || svc.default || svc;
} catch {
  const { PrismaClient } = require("@prisma/client");
  const _global = globalThis as any;
  _global.__prisma ||= new PrismaClient();
  prismaFn = () => _global.__prisma as PrismaClient;
}

export async function GET(_: Request, { params }: { params: { token: string } }) {
  const prisma = prismaFn();

  const token = await prisma.mediaPackShareToken.findUnique({
    where: { token: params.token },
    select: { fileId: true },
  });
  if (!token) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const rec = await prisma.mediaPackFile.findUnique({
    where: { id: token.fileId },
    select: { filename: true, mimeType: true, size: true, data: true },
  });
  if (!rec) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const headers = new Headers();
  headers.set("Content-Type", rec.mimeType || "application/pdf");
  headers.set("Content-Length", String(rec.size));
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("Content-Disposition", `inline; filename="${rec.filename}"`);
  return new NextResponse(Buffer.from(rec.data as any), { headers });
}

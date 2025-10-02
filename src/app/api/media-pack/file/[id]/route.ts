// src/app/api/media-pack/file/[id]/route.ts
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

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
    }

    const row = await prismaFn().mediaPackFile.findUnique({
      where: { id },
      select: {
        data: true,
        mime: true,
        size: true,
        createdAt: true,
        packId: true,
        variant: true,
        dark: true,
      },
    });

    if (!row) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    const headers = new Headers();
    headers.set("Content-Type", row.mime || "application/pdf");
    headers.set("Content-Length", String(row.size || row.data?.length || 0));
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    headers.set(
      "Content-Disposition",
      // inline so browser renders it; change to attachment; filename="..." to force download
      `inline; filename="media-pack-${row.packId}-${row.variant}${row.dark ? "-dark" : ""}.pdf"`
    );

    const pdfBuffer = row.data as Buffer;
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const row = await prisma().mediaPackFile.findUnique({ where: { id: params.id } });
  if (!row) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  const headers = new Headers();
  headers.set("Content-Type", "application/pdf");
  headers.set("Content-Length", String(row.data?.length || 0));
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("Content-Disposition", `inline; filename="media-pack-${row.packId}-${row.variant}${row.dark ? "-dark": ""}.pdf"`);

  // @ts-ignore NextResponse accepts Buffer/Uint8Array
  return new NextResponse(row.data, { headers });
}
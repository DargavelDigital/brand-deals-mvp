import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const row = await db().mediaPackFile.findUnique({ where: { id: params.id } });
  if (!row) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });

  const headers = new Headers();
  headers.set("Content-Type", row.mime);
  headers.set("Content-Length", String(row.size));
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("Content-Disposition", `inline; filename="media-pack-${row.id}.pdf"`);

  return new NextResponse(Buffer.from(row.data as any), { status: 200, headers });
}
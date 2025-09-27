import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getWorkspaceIdOptional } from "@/lib/auth/workspace";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") ?? "ALL";

    // Gracefully handle missing auth/workspace (dashboard prefetches)
    const workspaceId = await getWorkspaceIdOptional?.();
    if (!workspaceId) {
      return NextResponse.json({ ok: true, type, counts: { total: 0, pos: 0, neg: 0, neu: 0 } });
    }

    // If table doesn't exist or no rows, return zeros (wrap in try in case of preview DB)
    let total = 0, pos = 0, neg = 0, neu = 0;
    try {
      const where: any = { workspaceId };
      if (type !== "ALL") where.kind = type;
      total = await prisma.aiFeedback.count({ where });
      pos   = await prisma.aiFeedback.count({ where: { ...where, label: "POS" } });
      neg   = await prisma.aiFeedback.count({ where: { ...where, label: "NEG" } });
      neu   = await prisma.aiFeedback.count({ where: { ...where, label: "NEU" } });
    } catch {
      // swallow and return zeros
    }
    return NextResponse.json({ ok: true, type, counts: { total, pos, neg, neu } });
  } catch (e: any) {
    return NextResponse.json(
      { ok: true, type: "ALL", counts: { total: 0, pos: 0, neg: 0, neu: 0 } },
      // NOTE: 200 on purpose to keep dashboard calm in dev
    );
  }
}

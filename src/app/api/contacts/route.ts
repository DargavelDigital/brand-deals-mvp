import { NextResponse, type NextRequest } from "next/server";
import { requireSession } from "@/lib/auth/requireSession";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;

  const url = new URL(req.url);
  const page = Number(url.searchParams.get("page") || 1);
  const pageSize = Number(url.searchParams.get("pageSize") || 20);
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    prisma.contact.findMany({
      where: { workspaceId: (session.user as any).workspaceId ?? undefined },
      orderBy: { createdAt: "desc" },
      skip, take: pageSize,
    }),
    prisma.contact.count({ where: { workspaceId: (session.user as any).workspaceId ?? undefined } }),
  ]);

  return NextResponse.json({ items, total, page, pageSize });
}

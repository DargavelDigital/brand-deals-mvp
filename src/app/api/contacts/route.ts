import { NextResponse, type NextRequest } from "next/server";
import { requireSessionOrDemo } from "@/lib/auth/requireSessionOrDemo";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const workspaceId = await requireSessionOrDemo(req);
    
    const url = new URL(req.url);
    const page = Number(url.searchParams.get("page") || 1);
    const pageSize = Number(url.searchParams.get("pageSize") || 20);
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      prisma.contact.findMany({
        where: { workspaceId },
        orderBy: { createdAt: "desc" },
        skip, take: pageSize,
      }),
      prisma.contact.count({ where: { workspaceId } }),
    ]);

    return NextResponse.json({ items, total, page, pageSize });
  } catch (error) {
    console.error('Contacts API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

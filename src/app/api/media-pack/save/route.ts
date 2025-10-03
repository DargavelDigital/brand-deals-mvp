import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { packId, payload, theme } = await req.json()
    if (!packId || !payload) {
      return NextResponse.json({ ok: false, error: "packId and payload required" }, { status: 400 })
    }
    // Try to find an existing workspace first
    let workspaceId = "demo-workspace";
    try {
      const existingWorkspace = await prisma().workspace.findFirst({
        select: { id: true },
        take: 1
      });
      if (existingWorkspace) {
        workspaceId = existingWorkspace.id;
      } else {
        // Create a workspace if none exists
        const workspace = await prisma().workspace.create({
          data: {
            id: "demo-workspace",
            name: "Demo Workspace",
            slug: "demo-workspace",
          },
        });
        workspaceId = workspace.id;
      }
    } catch (e) {
      console.error("Workspace creation failed:", e);
      // Fallback to a hardcoded ID if workspace creation fails
      workspaceId = "demo-workspace";
    }

    await prisma().mediaPack.upsert({
      where: { id: packId },
      update: { 
        payload, 
        theme: theme || null,
        updatedAt: new Date()
      },
      create: { 
        id: packId, 
        payload, 
        theme: theme || null,
        workspaceId: workspaceId,
        creatorId: "demo-creator", // TODO: Get from session
        demo: true
      },
    })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}

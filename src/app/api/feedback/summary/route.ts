import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo';

export async function GET(req: NextRequest) {
  try {
    let realWorkspaceId = await requireSessionOrDemo(req);
    if (realWorkspaceId instanceof NextResponse) return realWorkspaceId;

    // If workspaceId is a slug (like "demo-workspace"), look up the actual ID
    if (realWorkspaceId && realWorkspaceId !== "demo-workspace") {
      // This is a real workspace ID, use it directly
      console.log('Feedback summary: using real workspace ID:', realWorkspaceId);
    } else {
      console.log('Feedback summary: looking for demo workspace');
      const demoWorkspace = await prisma.workspace.findUnique({
        where: { slug: 'demo-workspace' }
      });
      if (demoWorkspace) {
        realWorkspaceId = demoWorkspace.id;
        console.log('Feedback summary: found demo workspace, using ID:', realWorkspaceId);
      } else {
        console.log('Feedback summary: demo workspace not found, creating new one');
        const newDemoWorkspace = await prisma.workspace.create({
          data: {
            slug: 'demo-workspace',
            name: 'Demo Workspace'
          }
        });
        realWorkspaceId = newDemoWorkspace.id;
        console.log('Feedback summary: created demo workspace, using ID:', realWorkspaceId);
      }
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const targetId = searchParams.get('targetId');

    if (!type || !['MATCH', 'OUTREACH', 'AUDIT'].includes(type)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid type parameter' },
        { status: 400 }
      );
    }

    // Build where clause
    const where: any = {
      workspaceId: realWorkspaceId,
      type: type as any
    };

    if (targetId) {
      where.targetId = targetId;
    }

    // Get feedback counts
    const feedbacks = await prisma.aiFeedback.findMany({
      where,
      select: {
        decision: true,
        targetId: true
      }
    });

    // Calculate aggregates
    const upCount = feedbacks.filter(f => f.decision === 'UP').length;
    const downCount = feedbacks.filter(f => f.decision === 'DOWN').length;
    const totalCount = upCount + downCount;
    const ratio = totalCount > 0 ? upCount / totalCount : 0;

    // Group by targetId if no specific target requested
    let targetSummaries = {};
    if (!targetId) {
      const targetGroups = feedbacks.reduce((acc, f) => {
        if (!acc[f.targetId]) {
          acc[f.targetId] = { up: 0, down: 0, total: 0, ratio: 0 };
        }
        acc[f.targetId][f.decision.toLowerCase()]++;
        acc[f.targetId].total++;
        acc[f.targetId].ratio = acc[f.targetId].up / acc[f.targetId].total;
        return acc;
      }, {} as Record<string, { up: number; down: number; total: number; ratio: number }>);

      targetSummaries = targetGroups;
    }

    return NextResponse.json({
      ok: true,
      data: {
        type,
        targetId,
        upCount,
        downCount,
        totalCount,
        ratio,
        targetSummaries
      }
    });

  } catch (error) {
    console.error('[feedback/summary] Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch feedback summary' },
      { status: 500 }
    );
  }
}

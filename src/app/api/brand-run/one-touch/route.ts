import { NextRequest, NextResponse } from 'next/server';
import { flag } from '@/lib/flags';
import { prisma } from '@/lib/prisma';
import { brandRunOrchestrator } from '@/services/brandRun/orchestrator';
import { currentWorkspaceId } from '@/lib/workspace';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function POST(req: NextRequest) {
  try {
    if (!flag('brandrun.oneTouch')) {
      return NextResponse.json({ error: 'Feature disabled' }, { status: 403 });
    }
    const workspaceId = await currentWorkspaceId();
    if (!workspaceId) return NextResponse.json({ error: 'No workspace' }, { status: 401 });

    // Ensure a BrandRun row exists (or create)
    let run = await prisma.brandRun.findFirst({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' }
    });
    if (!run) {
      run = await prisma.brandRun.create({
        data: { workspaceId, step: 'CONNECT', auto: true, selectedBrandIds: [] }
      });
    }

    const summary = await brandRunOrchestrator(run.id, workspaceId);

    return NextResponse.json({ summary });
  } catch (e:any) {
    console.error('one-touch error', e);
    return NextResponse.json({ error: 'One-Touch failed' }, { status: 500 });
  }
}

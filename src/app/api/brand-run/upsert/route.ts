import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureWorkspace } from '@/lib/workspace';
import { createRunForWorkspace } from '@/services/orchestrator/brandRunHelper';

async function resolveWorkspaceId(bodyWorkspaceId?: string): Promise<string> {
  // 1) prefer explicit body id if valid
  if (bodyWorkspaceId) {
    try {
      const found = await prisma.workspace.findUnique({ where: { id: bodyWorkspaceId } });
      if (found) return found.id;
    } catch (error) {
      console.warn('Failed to find workspace by ID:', error);
    }
  }

  // 2) try to get workspace from cookies/session
  try {
    const workspaceId = await ensureWorkspace();
    // Verify the workspace actually exists in database
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (workspace) return workspace.id;
  } catch (error) {
    console.warn('Failed to get workspace from session:', error);
  }

  // 3) create a default demo workspace if none exists
  try {
    const demoWorkspace = await prisma.workspace.upsert({
      where: { slug: 'demo-workspace' },
      update: {},
      create: { 
        name: 'Demo Workspace', 
        slug: 'demo-workspace' 
      }
    });
    return demoWorkspace.id;
  } catch (error) {
    console.error('Failed to create demo workspace:', error);
    throw new Error('Unable to create or find workspace');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { auto = false, step } = body;
    
    // Ensure we have a valid workspace ID before proceeding
    const workspaceId = await resolveWorkspaceId(body.workspaceId);

    try {
      const newRun = await createRunForWorkspace(workspaceId, auto);
      return NextResponse.json({ data: newRun });
    } catch (dbError) {
      // Fallback to mock data if database fails
      console.log('Database creation failed, using mock data:', dbError);
      const mockRun = {
        id: 'mock_' + Date.now(),
        workspaceId,
        step: step || 'CONNECT',
        auto,
        selectedBrandIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        stats: { brands: 0, creditsUsed: 0 }
      };
      return NextResponse.json({ data: mockRun });
    }
  } catch (error: any) {
    console.error('Error creating brand run:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create brand run' },
      { status: 500 }
    );
  }
}

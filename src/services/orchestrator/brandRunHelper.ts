import { prisma } from '@/lib/prisma'
import { BrandRun, RunStep } from './brandRun'

export async function getCurrentRunForWorkspace(workspaceId: string): Promise<BrandRun | null> {
  return await prisma.brandRun.findFirst({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createRunForWorkspace(workspaceId: string, auto: boolean = false): Promise<BrandRun> {
  return await prisma.brandRun.create({
    data: {
      workspaceId,
      step: 'CONNECT',
      auto,
      selectedBrandIds: [],
      contactIds: [],
    }
  });
}

export async function updateRunStep(workspaceId: string, step: RunStep): Promise<void> {
  await prisma.brandRun.updateMany({
    where: { workspaceId },
    data: { step }
  });
}

export async function updateRunData(workspaceId: string, data: Partial<BrandRun>): Promise<void> {
  await prisma.brandRun.updateMany({
    where: { workspaceId },
    data
  });
}

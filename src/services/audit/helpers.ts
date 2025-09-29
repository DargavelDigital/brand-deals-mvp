import { prisma } from '@/lib/prisma';
import { getProviders } from '@/services/providers';

export async function getLatestAuditOrRunAudit(workspaceId: string) {
  const latest = await prisma().audit.findFirst({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' }
  });
  if (latest) return { id: latest.id, snapshot: latest.snapshotJson };

  const providers = getProviders();
  const result = await providers.audit.run({ workspaceId });
  // Expect providers.audit.run to create & return an audit row (or we insert here)
  const created = await prisma().audit.create({
    data: {
      workspaceId,
      sources: result.sources ?? [],
      snapshotJson: result.snapshot ?? result,
    }
  });
  return { id: created.id, snapshot: created.snapshotJson };
}

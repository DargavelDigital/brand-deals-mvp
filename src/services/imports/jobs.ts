import { on } from '@/lib/jobs';
import { ingestRows } from './ingest';
import { prisma } from '@/lib/prisma';

on('import:ingestChunk', async (p: { jobId: string, workspaceId: string, kind: any, rows: any[] }) => {
  const job = await prisma.importJob.findUnique({ where: { id: p.jobId }});
  if (!job) return;
  const mapping = ((job.summaryJson as any)?.mapping) || {};
  await ingestRows({ workspaceId: p.workspaceId, kind: p.kind, rows: p.rows, mapping, importJobId: p.jobId });
  await prisma.importJob.update({ where: { id: p.jobId }, data: { processed: { increment: p.rows.length }}});
});

on('import:finalize', async ({ jobId }: { jobId: string }) => {
  await prisma.importJob.update({ where: { id: jobId }, data: { status: 'COMPLETED' }});
});

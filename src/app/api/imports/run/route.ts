import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo';
import { fetchSheetAsCsv, streamCsv } from '@/services/imports/reader';
import { enqueue } from '@/lib/jobs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function POST(req: NextRequest) {
  const { workspaceId } = await requireSessionOrDemo(req);
  const { jobId } = await req.json();
  const job = await prisma.importJob.findFirst({ where: { id: jobId, workspaceId }});
  if (!job) return NextResponse.json({ ok:false, error:'NOT_FOUND' }, { status:404 });

  // Load CSV buffer from fileUrl/sheet
  let buf: Buffer;
  if (job.sheetId) buf = await fetchSheetAsCsv(job.sheetId, job.sheetRange ?? undefined);
  else if (job.fileUrl) {
    const res = await fetch(job.fileUrl);
    buf = Buffer.from(await res.arrayBuffer());
  } else return NextResponse.json({ ok:false, error:'NO_DATA' }, { status:400 });

  await prisma.importJob.update({ where: { id: jobId }, data: { status: 'RUNNING' }});

  // chunk producer
  const rows: any[] = [];
  for await (const row of streamCsv(buf)) {
    rows.push(row);
    if (rows.length >= 1000) {
      await enqueue('import:ingestChunk', { jobId, workspaceId, kind: job.kind, rows });
      rows.length = 0;
    }
  }
  if (rows.length) await enqueue('import:ingestChunk', { jobId, workspaceId, kind: job.kind, rows });

  await enqueue('import:finalize', { jobId });
  return NextResponse.json({ ok:true });
}

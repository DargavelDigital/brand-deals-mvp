import { NextRequest, NextResponse } from 'next/server';
import { withTrace } from '@/middleware/withTrace';
import { runExport } from '@/services/exports/runExport';

export const dynamic = 'force-dynamic';

export const POST = withTrace(async (req: NextRequest) => {
  const { jobId } = await req.json();
  await runExport(jobId);
  return NextResponse.json({ ok: true });
});

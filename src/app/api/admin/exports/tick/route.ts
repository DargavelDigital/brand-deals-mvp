import { NextRequest, NextResponse } from 'next/server';
import { withTrace } from '@/middleware/withTrace';
import { prisma } from '@/lib/prisma';
import { runExport } from '@/services/exports/runExport';

export const POST = withTrace(async (req: NextRequest) => {
  const { jobId } = await req.json();
  await runExport(jobId);
  return NextResponse.json({ ok: true });
});

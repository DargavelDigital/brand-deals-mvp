import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')!;
  const job = await prisma.exportJob.findUnique({ where: { id }});
  if (!job) return NextResponse.json({ ok:false }, { status: 404 });
  return NextResponse.json({ ok: true, job });
}

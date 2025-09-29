import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { prisma } = await import('@/lib/prisma');
  const id = req.nextUrl.searchParams.get('id')!;
  const job = await prisma().exportJob.findUnique({ where: { id }});
  if (!job) return NextResponse.json({ ok:false }, { status: 404 });
  return NextResponse.json({ ok: true, job });
}

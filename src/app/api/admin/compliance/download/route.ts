import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { requireSession } from '@/lib/auth/requireSession';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req);
    if (session instanceof NextResponse) return session;

  // Check if user is admin/owner
  const membership = await prisma().membership.findFirst({
    where: { 
      workspaceId: (session.user as any).workspaceId, 
      userId: (session.user as any).id,
      role: { in: ['OWNER', 'ADMIN'] }
    }
  });

  if (!membership) {
    return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: 403 });
  }

  const kind = req.nextUrl.searchParams.get('kind'); // 'dpa' | 'baa' | 'soc2'
  const map: Record<string,string> = {
    dpa: 'DPA-template.md',
    baa: 'BAA-template.md',
    soc2: 'SOC2-backlog.md'
  };
  const file = map[kind || ''] || '';
  if (!file) return NextResponse.json({ ok:false }, { status: 404 });
  
  const p = path.join(process.cwd(), 'docs', 'compliance', file);
  if (!fs.existsSync(p)) return NextResponse.json({ ok:false }, { status: 404 });
  
  const buf = fs.readFileSync(p);
  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'text/markdown',
      'Content-Disposition': `attachment; filename="${file}"`
    }
  });
  } catch (error) {
    console.error('Error downloading compliance file:', error);
    return NextResponse.json({ ok: false, error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

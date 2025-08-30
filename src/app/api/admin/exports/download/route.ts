import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { getAuth } from '@/lib/auth/getAuth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const auth = await getAuth(true);
  if (!auth) {
    return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
  }

  // Check if user is admin/owner
  const membership = await prisma.membership.findFirst({
    where: { 
      workspaceId: auth.workspaceId, 
      userId: auth.user.id,
      role: { in: ['OWNER', 'ADMIN'] }
    }
  });

  if (!membership) {
    return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: 403 });
  }

  const id = req.nextUrl.searchParams.get('id')!;
  const job = await prisma.exportJob.findUnique({ where: { id }});
  if (!job || job.workspaceId !== auth.workspaceId || job.status !== 'DONE') {
    return NextResponse.json({ ok:false }, { status: 404 });
  }

  const filePath = path.join('/tmp', `export_${id}.zip`);
  if (!fs.existsSync(filePath)) return NextResponse.json({ ok:false }, { status: 404 });

  const buf = fs.readFileSync(filePath);
  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="workspace_export_${id}.zip"`
    }
  });
}

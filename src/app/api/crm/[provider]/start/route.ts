import { NextResponse, type NextRequest } from 'next/server';
import { getCrm } from '@/services/crm';
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo';

export async function GET(req: Request, { params }: { params: { provider: string }}) {
  const { workspaceId } = await requireSessionOrDemo(req as any);
  const crm = await getCrm(workspaceId);
  const url = await crm.connectUrl();
  return NextResponse.redirect(url);
}

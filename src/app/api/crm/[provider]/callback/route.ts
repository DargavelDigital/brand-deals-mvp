import { NextRequest, NextResponse } from 'next/server';
import { getCrm } from '@/services/crm';
import { requireSessionOrDemo } from '@/lib/authz';

export async function GET(req: NextRequest, { params }: { params: { provider: string }}) {
  const { workspaceId } = await requireSessionOrDemo(req);
  const code = new URL(req.url).searchParams.get('code') || '';
  const crm = await getCrm(workspaceId);
  await crm.handleCallback(code);
  return NextResponse.redirect('/settings?crm=connected');
}

import { NextRequest, NextResponse } from 'next/server'
import { withIdempotency } from '@/lib/idempotency';
import { requireAdmin, auditLog } from '@/lib/admin/guards'
import { startImpersonation, endImpersonation } from '@/lib/admin/impersonation'

async function POST_impl(req: NextRequest) {
  const admin = await requireAdmin()
  const { workspaceId, reason } = await req.json()
  const { token } = await startImpersonation(admin.id, workspaceId, reason)
  await auditLog({ action: 'IMPERSONATE_START', workspaceId, adminId: admin.id, metadata: { reason } })
  return NextResponse.json({ ok: true })
}

async function DELETE_impl() {
  const admin = await requireAdmin()
  await endImpersonation()
  await auditLog({ action: 'IMPERSONATE_END', adminId: admin.id })
  return NextResponse.json({ ok: true })
}

export const POST = withIdempotency(POST_impl);
export const DELETE = withIdempotency(DELETE_impl);

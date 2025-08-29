import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, auditLog } from '@/lib/admin/guards'
import { startImpersonation, endImpersonation } from '@/lib/admin/impersonation'

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  const { workspaceId, reason } = await req.json()
  const { token } = await startImpersonation(admin.id, workspaceId, reason)
  await auditLog({ action: 'IMPERSONATE_START', workspaceId, adminId: admin.id, metadata: { reason } })
  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  const admin = await requireAdmin()
  await endImpersonation()
  await auditLog({ action: 'IMPERSONATE_END', adminId: admin.id })
  return NextResponse.json({ ok: true })
}

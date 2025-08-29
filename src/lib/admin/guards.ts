import { cookies, headers } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function requireAdmin() {
  const h = await headers()
  const cookieStore = await cookies()
  const adminEmail = h.get('x-admin-email') || cookieStore.get('admin_email')?.value // simple dev gate
  if (!adminEmail) throw new Error('ADMIN_REQUIRED')
  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, role: 'SUPER' },
  })
  return admin
}

export function maskPII(obj: any): any {
  if (obj == null) return obj
  if (typeof obj === 'string') {
    // redact emails / tokens / phones
    return obj
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]')
      .replace(/\b\d{10,}\b/g, '[redacted-phone]')
      .replace(/(sk-[\w-]{20,}|Bearer\s+[A-Za-z0-9._-]+)/gi, '[redacted-secret]')
  }
  if (Array.isArray(obj)) return obj.map(maskPII)
  if (typeof obj === 'object') {
    const out: any = {}
    for (const k of Object.keys(obj)) {
      if (/(email|token|authorization|password|secret)/i.test(k)) {
        out[k] = '[redacted]'
      } else {
        out[k] = maskPII(obj[k])
      }
    }
    return out
  }
  return obj
}

export async function auditLog(input: {
  action: string
  workspaceId?: string
  userId?: string
  adminId?: string
  metadata?: any
  traceId?: string
  ip?: string
  ua?: string
}) {
  const safeMeta = maskPII(input.metadata ?? {})
  await prisma.auditLog.create({ data: { ...input, metadata: safeMeta } })
}

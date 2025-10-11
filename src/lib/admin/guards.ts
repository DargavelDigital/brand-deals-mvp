import { cookies, headers } from 'next/headers'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth-options'

export async function requireAdmin() {
  const { prisma } = await import('@/lib/prisma');
  
  // Check session first (proper auth)
  const session = await getServerSession(authOptions);
  
  if (session?.user?.email) {
    // Check if user is admin via Admin table (by email, not userId)
    const admin = await prisma().admin.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, role: true }
    });
    
    if (admin) {
      console.log('[requireAdmin] Admin access granted via session:', admin.email);
      return admin;
    }
  }
  
  // Fallback to dev mode check (for development)
  const h = await headers()
  const cookieStore = await cookies()
  const adminEmail = h.get('x-admin-email') || cookieStore.get('admin_email')?.value
  
  if (adminEmail) {
    console.log('[requireAdmin] Admin access granted via dev cookie:', adminEmail);
    const admin = await prisma().admin.upsert({
      where: { email: adminEmail },
      update: {},
      create: { email: adminEmail, role: 'SUPER' },
    })
    return admin;
  }
  
  // No admin access
  console.error('[requireAdmin] Admin access DENIED - no session or dev cookie');
  throw new Error('ADMIN_REQUIRED')
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
  await prisma().auditLog.create({ data: { ...input, metadata: safeMeta } })
}

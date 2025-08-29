import { prisma } from '@/lib/prisma'

export async function captureError(e: any, ctx: { workspaceId?: string, where: string, meta?: any, traceId?: string }) {
  try {
    await prisma.errorEvent.create({
      data: {
        workspaceId: ctx.workspaceId ?? null,
        where: ctx.where,
        message: e?.message || String(e),
        stack: e?.stack,
        meta: ctx.meta ?? {},
        traceId: ctx.traceId,
      }
    })
  } catch { /* swallow */ }
}

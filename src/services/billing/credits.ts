import { prisma } from '@/lib/prisma'

export type AiUsageLite = {
  model?: string
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
}

const PRICE_PER_TOKEN_USD = 0.000002 // conservative default if you don't want model branching
const TOKENS_PER_CREDIT = 1000       // 1 credit = 1K tokens (adjust to your plan math)

function safeHas<T extends object>(obj: T, key: string) {
  return obj && Object.prototype.hasOwnProperty.call(obj, key)
}

export function estimateCostUSD(u?: AiUsageLite) {
  if (!u?.totalTokens) return 0
  return +(u.totalTokens * PRICE_PER_TOKEN_USD).toFixed(6)
}

export function tokensToCredits(tokens?: number) {
  if (!tokens || tokens <= 0) return 0
  return Math.max(1, Math.ceil(tokens / TOKENS_PER_CREDIT))
}

export async function readWorkspaceCredits(workspaceId: string): Promise<number | null> {
  try {
    // Check if workspaces table exists and has credits column
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { credits: true }
    })
    return workspace?.credits ?? null
  } catch {
    return null
  }
}

export async function spendCredits(workspaceId: string, credits: number, meta?: Record<string, any>) {
  if (!workspaceId || credits <= 0) return { ok: true, skipped: 'no_ws_or_zero' }
  try {
    // Try to update credits if the column exists
    await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        credits: {
          decrement: credits
        }
      }
    })
    
    await recordAiUsage(workspaceId, { kind: 'debit', credits }, meta)
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message || 'spend_failed' }
  }
}

export async function recordAiUsage(workspaceId: string | null, payload: Record<string, any>, meta?: Record<string, any>) {
  const entry = { ts: new Date().toISOString(), workspaceId, ...payload, ...(meta || {}) }
  
  // Try to persist to jobs/tasks if present; otherwise console.log
  try {
    // Check if we have a jobs or tasks table in Prisma
    const hasJobs = 'jobs' in prisma
    const hasTasks = 'tasks' in prisma
    
    if (hasJobs) {
      // @ts-ignore - jobs table exists
      await prisma.jobs.create({
        data: {
          type: payload.kind ? `ai.${payload.kind}` : 'ai.usage',
          status: 'ok',
          data: entry,
          createdAt: new Date()
        }
      })
    } else if (hasTasks) {
      // @ts-ignore - tasks table exists
      await prisma.tasks.create({
        data: {
          type: payload.kind ? `ai.${payload.kind}` : 'ai.usage',
          status: 'ok',
          data: entry,
          createdAt: new Date()
        }
      })
    } else {
      // eslint-disable-next-line no-console
      console.log('[AI_USAGE]', JSON.stringify(entry))
    }
  } catch {
    // eslint-disable-next-line no-console
    console.log('[AI_USAGE:FALLBACK]', JSON.stringify(entry))
  }
}

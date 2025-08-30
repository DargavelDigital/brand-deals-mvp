import { prisma } from '@/lib/prisma'
import { env, flag } from './env'

export async function getWorkspaceFlags(workspaceId: string) {
  const ws = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { featureFlags: true }
  })
  const fromDb = (ws?.featureFlags ?? {}) as Record<string, any>

  // server-level toggles (coerce "1"/"true")
  const fromEnv: Record<string, any> = {
    'ai.audit.v2': flag(env.AI_AUDIT_V2),
    'ai.match.v2': flag(env.AI_MATCH_V2),
    'match.local.enabled': flag(env.MATCH_LOCAL_ENABLED),
    'outreach.tones': flag(env.OUTREACH_TONES),
    'brandrun.oneTouch': flag(env.BRANDRUN_ONETOUCH),
    'mediapack.v2': flag(env.MEDIAPACK_V2),
    'brandrun.selectTopN': Number(env.BRANDRUN_SELECT_TOPN || '6'),
  }

  // precedence: env = defaults, workspace overrides take precedence:
  return { ...fromEnv, ...fromDb }
}

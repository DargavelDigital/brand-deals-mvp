import { prisma } from '@/lib/prisma'

export async function getWorkspaceFlags(workspaceId: string) {
  const ws = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { featureFlags: true }
  })
  const fromDb = (ws?.featureFlags ?? {}) as Record<string, any>

  // server-level toggles (coerce "1"/"true")
  const fromEnv: Record<string, any> = {
    'ai.audit.v2': ['1','true'].includes((process.env.AI_AUDIT_V2 ?? '').toLowerCase()),
    'ai.match.v2': ['1','true'].includes((process.env.AI_MATCH_V2 ?? '').toLowerCase()),
    'match.local.enabled': ['1','true'].includes((process.env.MATCH_LOCAL_ENABLED ?? '').toLowerCase()),
    'outreach.tones': ['1','true'].includes((process.env.OUTREACH_TONES ?? '').toLowerCase()),
    'brandrun.oneTouch': ['1','true'].includes((process.env.BRANDRUN_ONETOUCH ?? '').toLowerCase()),
    'mediapack.v2': ['1','true'].includes((process.env.MEDIAPACK_V2 ?? '').toLowerCase()),
    'brandrun.selectTopN': Number(process.env.BRANDRUN_SELECT_TOPN || 6),
  }

  // precedence: env = defaults, workspace overrides take precedence:
  return { ...fromEnv, ...fromDb }
}

import type { Plan } from '@prisma/client'

export const PLAN_LIMITS: Record<Plan, {
  aiTokensMonthly: number
  emailsPerDay: number
  maxContacts: number
}> = {
  FREE: { aiTokensMonthly: 100_000, emailsPerDay: 20, maxContacts: 500 },
  PRO:  { aiTokensMonthly: 2_000_000, emailsPerDay: 500, maxContacts: 20_000 },
  TEAM: { aiTokensMonthly: 10_000_000, emailsPerDay: 2_000, maxContacts: 200_000 },
}

// lookup_key -> credit grants
export const TOPUP_GRANTS: Record<string, { kind: 'AI' | 'EMAIL'; amount: number }> = {
  addon_ai_100k: { kind: 'AI', amount: 100_000 },
  addon_ai_1M:   { kind: 'AI', amount: 1_000_000 },
  addon_email_100:  { kind: 'EMAIL', amount: 100 },
  addon_email_1000: { kind: 'EMAIL', amount: 1_000 },
}

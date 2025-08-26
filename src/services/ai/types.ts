import { z } from 'zod'

export const MatchIdea = z.object({
  brand: z.string(),
  score: z.number().min(0).max(100),
  why: z.string()
})
export type TMatchIdea = z.infer<typeof MatchIdea>

export const AuditInsight = z.object({
  niche: z.string(),
  tone: z.string(),
  audience: z.array(z.string()).default([]),
  strengths: z.array(z.string()).default([]),
  risks: z.array(z.string()).default([])
})
export type TAuditInsight = z.infer<typeof AuditInsight>

export const EmailDraft = z.object({
  subject: z.string(),
  body: z.string()
})
export type TEmailDraft = z.infer<typeof EmailDraft>

export type AiUsage = {
  model: string
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
  costUsdApprox?: number
}

export type AiResult<T> = {
  ok: true
  data: T
  usage?: AiUsage
} | {
  ok: false
  error: string
}

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { chatJSON } from '@/services/ai/openai'
import { systemBrandRun, promptMatch } from '@/services/ai/prompts'
import { MatchIdea } from '@/services/ai/types'
import { rateLimitOk } from '@/lib/rateLimit'
import { currentWorkspaceId } from '@/lib/currentWorkspace'
import { estimateCostUSD, tokensToCredits, spendCredits, recordAiUsage } from '@/services/billing/credits'
import { openai } from '@/services/ai/openai' // to detect MOCK mode (null means mock)

const Body = z.object({
  auditJson: z.string().min(2),
  brandHints: z.string().optional()
})

export async function POST(req: Request) {
  const reqId = crypto.randomUUID?.() || Math.random().toString(36).slice(2)
  const ip = (req.headers.get('x-forwarded-for') || 'local').split(',')[0].trim()
  if (!rateLimitOk(`ai:match:${ip}`)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })

  const body = await req.json().catch(()=>null)
  const parsed = Body.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  const { auditJson, brandHints } = parsed.data
  const res = await chatJSON(
    [{ role:'system', content: systemBrandRun }, { role:'user', content: promptMatch(auditJson, brandHints) }],
    (data) => {
      const arr = Array.isArray(data) ? data : (data as Record<string, unknown>)?.matches
      if (!Array.isArray(arr)) throw new Error('Invalid match response')
      return arr.map((x: Record<string, unknown>) => MatchIdea.parse(x))
    }
  )
  if (!res.ok) {
    console.error('[AI_ERROR]', { reqId, route: 'ai/match', error: res.error })
    return NextResponse.json({ error: res.error }, { status: 500 })
  }
  
  const wsid = await currentWorkspaceId()
  const isMock = !openai
  const tokens = res.usage?.totalTokens ?? 0
  const credits = isMock ? 0 : tokensToCredits(tokens)
  const cost = estimateCostUSD(res.usage)

  await recordAiUsage(wsid, {
    kind: 'match',
    model: res.usage?.model,
    tokens,
    credits,
    costUsd: cost
  }, { ip, reqId })

  if (!isMock && credits > 0 && wsid) {
    await spendCredits(wsid, credits, { endpoint: 'ai/match' })
  }

  return NextResponse.json(res)
}

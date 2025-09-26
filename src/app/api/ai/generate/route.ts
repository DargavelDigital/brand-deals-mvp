import { NextResponse } from 'next/server'
import { z } from 'zod'
import { chatJSON } from '@/services/ai/openai'
import { systemBrandRun, promptEmail } from '@/services/ai/prompts'
import { EmailDraft } from '@/services/ai/types'
import { rateLimitOk } from '@/lib/rateLimit'
import { currentWorkspaceId } from '@/lib/currentWorkspace'
import { estimateCostUSD, tokensToCredits, spendCredits, recordAiUsage } from '@/services/billing/credits'
import { openai } from '@/services/ai/openai' // to detect MOCK mode (null means mock)
import { log } from '@/lib/log';

const Body = z.object({
  creator: z.string().min(2),
  brand: z.string().min(1),
  angle: z.string().min(2)
})

export async function POST(req: Request) {
  const reqId = crypto.randomUUID?.() || Math.random().toString(36).slice(2)
  const ip = (req.headers.get('x-forwarded-for') || 'local').split(',')[0].trim()
  if (!rateLimitOk(`ai:gen:${ip}`)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })

  const body = await req.json().catch(()=>null)
  const parsed = Body.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  const { creator, brand, angle } = parsed.data
  const res = await chatJSON(
    [{ role:'system', content: systemBrandRun }, { role:'user', content: promptEmail(creator, brand, angle) }],
    (data) => EmailDraft.parse(data)
  )
  if (!res.ok) {
    log.error('[AI_ERROR]', { reqId, route: 'ai/generate', error: res.error })
    return NextResponse.json({ error: res.error }, { status: 500 })
  }
  
  const wsid = await currentWorkspaceId()
  const isMock = !openai
  const tokens = res.usage?.totalTokens ?? 0
  const credits = isMock ? 0 : tokensToCredits(tokens)
  const cost = estimateCostUSD(res.usage)

  await recordAiUsage(wsid, {
    kind: 'email',
    model: res.usage?.model,
    tokens,
    credits,
    costUsd: cost
    }, { ip, reqId })

  if (!isMock && credits > 0 && wsid) {
    await spendCredits(wsid, credits, { endpoint: 'ai/generate' })
  }

  return NextResponse.json(res)
}

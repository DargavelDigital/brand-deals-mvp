import OpenAI from 'openai'
import { AiResult, AiUsage } from './types'

const apiKey = process.env.OPENAI_API_KEY || ''
const defaultModel = process.env.OPENAI_MODEL || 'gpt-4o-mini'
const maxTokens = Number(process.env.OPENAI_MAX_TOKENS || 1200)

// single client (server-side runtimes only)
export const openai = apiKey ? new OpenAI({ apiKey }) : null

if (!openai) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn('[AI] OPENAI_API_KEY missing — running in MOCK mode.')
  }
}

function usageFromAny(u: unknown): AiUsage | undefined {
  if (!u || typeof u !== 'object') return
  const usage = u as Record<string, unknown>
  return {
    model: (usage.model as string) || defaultModel,
    promptTokens: (usage.prompt_tokens ?? usage.promptTokens) as number | undefined,
    completionTokens: (usage.completion_tokens ?? usage.completionTokens) as number | undefined,
    totalTokens: (usage.total_tokens ?? usage.totalTokens) as number | undefined,
    // rough estimate; adjust if you want to be precise per-model
    costUsdApprox: usage.total_tokens ? +((usage.total_tokens as number) * 0.000002).toFixed(6) : undefined
  }
}

export async function chatJSON<T>(messages: { role: 'system'|'user'|'assistant'; content: string }[], schemaGuard?: (data:any)=>T): Promise<AiResult<T>> {
  // MOCK MODE: no key → deterministic stub
  if (!openai) {
    try {
      // For MOCK mode, we'll return empty data that matches the schema structure
      // The schemaGuard will handle validation and provide defaults
      const mock = schemaGuard ? schemaGuard({}) : ({} as T)
      return { ok: true, data: mock }
    } catch (e:any) {
      return { ok: false, error: 'MOCK validation failed: ' + e.message }
    }
  }

  try {
    const res = await openai.chat.completions.create({
      model: defaultModel,
      messages,
      temperature: 0.2,
      max_tokens: maxTokens,
      response_format: process.env.OPENAI_JSON === 'true' ? { type: 'json_object' } as any : undefined,
    } as any)

    const text = res.choices?.[0]?.message?.content?.trim() || '{}'
    const json = JSON.parse(text)
    const data = schemaGuard ? schemaGuard(json) : json
    return { ok: true, data, usage: usageFromAny(res.usage) }
  } catch (e:any) {
    return { ok: false, error: e?.message || 'OpenAI error' }
  }
}

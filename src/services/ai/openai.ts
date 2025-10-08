import OpenAI from 'openai'
import { AiResult, AiUsage } from './types'
import { createTrace, withTrace, logAIEvent, createAIEvent } from '@/lib/observability'
import { env, flag } from '@/lib/env'
import { AI_MODEL } from '@/config/ai'

const apiKey = env.OPENAI_API_KEY || ''
const maxTokens = Number(env.OPENAI_MAX_TOKENS || '1200')

// single client (server-side runtimes only)
export const openai = apiKey ? new OpenAI({ apiKey }) : null

if (!openai) {
  if (env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn('[AI] OPENAI_API_KEY missing — running in MOCK mode.')
  }
}

function usageFromAny(u: unknown): AiUsage | undefined {
  if (!u || typeof u !== 'object') return
  const usage = u as Record<string, unknown>
  return {
    model: (usage.model as string) || AI_MODEL,
    promptTokens: (usage.prompt_tokens ?? usage.promptTokens) as number | undefined,
    completionTokens: (usage.completion_tokens ?? usage.completionTokens) as number | undefined,
    totalTokens: (usage.total_tokens ?? usage.totalTokens) as number | undefined,
    // rough estimate; adjust if you want to be precise per-model
    costUsdApprox: usage.total_tokens ? +((usage.total_tokens as number) * 0.000002).toFixed(6) : undefined
  }
}

// Main AI invocation function with observability
export async function aiInvoke<T>(
  promptKey: string,
  messages: { role: 'system'|'user'|'assistant'; content: string }[],
  schemaGuard?: (data: any) => T,
  metadata?: Record<string, any>
): Promise<AiResult<T>> {
  const traceContext = createTrace()
  
  try {
    // Log the start of the AI call
    console.log(`🤖 AI Call Started: ${promptKey}`, { traceId: traceContext.traceId })
    
    const result = await chatJSON(messages, schemaGuard)
    
    // Calculate tokens used
    const tokensUsed = result.usage ? {
      input: result.usage.promptTokens || 0,
      output: result.usage.completionTokens || 0,
      total: result.usage.totalTokens || 0
    } : undefined
    
    // Log the AI event
    const aiEvent = createAIEvent(
      traceContext,
      'openai',
      promptKey,
      tokensUsed,
      metadata
    )
    logAIEvent(aiEvent)
    
    return result
  } catch (error: any) {
    // Log error event
    const errorMessage = error instanceof Error ? error.message : 
                        (error?.message || error?.toString?.() || 'Unknown error');
    const errorEvent = createAIEvent(
      traceContext,
      'openai',
      promptKey,
      undefined,
      { ...metadata, error: errorMessage }
    )
    logAIEvent(errorEvent)
    
    throw error
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
    // Build request params
    // Note: For GPT-4 and newer models, response_format is supported
    // For older models or if not specified, it's optional
    const params: OpenAI.Chat.ChatCompletionCreateParams = {
      model: AI_MODEL,
      messages,
      temperature: 0.2,
      max_tokens: maxTokens,
    }
    
    // Add JSON response format if enabled
    // This works with gpt-4-turbo-preview, gpt-4o, etc.
    if (flag(env.OPENAI_JSON)) {
      params.response_format = { type: 'json_object' }
    }
    
    console.error('🔴 OpenAI API call params:', {
      model: params.model,
      temperature: params.temperature,
      max_tokens: params.max_tokens,
      response_format: params.response_format,
      messages: params.messages.length
    })

    const res = await openai.chat.completions.create(params)

    console.error('🔴 OpenAI API response received:', {
      choices: res.choices?.length,
      usage: res.usage
    })

    const text = res.choices?.[0]?.message?.content?.trim() || '{}'
    const json = JSON.parse(text)
    const data = schemaGuard ? schemaGuard(json) : json
    return { ok: true, data, usage: usageFromAny(res.usage) }
  } catch (e:any) {
    console.error('🔴 OpenAI API error:', e?.message || e)
    console.error('🔴 OpenAI API error details:', JSON.stringify(e, null, 2))
    return { ok: false, error: e?.message || 'OpenAI error' }
  }
}

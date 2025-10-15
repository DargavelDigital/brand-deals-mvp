import { loadPack } from './promptPacks';
import { openAIJsonResponse } from './client';
import type { AIPromptOptions, StyleTone, StyleBrevity } from './types';
import { newTraceId, logAIEvent } from '../lib/observability';
import { withTimeout, retry, logAiUsage, newTraceId as newRuntimeTraceId } from '../services/ai/runtime';
import { makeDeterministicStub } from '../services/ai/dryRun';
import { flags } from '../lib/flags';
import { checkAndConsumeAI, EntitlementError } from '@/services/billing/consume'
import { env } from '@/lib/env'
import { AI_MODEL } from '@/config/ai'

const TONE_PROMPTS: Record<StyleTone, string> = {
  professional: 'Tone: professional, concise, specific, no hype.',
  relaxed: 'Tone: relaxed, clear, confident, friendly.',
  fun: 'Tone: playful, witty, but still clear and respectful.',
};

const BREVITY: Record<StyleBrevity, string> = {
  short: 'Brevity: short.',
  medium: 'Brevity: medium detail.',
  detailed: 'Brevity: detailed.',
};

export async function aiInvoke<TIn, TOut>(
  packKey: Parameters<typeof loadPack>[0],
  input: TIn,
  opts: AIPromptOptions = {},
): Promise<TOut> {
  const pack = loadPack(packKey as any, opts.version);
  const model = opts.model || env.OPENAI_MODEL_JSON || AI_MODEL;
  const traceId = opts?.traceId ?? newRuntimeTraceId();
  
  // EPIC 9: Provider overrides and performance settings
  const timeoutMs = flags.provider.openai.timeoutMs ?? flags.perf.aiDefaultTimeoutMs;
  const maxRetries = flags.provider.openai.maxRetries ?? flags.perf.aiDefaultMaxRetries;
  
  // EPIC 9: Dry-run mode for development
  if (flags.qa.aiDryRun) {
    const fake = makeDeterministicStub(packKey, input);
    await logAiUsage({ 
      workspaceId: opts?.workspaceId ?? 'demo-workspace', 
      traceId, 
      packKey, 
      metrics: {
        provider: 'openai', 
        model: 'dry-run', 
        inputTokens: 0, 
        outputTokens: 0, 
        dryRun: true
      }
    });
    return { ...fake, __traceId: traceId } as TOut;
  }

  const styleLines = [
    opts.tone ? TONE_PROMPTS[opts.tone] : '',
    opts.brevity ? BREVITY[opts.brevity] : '',
    'Always return VALID JSON strictly following the output schema.',
  ].filter(Boolean).join('\n');

  const userContent = `INPUT JSON:\n${JSON.stringify(input)}\n\n${styleLines}`;

  const baseSystem = `${pack.systemPrompt}\nFollow the output schema exactly. If fields are missing, make the best conservative choice.`;

  const messagesWithFewshots = [
    ...(pack.fewshots?.slice(0, 3) ?? []).flatMap(fs => [
      { role: 'user' as const, content: `INPUT JSON:\n${JSON.stringify(fs.input)}` },
      { role: 'assistant' as const, content: JSON.stringify(fs.output) },
    ]),
    { role: 'user' as const, content: userContent },
  ];

  const start = Date.now();
  
  // EPIC 11: Check and consume AI credits
  if (opts?.workspaceId) {
    const est = Math.max(1000, JSON.stringify(input).length)  // simplistic safety
    try {
      await checkAndConsumeAI(opts.workspaceId, est, `ai.invoke:${packKey}`)
    } catch (err) {
      if (err instanceof EntitlementError) {
        throw new Error('AI token limit reached - please upgrade your plan or purchase additional tokens')
      }
      throw err
    }
  }
  
  try {
    // EPIC 9: Wrap with timeout and retry
    const exec = () => openAIJsonResponse({
      model,
      system: baseSystem,
      messages: messagesWithFewshots,
      schema: pack.outputSchema,
      temperature: pack.modelHints?.temperature ?? 0.2,
      max_output_tokens: pack.modelHints?.max_output_tokens ?? 800,
      traceId,
    });
    
    const response = await retry(
      () => withTimeout(exec(), timeoutMs, packKey), 
      maxRetries, 
      flags.perf.aiBackoffBaseMs
    );

    try {
      const parsed = JSON.parse(response.text);
      
      // EPIC 9: Log AI usage with token information (skip for admins)
      if (!opts?.isAdmin) {
        try {
          await logAiUsage({
            workspaceId: opts?.workspaceId ?? 'demo-workspace',
            traceId,
            packKey,
            metrics: {
              provider: 'openai',
              model: response.model,
              inputTokens: response.inputTokens,
              outputTokens: response.outputTokens,
              dryRun: false
            }
          });
        } catch (trackingError) {
          console.error('⚠️ AI usage tracking failed (non-critical):', trackingError);
          // Don't fail the audit just because tracking failed
        }
      } else {
        console.log('🔓 Admin bypass - skipping AI usage tracking');
      }
      
      logAIEvent?.({ traceId, provider: 'openai', promptKey: packKey, latencyMs: Date.now() - start, tokensUsed: { input: response.inputTokens, output: response.outputTokens, total: response.inputTokens + response.outputTokens }, timestamp: new Date().toISOString() });
      return { ...parsed, __traceId: traceId } as TOut;
    } catch {
      // Retry: remove fewshots + harder instruction
      const response2 = await openAIJsonResponse({
        model: env.OPENAI_MODEL_FALLBACK || model,
        system: 'Return ONLY valid JSON for the provided schema. Do not include explanations.',
        messages: [{ role: 'user', content: userContent }],
        schema: pack.outputSchema,
        temperature: 0,
        max_output_tokens: pack.modelHints?.max_output_tokens ?? 800,
        traceId,
      });
      const parsed2 = JSON.parse(response2.text);
      
      // EPIC 9: Log AI usage for fallback call (skip for admins)
      if (!opts?.isAdmin) {
        try {
          await logAiUsage({
            workspaceId: opts?.workspaceId ?? 'demo-workspace',
            traceId,
            packKey,
            metrics: {
              provider: 'openai',
              model: response2.model,
              inputTokens: response2.inputTokens,
              outputTokens: response2.outputTokens,
              dryRun: false
            }
          });
        } catch (trackingError) {
          console.error('⚠️ AI usage tracking failed (non-critical):', trackingError);
          // Don't fail the audit just because tracking failed
        }
      } else {
        console.log('🔓 Admin bypass - skipping AI usage tracking (fallback)');
      }
      
      logAIEvent?.({ traceId, provider: 'openai', promptKey: packKey, latencyMs: Date.now() - start, tokensUsed: { input: response2.inputTokens, output: response2.outputTokens, total: response2.inputTokens + response2.outputTokens }, timestamp: new Date().toISOString() });
      return { ...parsed2, __traceId: traceId } as TOut;
    }
  } catch (err) {
    logAIEvent?.({ traceId, provider: 'openai', promptKey: packKey, latencyMs: Date.now() - start, tokensUsed: { input: 0, output: 0, total: 0 }, timestamp: new Date().toISOString() });
    throw err;
  }
}

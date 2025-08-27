import { loadPack } from './promptPacks';
import { openAIJsonResponse } from './client';
import type { AIPromptOptions, StyleTone, StyleBrevity } from './types';
import { newTraceId, logAIEvent } from '../lib/observability';

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
  const model = opts.model || process.env.OPENAI_MODEL_JSON || 'gpt-4o-mini';
  const traceId = newTraceId();

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
  try {
    const text = await openAIJsonResponse({
      model,
      system: baseSystem,
      messages: messagesWithFewshots,
      schema: pack.outputSchema,
      temperature: pack.modelHints?.temperature ?? 0.2,
      max_output_tokens: pack.modelHints?.max_output_tokens ?? 800,
      traceId,
    });

    try {
      const parsed = JSON.parse(text);
      logAIEvent?.({ traceId, provider: 'openai', promptKey: packKey, latencyMs: Date.now() - start, tokensUsed: { input: 0, output: 0, total: 0 }, timestamp: new Date().toISOString() });
      return parsed as TOut;
    } catch {
      // Retry: remove fewshots + harder instruction
      const text2 = await openAIJsonResponse({
        model: process.env.OPENAI_MODEL_FALLBACK || model,
        system: 'Return ONLY valid JSON for the provided schema. Do not include explanations.',
        messages: [{ role: 'user', content: userContent }],
        schema: pack.outputSchema,
        temperature: 0,
        max_output_tokens: pack.modelHints?.max_output_tokens ?? 800,
        traceId,
      });
      const parsed2 = JSON.parse(text2);
      logAIEvent?.({ traceId, provider: 'openai', promptKey: packKey, latencyMs: Date.now() - start, tokensUsed: { input: 0, output: 0, total: 0 }, timestamp: new Date().toISOString() });
      return parsed2 as TOut;
    }
  } catch (err) {
    logAIEvent?.({ traceId, provider: 'openai', promptKey: packKey, latencyMs: Date.now() - start, tokensUsed: { input: 0, output: 0, total: 0 }, timestamp: new Date().toISOString() });
    throw err;
  }
}

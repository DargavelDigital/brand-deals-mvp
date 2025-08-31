import OpenAI from 'openai';
import { env } from '@/lib/env';

// Only create OpenAI client if API key is available
const openai = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;

export async function openAIJsonResponse(args: {
  model: string;
  system: string;
  messages: Array<{ role: 'system'|'user'|'assistant'; content: string }>;
  schema: Record<string, any>;
  max_output_tokens?: number;
  temperature?: number;
  traceId?: string;
}): Promise<{ text: string; inputTokens: number; outputTokens: number; model: string }> {
  if (!openai) {
    throw new Error('OpenAI client not available - OPENAI_API_KEY is missing');
  }

  const { model, system, messages, schema, temperature, max_output_tokens, traceId } = args;

  const res = await openai.responses.create({
    model,
    input: [
      { role: 'system', content: system },
      ...messages
    ],
    response_format: { type: 'json_schema', json_schema: { name: 'structured', schema, strict: true } },
    temperature,
    max_output_tokens,
    metadata: traceId ? { traceId } : undefined,
  });

  const text = typeof res.output_text === 'string'
    ? res.output_text
    : JSON.stringify(res.output, null, 2);

  // EPIC 9: Return token usage information (estimate for now)
  const inputTokens = messages.reduce((sum, msg) => sum + Math.ceil(msg.content.length / 4), 0);
  const outputTokens = Math.ceil(text.length / 4);

  return { text, inputTokens, outputTokens, model };
}

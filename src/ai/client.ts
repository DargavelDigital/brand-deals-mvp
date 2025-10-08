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

  const res = await openai.chat.completions.create({
    model: 'gpt-5', // Updated to GPT-5
    messages: [
      { role: 'system', content: system },
      ...messages
    ],
    // Removed response_format for GPT-5 compatibility
    temperature: 1, // GPT-5 only supports 1
    max_completion_tokens: max_output_tokens, // NEW for GPT-5
    // metadata parameter not supported without store enabled
  });

  const text = res.choices[0]?.message?.content?.trim() || '{}';

  // EPIC 9: Return token usage information (estimate for now)
  const inputTokens = messages.reduce((sum, msg) => sum + Math.ceil(msg.content.length / 4), 0);
  const outputTokens = Math.ceil(text.length / 4);

  return { text, inputTokens, outputTokens, model };
}

import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function openAIJsonResponse(args: {
  model: string;
  system: string;
  messages: Array<{ role: 'system'|'user'|'assistant'; content: string }>;
  schema: Record<string, any>;
  max_output_tokens?: number;
  temperature?: number;
  traceId?: string;
}) {
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

  return text;
}

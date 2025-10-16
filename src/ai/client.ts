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
    model: 'gpt-4o', // Switched to GPT-4o - GPT-5 was returning empty responses
    messages: [
      { role: 'system', content: system },
      ...messages
    ],
    response_format: { 
      type: 'json_schema', 
      json_schema: { 
        name: 'audit_insights', 
        schema: schema,  // Uses outputSchema from prompt pack!
        strict: true 
      } 
    },
    temperature: temperature ?? 0.7, // GPT-4o supports flexible temperatures
    max_tokens: max_output_tokens ?? 4000, // Increased from default - prevents truncation
    // metadata parameter not supported without store enabled
  });

  let text = res.choices[0]?.message?.content?.trim() || '{}';

  console.log('✅ GPT-4o response length:', text.length);
  console.log('📝 First 200 chars:', text.substring(0, 200));
  console.log('📝 Last 200 chars:', text.substring(Math.max(0, text.length - 200)));
  
  if (text.length === 0) {
    console.error('❌ GPT-4o returned empty response!', JSON.stringify(res, null, 2));
  }
  
  // Clean and extract JSON - strip markdown if present
  text = text
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();
  
  // Try to extract JSON if wrapped in other text
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    text = jsonMatch[0];
    console.log('📝 Extracted JSON from response, new length:', text.length);
  }
  
  // Validate it's valid JSON before returning
  try {
    JSON.parse(text);
  } catch (parseError) {
    console.error('❌ GPT-4o returned invalid JSON!');
    console.error('❌ Parse error:', parseError);
    console.error('❌ Full response:', text);
    throw new Error('OpenAI returned invalid JSON response');
  }

  // EPIC 9: Return token usage information (estimate for now)
  const inputTokens = messages.reduce((sum, msg) => sum + Math.ceil(msg.content.length / 4), 0);
  const outputTokens = Math.ceil(text.length / 4);

  return { text, inputTokens, outputTokens, model };
}

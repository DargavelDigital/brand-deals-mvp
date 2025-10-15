import { PROMPT_PACKS } from "./promptPacks";
import OpenAI from "openai";
import { env } from "@/lib/env";

const client = new OpenAI({ apiKey: env.OPENAI_API_KEY! });

export async function aiRankCandidates(input: any, opts?: { packKey?: string }) {
  const packKey = opts?.packKey ?? "match.brandSearch.v1";
  const pack = PROMPT_PACKS[packKey];
  if (!pack) throw new Error(`Prompt pack not found: ${packKey}`);

  const messages = [
    { role: "system", content: pack.system },
    { role: "user", content: pack.instructions },
    { role: "user", content: JSON.stringify(input) }
  ];

  const response = await client.chat.completions.create({
    model: 'gpt-4o', // Switched to GPT-4o - GPT-5 was returning empty responses
    messages,
    temperature: 0.7,
    max_tokens: 4000,
    response_format: { type: 'json_object' } // Re-enabled for GPT-4o
  });

  // Retry on invalid JSON once with slimmer context
  let text = response.choices[0]?.message?.content || "";
  if (!text) {
    const retry = await client.chat.completions.create({
      model: 'gpt-4o', // Switched to GPT-4o
      messages: [
        { role: "system", content: pack.system },
        { role: "user", content: "Return strictly valid JSON." },
        { role: "user", content: JSON.stringify(input) }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' } // Re-enabled for GPT-4o
    });
    text = retry.choices[0]?.message?.content || "";
  }
  return JSON.parse(text);
}

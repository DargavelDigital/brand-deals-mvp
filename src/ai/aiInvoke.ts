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
    model: 'gpt-5', // Updated to GPT-5
    messages,
    // Removed response_format for GPT-5 compatibility
  });

  // Retry on invalid JSON once with slimmer context
  let text = response.choices[0]?.message?.content || "";
  if (!text) {
    const retry = await client.chat.completions.create({
      model: 'gpt-5', // Updated to GPT-5
      messages: [
        { role: "system", content: pack.system },
        { role: "user", content: "Return strictly valid JSON." },
        { role: "user", content: JSON.stringify(input) }
      ],
      // Removed response_format for GPT-5 compatibility
    });
    text = retry.choices[0]?.message?.content || "";
  }
  return JSON.parse(text);
}

import { PROMPT_PACKS } from "./promptPacks";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

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
    model: pack.model,
    messages,
    response_format: {
      type: "json_schema",
      schema: pack.outputSchema,
    }
  });

  // Retry on invalid JSON once with slimmer context
  let text = response.choices[0]?.message?.content || "";
  if (!text) {
    const retry = await client.chat.completions.create({
      model: pack.model,
      messages: [
        { role: "system", content: pack.system },
        { role: "user", content: "Return strictly valid JSON." },
        { role: "user", content: JSON.stringify(input) }
      ],
      response_format: {
        type: "json_schema",
        schema: pack.outputSchema,
      }
    });
    text = retry.choices[0]?.message?.content || "";
  }
  return JSON.parse(text);
}

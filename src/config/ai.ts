// src/config/ai.ts
export const AI_MODEL =
  process.env.OPENAI_MODEL === "latest" ? "gpt-5" /* or `gpt-latest` when OpenAI provides it */ 
  : process.env.OPENAI_MODEL || "gpt-5";

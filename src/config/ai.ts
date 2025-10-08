// src/config/ai.ts
// Use gpt-4o-mini as default (cost-effective, supports JSON mode)
// Can override with OPENAI_MODEL env var
export const AI_MODEL =
  process.env.OPENAI_MODEL === "latest" ? "gpt-4o" 
  : process.env.OPENAI_MODEL || "gpt-4o-mini";

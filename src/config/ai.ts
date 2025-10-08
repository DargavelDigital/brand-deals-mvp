// src/config/ai.ts
// Use gpt-5 as default (latest model with best performance)
// Can override with OPENAI_MODEL env var
export const AI_MODEL =
  process.env.OPENAI_MODEL === "latest" ? "gpt-5" 
  : process.env.OPENAI_MODEL || "gpt-5";

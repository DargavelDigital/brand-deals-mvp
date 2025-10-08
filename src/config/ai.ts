// src/config/ai.ts
// Use gpt-4o as default (latest stable model with best performance)
// Can override with OPENAI_MODEL env var
// Note: GPT-5 is not yet available as of 2025
export const AI_MODEL =
  process.env.OPENAI_MODEL === "latest" ? "gpt-4o" 
  : process.env.OPENAI_MODEL || "gpt-4o";

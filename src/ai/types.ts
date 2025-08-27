export type StyleTone = 'professional' | 'relaxed' | 'fun';
export type StyleBrevity = 'short' | 'medium' | 'detailed';

export interface PromptPack<TIn = unknown, TOut = unknown> {
  key: string;              // e.g., 'audit.insights'
  version: string;          // e.g., 'v1'
  systemPrompt: string;
  fewshots?: Array<{ input: TIn; output: TOut }>;
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  styleKnobs?: { tone?: boolean; brevity?: boolean };
  modelHints?: { temperature?: number; max_output_tokens?: number };
}

export interface AIPromptOptions {
  tone?: StyleTone;
  brevity?: StyleBrevity;
  version?: string; // allow v rollback
  model?: string;   // override model
}

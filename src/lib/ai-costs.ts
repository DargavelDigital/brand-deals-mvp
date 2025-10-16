export const AI_PRICING = {
  'gpt-4o': {
    input: 2.50 / 1_000_000,  // $2.50 per 1M tokens
    output: 10.00 / 1_000_000, // $10.00 per 1M tokens
  },
  'gpt-4o-mini': {
    input: 0.15 / 1_000_000,
    output: 0.60 / 1_000_000,
  },
  'o1-preview': {
    input: 15.00 / 1_000_000,
    output: 60.00 / 1_000_000,
  },
  'o1-mini': {
    input: 3.00 / 1_000_000,
    output: 12.00 / 1_000_000,
  },
  'llama-3.1-sonar-large-128k-online': {
    input: 1.00 / 1_000_000,
    output: 1.00 / 1_000_000,
  },
  'llama-3.1-sonar-small-128k-online': {
    input: 0.20 / 1_000_000,
    output: 0.20 / 1_000_000,
  },
  'claude-3-5-sonnet-20241022': {
    input: 3.00 / 1_000_000,
    output: 15.00 / 1_000_000,
  }
} as const;

export function calculateAICost(
  model: string,
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  }
): {
  inputCost: number;
  outputCost: number;
  totalCost: number;
} {
  const pricing = AI_PRICING[model as keyof typeof AI_PRICING];
  
  if (!pricing) {
    console.warn(`⚠️ Unknown model pricing: ${model}, using $0`);
    return { inputCost: 0, outputCost: 0, totalCost: 0 };
  }

  const inputCost = usage.prompt_tokens * pricing.input;
  const outputCost = usage.completion_tokens * pricing.output;
  const totalCost = inputCost + outputCost;

  return {
    inputCost: parseFloat(inputCost.toFixed(6)),
    outputCost: parseFloat(outputCost.toFixed(6)),
    totalCost: parseFloat(totalCost.toFixed(6)),
  };
}

export function formatCost(cost: number): string {
  if (cost === 0) return '$0.00';
  if (cost < 0.01) {
    return `$${(cost * 100).toFixed(4)}¢`;
  }
  return `$${cost.toFixed(4)}`;
}


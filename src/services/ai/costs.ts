export const modelCosts = {
  // Latest models (2025)
  'gpt-4o': { cpmInput: 0.005, cpmOutput: 0.015 },
  'gpt-4o-mini': { cpmInput: 0.003, cpmOutput: 0.009 },
  // Legacy models (for reference)
  'gpt-4-turbo': { cpmInput: 0.01, cpmOutput: 0.03 },
  'gpt-4': { cpmInput: 0.03, cpmOutput: 0.06 },
  'gpt-3.5-turbo': { cpmInput: 0.0015, cpmOutput: 0.002 },
  'claude-3-haiku': { cpmInput: 0.00025, cpmOutput: 0.00125 },
  'claude-3-sonnet': { cpmInput: 0.003, cpmOutput: 0.015 },
  'claude-3-opus': { cpmInput: 0.015, cpmOutput: 0.075 },
  'dry-run': { cpmInput: 0, cpmOutput: 0 }
}

export function resolveModelCosts(model: string) {
  return modelCosts[model as keyof typeof modelCosts] ?? null
}

export function getModelCosts(model: string) {
  const costs = resolveModelCosts(model)
  if (costs) return costs
  
  // Fallback to default costs
  return {
    cpmInput: 0.005,
    cpmOutput: 0.015
  }
}

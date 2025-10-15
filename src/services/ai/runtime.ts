import { flags } from '@/lib/flags'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'
import { getModelCosts } from './costs'

type AiCallMetrics = {
  provider: 'openai'
  model: string
  inputTokens: number
  outputTokens: number
  cpmInput?: number
  cpmOutput?: number
  dryRun: boolean
}

export function calcCostUSD({inputTokens, outputTokens, cpmInput, cpmOutput}: {inputTokens:number; outputTokens:number; cpmInput?:number; cpmOutput?:number}) {
  const inCost = (inputTokens/1000) * (cpmInput ?? flags.costs.defaultCpmInput)
  const outCost = (outputTokens/1000) * (cpmOutput ?? flags.costs.defaultCpmOutput)
  return { inputCostUsd: inCost, outputCostUsd: outCost, totalCostUsd: inCost + outCost }
}

export async function logAiUsage(opts: {
  workspaceId: string
  traceId: string
  packKey: string
  metrics: AiCallMetrics
}) {
  // Validate workspaceId is a string (defensive check)
  if (typeof opts.workspaceId !== 'string' || opts.workspaceId.length === 0) {
    console.error('❌ logAiUsage: Invalid workspaceId type!', {
      type: typeof opts.workspaceId,
      value: opts.workspaceId,
      packKey: opts.packKey
    });
    throw new Error(`Invalid workspaceId: expected string, got ${typeof opts.workspaceId}`);
  }
  
  // EPIC 9: Use model-specific costs when available
  const modelCosts = getModelCosts(opts.metrics.model)
  const { inputCostUsd, outputCostUsd, totalCostUsd } = calcCostUSD({
    inputTokens: opts.metrics.inputTokens,
    outputTokens: opts.metrics.outputTokens,
    cpmInput: opts.metrics.cpmInput ?? modelCosts.cpmInput,
    cpmOutput: opts.metrics.cpmOutput ?? modelCosts.cpmOutput
  })

  await prisma().aiUsageEvent.create({
    data: {
      id: randomUUID(), // Required primary key
      workspaceId: opts.workspaceId,
      traceId: opts.traceId,
      packKey: opts.packKey,
      provider: opts.metrics.provider,
      model: opts.metrics.model,
      inputTokens: opts.metrics.inputTokens,
      outputTokens: opts.metrics.outputTokens,
      inputCostUsd,
      outputCostUsd,
      totalCostUsd,
      dryRun: opts.metrics.dryRun
    }
  })
}

export function withTimeout<T>(p: Promise<T>, ms: number, label='ai-call'): Promise<T> {
  const t = setTimeout(() => {}, 0) // keep Node happy
  return new Promise((resolve, reject) => {
    const to = setTimeout(() => reject(new Error(`Timeout ${label} after ${ms}ms`)), ms)
    p.then((v)=>{ clearTimeout(to); resolve(v) }).catch((e)=>{ clearTimeout(to); reject(e) })
  })
}

export async function retry<T>(fn: () => Promise<T>, maxRetries: number, baseMs: number) {
  let attempt = 0
  // jittered exponential backoff
  while (true) {
    try { return await fn() } catch (err) {
      attempt++
      if (attempt > maxRetries) throw err
      const delay = Math.round((baseMs * 2 ** (attempt-1)) * (0.75 + Math.random()*0.5))
      await new Promise(r => setTimeout(r, delay))
    }
  }
}

export function newTraceId() {
  return randomUUID()
}

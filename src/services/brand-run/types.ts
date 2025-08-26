export type RunStep = 'CONNECT'|'AUDIT'|'MATCHES'|'APPROVE'|'PACK'|'CONTACTS'|'OUTREACH'|'COMPLETE'
export const ORDER: RunStep[] = ['CONNECT','AUDIT','MATCHES','APPROVE','PACK','CONTACTS','OUTREACH','COMPLETE']
export function nextStep(s: RunStep): RunStep {
  const i = ORDER.indexOf(s); return ORDER[Math.min(ORDER.length-1, i+1)]
}
export function prevStep(s: RunStep): RunStep {
  const i = ORDER.indexOf(s); return ORDER[Math.max(0, i-1)]
}
export function stepIndex(s: RunStep){ return Math.max(0, ORDER.indexOf(s)) }
export function percent(s: RunStep){ const i = stepIndex(s); return Math.round((i/(ORDER.length-1))*100) }

export type BrandRun = {
  id: string
  workspaceId: string
  step: RunStep
  stats?: { brands?: number; creditsUsed?: number }
  createdAt: string
  updatedAt: string
}

import { BrandRun } from './types'

async function j(r: Response){ try{ return await r.json() }catch{ return null } }

export async function getCurrentRun(): Promise<BrandRun|null>{
  const r = await fetch('/api/brand-run/current', { cache:'no-store' })
  const data = await j(r)
  return data?.data ?? data ?? null
}

export async function upsertRun(payload: any = {}): Promise<BrandRun|null>{
  const r = await fetch('/api/brand-run/upsert', {
    method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload)
  })
  const data = await j(r)
  return data?.data ?? data ?? null
}

export async function startOrContinue(): Promise<string>{
  const r = await fetch('/api/brand-run/start', { method:'POST' })
  const data = await j(r)
  return data?.redirect ?? '/brand-run'
}

export async function advance(step?: string): Promise<BrandRun|null>{
  const r = await fetch('/api/brand-run/advance', {
    method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ step })
  })
  const data = await j(r)
  return data?.data ?? data ?? null
}

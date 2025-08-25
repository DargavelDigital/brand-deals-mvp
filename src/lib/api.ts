export async function runAudit() {
  const r = await fetch('/api/audit/run', { method: 'POST' })
  if (!r.ok) throw new Error('Audit failed')
  return r.json()
}

export async function getLatestAudit() { 
  return (await fetch('/api/audit/latest')).json() 
}

export async function generateMatches() {
  const r = await fetch('/api/match/top', { method: 'POST' })
  if (!r.ok) throw new Error('Match gen failed')
  return r.json()
}

export async function generateMediaPack(payload?: any) {
  const r = await fetch('/api/media-pack/generate', { 
    method: 'POST', 
    body: payload ? JSON.stringify(payload) : undefined, 
    headers: payload ? {'Content-Type': 'application/json'} : undefined 
  })
  if (!r.ok) throw new Error('Pack gen failed')
  return r.json()
}

export async function startOutreach(payload?: any) {
  const r = await fetch('/api/sequence/start', { 
    method: 'POST', 
    body: payload ? JSON.stringify(payload) : undefined, 
    headers: payload ? {'Content-Type': 'application/json'} : undefined 
  })
  if (!r.ok) throw new Error('Outreach start failed')
  return r.json()
}

export async function getBrandRun() { 
  return (await fetch('/api/brand-run/current')).json() 
}

export async function upsertBrandRun(body: any) { 
  const r = await fetch('/api/brand-run/upsert', { 
    method: 'POST', 
    headers: {'Content-Type': 'application/json'}, 
    body: JSON.stringify(body) 
  })
  if (!r.ok) throw new Error('BrandRun upsert failed')
  return r.json()
}

export async function advanceBrandRun() { 
  const r = await fetch('/api/brand-run/advance', { method: 'POST' })
  if (!r.ok) throw new Error('Advance failed')
  return r.json()
}

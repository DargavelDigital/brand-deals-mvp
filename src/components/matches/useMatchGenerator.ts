'use client'
import * as React from 'react'
import type { UIMatchBrand } from './BrandCard'

export default function useMatchGenerator(){
  const [generating, setGenerating] = React.useState(false)
  const [matches, setMatches] = React.useState<UIMatchBrand[]>([])
  const [selected, setSelected] = React.useState<string[]>([])
  const [error, setError] = React.useState<string|null>(null)

  const generate = React.useCallback(async (criteria?: any)=>{
    setError(null); setGenerating(true)
    try{
      const wsid = document.cookie.split('; ').find(r=>r.startsWith('wsid='))?.split('=')[1] || 'demo-workspace'
      const res = await fetch('/api/match/top', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ workspaceId: wsid, criteria })
      })
      if(!res.ok) throw new Error(`Failed: ${res.status}`)
      const j = await res.json()
      setMatches((j?.matches?.brands ?? []).map((b:any)=>({
        id: b.id, name: b.name, logo: b.logo, description: b.description,
        relevance: b.relevance, tags: b.tags, matchScore: b.matchScore ?? Math.round(60+Math.random()*35),
        industry: b.industry, website: b.website, reasons: b.reasons,
      })))
    }catch(e:any){ setError(e.message ?? 'Could not generate matches') }
    finally{ setGenerating(false) }
  },[])

  const toggle = (id:string)=>{
    setSelected(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id])
  }

  const clear = ()=> setSelected([])

  return { generating, matches, selected, error, generate, toggle, clear }
}

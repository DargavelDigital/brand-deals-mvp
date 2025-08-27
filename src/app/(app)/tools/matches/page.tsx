'use client'
import * as React from 'react'
import BrandCard, { type UIMatchBrand } from '@/components/matches/BrandCard'
import BrandDetailsDrawer from '@/components/matches/BrandDetailsDrawer'
import useMatchGenerator from '@/components/matches/useMatchGenerator'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Sparkles, Filter } from 'lucide-react'

export default function MatchesPage(){
  const { generating, matches, selected, error, generate, toggle, clear } = useMatchGenerator()
  const [q, setQ] = React.useState('')
  const [industry, setIndustry] = React.useState('all')
  const [drawer, setDrawer] = React.useState<{open:boolean; brand?:UIMatchBrand}>({open:false})

  const industries = React.useMemo(()=>{
    const set = new Set(matches.flatMap(m=>m.tags ?? []).concat(matches.map(m=>m.industry ?? '').filter(Boolean)))
    return ['all', ...Array.from(set).filter(Boolean)]
  },[matches])

  const filtered = matches.filter(b=>{
    const okInd = industry==='all' || b.tags?.includes(industry) || b.industry===industry
    const okQ = !q || (b.name?.toLowerCase().includes(q.toLowerCase()) || b.description?.toLowerCase().includes(q.toLowerCase()))
    return okInd && okQ
  })

  React.useEffect(()=>{ generate() },[generate]) // auto-generate on first visit; remove if you want manual

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Brand Matches</h1>
          <p className="text-[var(--muted-fg)]">Discover brands that align with your audience & content.</p>
        </div>
        <Button onClick={()=>generate()} disabled={generating} className="inline-flex items-center gap-2">
          <Sparkles className="w-4 h-4"/>{generating?'Generating…':'Generate Matches'}
        </Button>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4"><div className="text-2xl font-semibold">{matches.length}</div><div className="text-sm text-[var(--muted-fg)]">Total Matches</div></Card>
        <Card className="p-4"><div className="text-2xl font-semibold">{selected.length}</div><div className="text-sm text-[var(--muted-fg)]">Selected</div></Card>
        <Card className="p-4"><div className="text-2xl font-semibold">{industries.length-1}</div><div className="text-sm text-[var(--muted-fg)]">Industries</div></Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-grow-1">
            <input value={q} onChange={e=>setQ(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-[var(--border)] bg-[var(--card)]"
              placeholder="Search brands…"/>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[var(--muted-fg)]"/>
            <select value={industry} onChange={e=>setIndustry(e.target.value)}
              className="h-10 px-3 rounded-md border border-[var(--border)] bg-[var(--card)]">
              {industries.map(i=><option key={i} value={i}>{i==='all'?'All industries':i}</option>)}
            </select>
          </div>
        </div>
      </Card>

      {/* Error or loading */}
      {error && <Card className="p-4 text-[var(--error)] bg-[var(--tint-error)] border-[var(--error)]">{error}</Card>}
      {generating && (
        <Card className="p-8 text-center text-[var(--muted-fg)]">
          <div className="w-8 h-8 mx-auto mb-3 border-4 border-[var(--brand-600)] border-t-transparent rounded-full animate-spin"/>
          Generating brand matches…
        </Card>
      )}

      {/* Results */}
      {!generating && !!matches.length && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map(b=>(
              <BrandCard
                key={b.id}
                brand={b}
                selected={selected.includes(b.id)}
                onSelect={toggle}
                onDetails={(id)=> setDrawer({open:true, brand: matches.find(x=>x.id===id)})}
              />
            ))}
          </div>

          {selected.length>0 && (
            <Card className="p-4 bg-[var(--tint-accent)] border-[var(--brand-600)] sticky bottom-4">
              <div className="flex items-center justify-between">
                <div className="text-sm"><span className="font-medium">{selected.length}</span> brands selected</div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={clear}>Clear</Button>
                  <a href="/tools/approve" className="inline-flex h-9 items-center px-3 rounded-[10px] bg-[var(--brand-600)] text-white text-sm">Continue to Approval</a>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {!generating && !matches.length && (
        <Card className="p-8 text-center text-[var(--muted-fg)]">
          Click "Generate Matches" to discover aligned brands
        </Card>
      )}

      <BrandDetailsDrawer open={drawer.open} onClose={()=>setDrawer({open:false})} brand={drawer.brand}/>
    </div>
  )
}

'use client'
import * as React from 'react'
import BrandCard, { type UIMatchBrand } from '@/components/matches/BrandCard'
import BrandDetailsDrawer from '@/components/matches/BrandDetailsDrawer'
import useMatchGenerator from '@/components/matches/useMatchGenerator'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Sparkles, Filter, MapPin, PlusCircle } from 'lucide-react'
import type { RankedBrand } from '@/types/match'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProgressBeacon } from '@/components/ui/ProgressBeacon'

export default function MatchesPage(){
  const { generating, matches, selected, error, generate, toggle, clear } = useMatchGenerator()
  const [q, setQ] = React.useState('')
  const [industry, setIndustry] = React.useState('all')
  const [drawer, setDrawer] = React.useState<{open:boolean; brand?:UIMatchBrand}>({open:false})
  
  // Epic 3: New state for local discovery
  const [useLocal, setUseLocal] = React.useState(true)
  const [geo, setGeo] = React.useState<{lat:number,lng:number}|null>(null)
  const [localLoading, setLocalLoading] = React.useState(false)
  const [localMatches, setLocalMatches] = React.useState<RankedBrand[]>([])
  const [localError, setLocalError] = React.useState<string|null>(null)

  const industries = React.useMemo(()=>{
    const set = new Set(matches.flatMap(m=>m.tags ?? []).concat(matches.map(m=>m.industry ?? '').filter(Boolean)))
    return ['all', ...Array.from(set).filter(Boolean)]
  },[matches])

  const filtered = matches.filter(b=>{
    const okInd = industry==='all' || b.tags?.includes(industry) || b.industry===industry
    const okQ = !q || (b.name?.toLowerCase().includes(q.toLowerCase()) || b.description?.toLowerCase().includes(q.toLowerCase()))
    return okInd && okQ
  })

  // Epic 3: Geolocation setup
  React.useEffect(() => {
    if (!useLocal || geo) return
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setGeo(null),
      { enableHighAccuracy: true, timeout: 5000 }
    )
  }, [useLocal, geo])

  React.useEffect(()=>{ generate() },[generate]) // auto-generate on first visit; remove if you want manual

  // Epic 3: Local brand discovery function
  async function fetchLocalMatches(opts: { append?: boolean } = {}) {
    setLocalLoading(true); setLocalError(null)
    try {
      const body: any = {
        includeLocal: useLocal && !!geo,
        geo: geo || undefined,
        radiusKm: 20,
        categories: ['cafe','gym','salon','retail','beauty','fitness'],
        limit: 24,
      }
      const res = await fetch('/api/match/search', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Search failed')
      const data = await res.json()
      setLocalMatches(prev => opts.append ? [...prev, ...data.matches] : data.matches)
    } catch (e:any) {
      setLocalError(e.message)
    } finally {
      setLocalLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Brand Matches</h1>
          <p className="text-[var(--muted-fg)]">Discover brands that align with your audience & content.</p>
        </div>
        <div className="flex gap-2">
          {/* Epic 3: Local toggle */}
          <button
            className={[
              "h-9 px-3 rounded-md border",
              useLocal ? "bg-[var(--brand-600)] text-white border-[var(--brand-600)]" : "bg-[var(--card)] text-[var(--fg)] border-[var(--border)]"
            ].join(' ')}
            onClick={() => setUseLocal(v => !v)}
            title="Include local businesses"
          >
            <MapPin className="inline w-4 h-4 mr-1" />
            Local
          </button>
          <Button onClick={()=>generate()} disabled={generating} className="inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4"/>
            {generating ? (
              <div className="flex items-center gap-2">
                <ProgressBeacon />
                Generating...
              </div>
            ) : (
              'Generate Matches'
            )}
          </Button>
        </div>
      </div>

      {/* Epic 3: Local discovery section */}
      {useLocal && (
        <Card className="p-4 border-[var(--brand-600)] bg-[var(--tint-accent)]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-medium">Local Brand Discovery</h3>
              <p className="text-sm text-[var(--muted-fg)]">
                {geo ? `Location: ${geo.lat.toFixed(4)}, ${geo.lng.toFixed(4)}` : 'Getting your location...'}
              </p>
            </div>
            <Button 
              onClick={() => fetchLocalMatches()} 
              disabled={localLoading || !geo}
              size="sm"
            >
              {localLoading ? (
                <div className="flex items-center gap-2">
                  <ProgressBeacon />
                  Searching...
                </div>
              ) : (
                'Find Local Brands'
              )}
            </Button>
          </div>
          
          {localError && (
            <div className="text-sm text-[var(--error)] bg-[var(--tint-error)] p-2 rounded">
              {localError}
            </div>
          )}

          {localMatches.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm font-medium">Local Matches ({localMatches.length})</div>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {localMatches.map(m => (
                  <Card key={m.id} className="p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{m.name}</div>
                        <div className="text-xs text-[var(--muted-fg)]">
                          {m.categories?.slice(0,3).join(' • ')}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-[var(--brand-600)]">{m.score}%</div>
                    </div>
                    <div className="text-xs mt-2 text-[var(--muted-fg)]">{m.rationale}</div>
                    {m.geo?.distanceKm && (
                      <div className="mt-2 inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5 border border-[var(--border)]">
                        <MapPin className="w-3 h-3" /> ~{m.geo.distanceKm} km
                      </div>
                    )}
                    <div className="mt-2 text-xs">
                      <span className="font-medium">Pitch:</span> {m.pitchIdea}
                    </div>
                  </Card>
                ))}
              </div>
              
              <div className="flex justify-center">
                <Button variant="secondary" size="sm" onClick={() => fetchLocalMatches({ append: true })}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Find more brands nearby
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

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
        <Card className="p-8 text-center">
          <ProgressBeacon label="Generating brand matches..." />
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
        <EmptyState 
          icon={Sparkles}
          title="No brand matches yet" 
          description="Click 'Generate Matches' to discover aligned brands for your campaign."
          action={
            <Button onClick={() => generate()} disabled={generating}>
              <Sparkles className="w-4 h-4 mr-2"/>
              Generate Matches
            </Button>
          }
        />
      )}

      <BrandDetailsDrawer open={drawer.open} onClose={()=>setDrawer({open:false})} brand={drawer.brand}/>
    </div>
  )
}

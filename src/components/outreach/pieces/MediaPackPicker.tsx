'use client'
import * as React from 'react'
type MP = { id:string; variant:string; createdAt?:string }

export default function MediaPackPicker({ value, onChange }:{ value:string; onChange:(id:string)=>void }){
  const [items,setItems]=React.useState<MP[]>([])
  const [loading,setLoading]=React.useState(true)
  
  React.useEffect(()=>{(async()=>{
    try{
      setLoading(true)
      const r=await fetch('/api/media-pack/list')
      const d=await r.json().catch(()=>({items:[]}))
      setItems(d.items??[])
    }catch{ 
      setItems([]) 
    } finally {
      setLoading(false)
    }
  })()},[])
  
  return (
    <div className="card p-5">
      <div className="text-lg font-semibold mb-3">Attach Media Pack (optional)</div>
      <select 
        value={value} 
        onChange={e=>onChange(e.target.value)}
        disabled={loading}
        className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3"
      >
        <option value="">None</option>
        {loading && <option disabled>Loading media packs...</option>}
        {!loading && items.length === 0 && (
          <option disabled>No media packs yet - create one in Media Pack tool</option>
        )}
        {items.map(mp=> (
          <option key={mp.id} value={mp.id}>
            {mp.variant || 'default'} • {mp.createdAt ? new Date(mp.createdAt).toLocaleDateString() : mp.id.slice(0,6)}
          </option>
        ))}
      </select>
      {!loading && items.length === 0 && (
        <p className="mt-2 text-sm text-[var(--muted-fg)]">
          💡 Create your first media pack in the Media Pack tool →
        </p>
      )}
    </div>
  )
}

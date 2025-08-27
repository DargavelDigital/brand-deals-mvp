'use client'
import * as React from 'react'
type MP = { id:string; variant:string; createdAt?:string }

export default function MediaPackPicker({ value, onChange }:{ value:string; onChange:(id:string)=>void }){
  const [items,setItems]=React.useState<MP[]>([])
  React.useEffect(()=>{(async()=>{
    try{
      const r=await fetch('/api/media-pack/list'); const d=await r.json().catch(()=>({items:[]}))
      setItems(d.items??[])
    }catch{ setItems([]) }
  })()},[])
  return (
    <div className="card p-5">
      <div className="text-lg font-semibold mb-3">Attach Media Pack (optional)</div>
      <select value={value} onChange={e=>onChange(e.target.value)}
              className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3">
        <option value="">None</option>
        {items.map(mp=> <option key={mp.id} value={mp.id}>{mp.variant || 'default'} • {mp.id.slice(0,6)}</option>)}
      </select>
    </div>
  )
}

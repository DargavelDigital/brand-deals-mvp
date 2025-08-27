'use client'
import * as React from 'react'
type Brand = { id:string; name:string; logo?:string }

export default function BrandPicker({ value, onChange }:{ value:string; onChange:(id:string)=>void }){
  const [items,setItems]=React.useState<Brand[]>([])
  React.useEffect(()=>{(async()=>{
    try{
      const r=await fetch('/api/brands?limit=100'); const d=await r.json().catch(()=>({items:[]}))
      setItems(d.items??[])
    }catch{ setItems([]) }
  })()},[])
  return (
    <div className="card p-5">
      <div className="text-lg font-semibold mb-3">Choose Brand (optional)</div>
      <select value={value} onChange={e=>onChange(e.target.value)}
              className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3">
        <option value="">No specific brand</option>
        {items.map(b=> <option key={b.id} value={b.id}>{b.name}</option>)}
      </select>
    </div>
  )
}

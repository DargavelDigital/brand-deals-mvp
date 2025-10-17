'use client'
import * as React from 'react'
type Brand = { id:string; name:string; website?:string; industry?:string }

export default function BrandPicker({ value, onChange }:{ value:string; onChange:(id:string)=>void }){
  const [items,setItems]=React.useState<Brand[]>([])
  const [loading,setLoading]=React.useState(true)
  
  React.useEffect(()=>{(async()=>{
    try{
      setLoading(true)
      // Fetch MATCHED brands from user's BrandRun, not all brands
      const r=await fetch('/api/brands/matched')
      const d=await r.json().catch(()=>({brands:[]}))
      setItems(d.brands??[])
    }catch{ 
      setItems([]) 
    } finally {
      setLoading(false)
    }
  })()},[])
  
  return (
    <div className="card p-5">
      <div className="text-lg font-semibold mb-3">Choose Brand (optional)</div>
      <select 
        value={value} 
        onChange={e=>onChange(e.target.value)}
        disabled={loading}
        className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3"
      >
        <option value="">No specific brand</option>
        {loading && <option disabled>Loading matched brands...</option>}
        {!loading && items.length === 0 && (
          <option disabled>No brands matched yet - run brand discovery first</option>
        )}
        {items.map(b=> (
          <option key={b.id} value={b.id}>
            {b.name}{b.website ? ` • ${b.website}` : ''}
          </option>
        ))}
      </select>
      {!loading && items.length === 0 && (
        <p className="mt-2 text-sm text-[var(--muted-fg)]">
          💡 Run the Brand Matching workflow to find brands for your audience
        </p>
      )}
    </div>
  )
}

'use client'
import * as React from 'react'
import { safeJson } from '@/lib/http/safeJson'

type Contact = { id:string; name:string; email:string; company?:string; verifiedStatus?:'VALID'|'RISKY'|'INVALID' }

export default function ContactPicker({
  selected, onChange
}:{ selected:string[]; onChange:(ids:string[])=>void }){
  const [loading, setLoading] = React.useState(false)
  const [q, setQ] = React.useState('')
  const [items, setItems] = React.useState<Contact[]>([])

  React.useEffect(()=>{ (async()=>{
    setLoading(true)
    try{
      const { ok, status, body } = await safeJson('/api/contacts?status=ACTIVE')
      if (ok && body?.items) {
        setItems(body.items)
      } else {
        console.warn('contacts fetch non-OK', status, body)
        setItems([])
      }
    }catch{ setItems([]) } finally { setLoading(false) }
  })() },[])

  const filtered = React.useMemo(()=>{
    const s = q.toLowerCase()
    return items.filter(c => !s || c.name.toLowerCase().includes(s) || c.email.toLowerCase().includes(s) || (c.company??'').toLowerCase().includes(s))
  },[items,q])

  const toggle = (id:string) => onChange(selected.includes(id) ? selected.filter(x=>x!==id) : [...selected, id])

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-lg font-semibold">Select Contacts</div>
        <div className="text-sm text-[var(--muted-fg)]">{selected.length} selected</div>
      </div>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search contacts…"
             className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 mb-3"/>
      {loading ? (
        <div className="text-[var(--muted-fg)] py-6 text-center">Loading…</div>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {filtered.map(c=>(
            <button key={c.id} type="button" onClick={()=>toggle(c.id)}
              className={`w-full text-left rounded-lg border p-3 bg-[var(--card)] ${selected.includes(c.id)?'border-[var(--brand-600)] bg-[var(--tint-accent)]':'border-[var(--border)]'}`}>
              <div className="font-medium">{c.name}</div>
              <div className="text-sm text-[var(--muted-fg)]">{c.email}{c.company?` • ${c.company}`:''}</div>
            </button>
          ))}
          {!filtered.length && <div className="text-sm text-[var(--muted-fg)] py-6 text-center">No contacts</div>}
        </div>
      )}
      {selected.length>0 && (
        <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-between">
          <div className="text-sm">{selected.length} selected</div>
          <button onClick={()=>onChange([])} className="h-9 px-3 rounded-md border border-[var(--border)] bg-[var(--card)]">Clear</button>
        </div>
      )}
    </div>
  )
}

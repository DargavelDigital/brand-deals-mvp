'use client'

import * as React from 'react'
import { Check } from 'lucide-react'

export type ContactHit = {
  id: string
  name: string
  title: string
  email: string
  seniority: string
  verifiedStatus: 'VALID'|'RISKY'|'INVALID'
  score: number
  source: string
  company: string
  domain: string
  // Brand association
  brandId?: string
  brandName?: string
  // Enriched fields
  linkedinUrl?: string
  enrichedSource?: string
  confidence?: number
}

function Badge({ children, tone='neutral' }:{children:React.ReactNode, tone?:'neutral'|'success'|'warn'|'error'}) {
  const map: Record<string,string> = {
    neutral:'bg-[var(--surface)] text-[var(--muted-fg)]',
    success:'bg-[var(--tint-success)] text-[var(--success)]',
    warn:'bg-[var(--tint-warn)] text-[var(--warn)]',
    error:'bg-[var(--tint-error)] text-[var(--error)]'
  }
  return <span className={`px-2 py-0.5 rounded-full text-[12px] ${map[tone]}`}>{children}</span>
}

function Card({
  c, selected, toggle
}:{ c:ContactHit, selected:boolean, toggle:()=>void }) {
  const tone = c.verifiedStatus==='VALID' ? 'success' : c.verifiedStatus==='RISKY' ? 'warn' : 'error'
  return (
    <button type="button" onClick={toggle}
      className={`text-left rounded-[12px] border p-4 bg-[var(--card)] transition-all ${selected?'border-[var(--brand-600)] bg-[var(--tint-accent)]':'border-[var(--border)]'}`}>
      <div className="flex items-start gap-3">
        <div className={`w-5 h-5 rounded grid place-items-center border ${selected?'border-[var(--brand-600)] bg-[var(--brand-600)] text-white':'border-[var(--border)]'}`}>
          {selected && <Check className="w-4 h-4"/>}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="font-medium truncate">{c.name}</div>
            <Badge tone={tone}>{c.verifiedStatus}</Badge>
            <Badge>Score {c.score}</Badge>
          </div>
          <div className="text-sm text-[var(--muted-fg)] truncate">{c.title} • {c.company}</div>
          {c.brandName && (
            <div className="text-sm text-[var(--muted-fg)] truncate">
              🎯 Brand: <span className="font-medium">{c.brandName}</span>
            </div>
          )}
          <div className="text-sm text-[var(--muted-fg)] truncate">{c.email}</div>
          {c.linkedinUrl && (
            <div className="text-sm text-[var(--muted-fg)] truncate">
              <a href={c.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--brand-600)]">
                LinkedIn Profile
              </a>
            </div>
          )}
          <div className="mt-2 text-xs text-[var(--muted-fg)]">
            Source: {c.enrichedSource || c.source}
            {c.confidence && (
              <span className="ml-2">
                ({Math.round(c.confidence)}%)
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

export default function ResultsGrid({
  contacts, onSaveSelected, onSaveAndContinue
}:{ 
  contacts:ContactHit[], 
  onSaveSelected:(ids:string[])=>Promise<void>,
  onSaveAndContinue?:(selectedContacts:ContactHit[])=>Promise<void>
}) {
  const [selected, setSelected] = React.useState<string[]>([])
  const allIds = React.useMemo(()=>contacts.map(c=>c.id),[contacts])

  const toggle = (id:string) => setSelected(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev,id])
  const selectAll = () => setSelected(allIds)
  const selectNone = () => setSelected([])

  const [saving, setSaving] = React.useState(false)
  const [savingAndContinuing, setSavingAndContinuing] = React.useState(false)
  
  const save = async () => {
    if(!selected.length) return
    setSaving(true)
    try {
      const selectedContacts = contacts.filter(c => selected.includes(c.id));
      
      // Group by brand for logging
      const byBrand = selectedContacts.reduce((acc, contact) => {
        const brandId = contact.brandId || 'unknown';
        if (!acc[brandId]) acc[brandId] = [];
        acc[brandId].push(contact);
        return acc;
      }, {} as Record<string, typeof selectedContacts>);
      
      console.log('📋 Selected contacts grouped by brand:', Object.entries(byBrand).map(([brandId, contacts]) => ({
        brandId,
        brandName: contacts[0]?.brandName || 'Unknown',
        count: contacts.length,
        contacts: contacts.map(c => c.name)
      })));
      
      await onSaveSelected(selected); 
      setSelected([]);
    } finally { 
      setSaving(false);
    }
  }
  
  const handleSaveAndContinue = async () => {
    if(!selected.length || !onSaveAndContinue) return
    setSavingAndContinuing(true)
    try {
      const selectedContacts = contacts.filter(c => selected.includes(c.id));
      await onSaveAndContinue(selectedContacts);
      setSelected([]);
    } finally {
      setSavingAndContinuing(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="card p-4 flex items-center justify-between">
        <div className="text-sm">
          <span className="font-medium">{selected.length}</span> selected of {contacts.length}
        </div>
        <div className="flex gap-2">
          <button onClick={selectAll} className="h-9 px-3 rounded-md border border-[var(--border)] bg-[var(--card)]">Select All</button>
          <button onClick={selectNone} className="h-9 px-3 rounded-md border border-[var(--border)] bg-[var(--card)]">Clear</button>
          <button disabled={!selected.length || saving} onClick={save}
                  className="h-9 px-3 rounded-md bg-[var(--brand-600)] text-white disabled:opacity-60">
            {saving ? 'Saving…' : `Save ${selected.length} contact${selected.length===1?'':'s'}`}
          </button>
          {onSaveAndContinue && (
            <button 
              disabled={!selected.length || savingAndContinuing} 
              onClick={handleSaveAndContinue}
              className="h-9 px-4 rounded-md bg-[var(--brand-600)] text-white disabled:opacity-60 font-medium"
            >
              {savingAndContinuing ? 'Saving...' : `Save & Continue to Media Pack →`}
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {contacts.map(c => (
          <Card key={c.id} c={c} selected={selected.includes(c.id)} toggle={()=>toggle(c.id)} />
        ))}
      </div>
    </div>
  )
}

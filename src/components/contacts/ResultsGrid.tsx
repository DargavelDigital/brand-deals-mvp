'use client'

import * as React from 'react'
import { Check, Mail, Briefcase, ExternalLink } from 'lucide-react'

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
  matchReason?: string // NEW: Why this contact is a good match
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
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggle();
  }
  
  // Generate a smart match reason if not provided
  const getMatchReason = () => {
    if (c.matchReason) return c.matchReason;
    
    // Generate based on role and seniority
    if (c.seniority === 'C-Level' || c.title.toLowerCase().includes('cmo') || c.title.toLowerCase().includes('ceo')) {
      return 'Decision-maker with budget authority';
    }
    if (c.title.toLowerCase().includes('partnership') || c.title.toLowerCase().includes('influencer')) {
      return 'Direct role in creator partnerships';
    }
    if (c.title.toLowerCase().includes('marketing')) {
      return 'Marketing leadership role';
    }
    return `${c.seniority} in relevant department`;
  }
  
  return (
    <div
      onClick={handleClick}
      className={`relative cursor-pointer rounded-lg border bg-white hover:shadow-lg transition-all ${
        selected ? 'border-[var(--brand-600)] ring-2 ring-[var(--brand-600)] ring-opacity-20' : 'border-gray-200'
      }`}
    >
      {/* Selection Indicator */}
      <div className="absolute top-4 left-4 z-10">
        <div className={`w-5 h-5 rounded grid place-items-center border ${
          selected ? 'border-[var(--brand-600)] bg-[var(--brand-600)] text-white' : 'border-gray-300 bg-white'
        }`}>
          {selected && <Check className="w-4 h-4"/>}
        </div>
      </div>

      <div className="p-4 pl-12">
        {/* HEADER with NAME and SCORE */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-4">
            <h3 className="font-semibold text-lg truncate text-gray-900">{c.name}</h3>
            <p className="text-sm text-gray-600 truncate">{c.title}</p>
            {c.brandName && (
              <p className="text-sm text-blue-600 font-medium truncate">{c.brandName}</p>
            )}
            {!c.brandName && (
              <p className="text-sm text-gray-600 truncate">{c.company}</p>
            )}
          </div>
          
          {/* ✅ SCORE PROMINENTLY DISPLAYED */}
          <div className="flex flex-col items-end flex-shrink-0">
            <div className="text-2xl font-bold text-green-600">{c.score}</div>
            <div className="text-xs text-gray-500">Match Score</div>
            <Badge tone={tone} className="mt-1">{c.verifiedStatus}</Badge>
          </div>
        </div>

        {/* MATCH REASON */}
        <div className="mb-3 px-3 py-2 bg-blue-50 rounded-md">
          <p className="text-sm text-gray-700">
            💡 {getMatchReason()}
          </p>
        </div>

        {/* CONTACT INFO */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">{c.email}</span>
          </div>
          {c.linkedinUrl && (
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <a 
                href={c.linkedinUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline truncate inline-flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                LinkedIn Profile
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* METADATA */}
        <div className="text-xs text-gray-500 border-t border-gray-100 pt-2">
          <div className="flex items-center justify-between">
            <span>Source: {c.enrichedSource || c.source}</span>
            {c.confidence && (
              <span className="font-medium">
                {Math.round(c.confidence)}% confidence
              </span>
            )}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleClick}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded transition-colors ${
              selected 
                ? 'bg-[var(--brand-600)] text-white hover:bg-[var(--brand-700)]' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {selected ? '✓ Selected' : 'Select'}
          </button>
          {c.linkedinUrl && (
            <a
              href={c.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-2 border border-gray-300 text-sm rounded hover:bg-gray-50 transition-colors"
            >
              View
            </a>
          )}
        </div>
      </div>
    </div>
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
  const [showLowScore, setShowLowScore] = React.useState(false)
  const [showAllSeniority, setShowAllSeniority] = React.useState(false)
  const [groupBy, setGroupBy] = React.useState<'none' | 'brand' | 'seniority'>('none')
  const [sortBy, setSortBy] = React.useState<'score' | 'name' | 'seniority'>('score')
  
  // Smart filtering: hide low-score contacts and non-decision-makers by default
  const filteredContacts = React.useMemo(() => {
    let filtered = contacts
    
    // Hide low-score contacts (< 50) unless toggled
    if (!showLowScore) {
      filtered = filtered.filter(c => c.score >= 50)
    }
    
    // Show only decision-makers (C-Level, VP, Director) by default
    if (!showAllSeniority) {
      filtered = filtered.filter(c => 
        c.seniority === 'C-Level' || 
        c.seniority === 'VP' || 
        c.seniority === 'Director'
      )
    }
    
    // Sort contacts
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.score - a.score
        case 'name':
          return a.name.localeCompare(b.name)
        case 'seniority':
          const seniorityOrder: Record<string, number> = {
            'C-Level': 1,
            'VP': 2,
            'Director': 3,
            'Manager': 4,
            'Individual': 5
          }
          return (seniorityOrder[a.seniority] || 99) - (seniorityOrder[b.seniority] || 99)
        default:
          return 0
      }
    })
    
    return filtered
  }, [contacts, showLowScore, sortBy])
  
  // Group contacts if needed
  const groupedContacts = React.useMemo(() => {
    if (groupBy === 'none') {
      return { 'All Contacts': filteredContacts }
    }
    
    if (groupBy === 'brand') {
      const grouped: Record<string, ContactHit[]> = {}
      filteredContacts.forEach(contact => {
        const key = contact.brandName || contact.company || 'Unknown Brand'
        if (!grouped[key]) grouped[key] = []
        grouped[key].push(contact)
      })
      return grouped
    }
    
    if (groupBy === 'seniority') {
      const grouped: Record<string, ContactHit[]> = {}
      filteredContacts.forEach(contact => {
        const key = contact.seniority || 'Unknown'
        if (!grouped[key]) grouped[key] = []
        grouped[key].push(contact)
      })
      return grouped
    }
    
    return { 'All Contacts': filteredContacts }
  }, [filteredContacts, groupBy])
  
  const allIds = React.useMemo(() => filteredContacts.map(c => c.id), [filteredContacts])
  const hiddenCount = contacts.length - filteredContacts.length
  
  // Calculate specific hidden counts for better messaging
  const hiddenByScore = contacts.filter(c => c.score < 50).length
  const hiddenBySeniority = contacts.filter(c => 
    c.seniority !== 'C-Level' && 
    c.seniority !== 'VP' && 
    c.seniority !== 'Director'
  ).length

  const toggle = (id:string) => {
    setSelected(prev => {
      const isCurrentlySelected = prev.includes(id);
      const newSelected = isCurrentlySelected
        ? prev.filter(x => x !== id)  // Remove
        : [...prev, id];                // Add
      return newSelected;
    });
  }
  
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
      {/* Selection and Action Bar */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="font-medium text-lg">{selected.length}</span> 
              <span className="text-gray-600"> selected of {filteredContacts.length}</span>
              {hiddenCount > 0 && (
                <span className="text-xs text-gray-500 ml-2">
                  ({hiddenCount} hidden)
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={selectAll} className="h-9 px-3 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-sm">
              Select All
            </button>
            <button onClick={selectNone} className="h-9 px-3 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-sm">
              Clear
            </button>
            <button disabled={!selected.length || saving} onClick={save}
                    className="h-9 px-3 rounded-md bg-blue-600 text-white disabled:opacity-60 hover:bg-blue-700 text-sm font-medium">
              {saving ? 'Saving…' : `Save ${selected.length}`}
            </button>
            {onSaveAndContinue && (
              <button 
                disabled={!selected.length || savingAndContinuing} 
                onClick={handleSaveAndContinue}
                className="h-9 px-4 rounded-md bg-[var(--brand-600)] text-white disabled:opacity-60 hover:bg-[var(--brand-700)] font-medium text-sm"
              >
                {savingAndContinuing ? 'Saving...' : `Continue to Media Pack →`}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Smart Filters */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-9 px-3 rounded-md border border-gray-300 bg-white text-sm"
            >
              <option value="score">🔥 Match Score</option>
              <option value="seniority">👔 Seniority</option>
              <option value="name">📝 Name (A-Z)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Group by:</span>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as any)}
              className="h-9 px-3 rounded-md border border-gray-300 bg-white text-sm"
            >
              <option value="none">No grouping</option>
              <option value="brand">🏢 Brand</option>
              <option value="seniority">👔 Seniority</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 ml-auto">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input
                type="checkbox"
                checked={showAllSeniority}
                onChange={(e) => setShowAllSeniority(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600"
              />
              <span>Show all seniority levels</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input
                type="checkbox"
                checked={showLowScore}
                onChange={(e) => setShowLowScore(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600"
              />
              <span>Show low-score contacts (&lt;50)</span>
            </label>
          </div>
        </div>
        
        {/* Smart filter warnings */}
        {hiddenCount > 0 && (
          <div className="mt-3 space-y-2">
            {!showAllSeniority && hiddenBySeniority > 0 && (
              <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                👔 {hiddenBySeniority} contact{hiddenBySeniority === 1 ? '' : 's'} at Manager/Individual level {hiddenBySeniority === 1 ? 'is' : 'are'} hidden. 
                Showing only decision-makers (C-Level, VP, Director).
              </div>
            )}
            {!showLowScore && hiddenByScore > 0 && (
              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                💡 {hiddenByScore} contact{hiddenByScore === 1 ? '' : 's'} with low match score (&lt;50) {hiddenByScore === 1 ? 'is' : 'are'} hidden.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contacts Grid (with grouping support) */}
      {Object.entries(groupedContacts).map(([groupName, groupContacts]) => (
        <div key={groupName}>
          {groupBy !== 'none' && (
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              {groupName}
              <span className="text-sm font-normal text-gray-500">
                ({groupContacts.length} contact{groupContacts.length === 1 ? '' : 's'})
              </span>
            </h3>
          )}
          
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {groupContacts.map(c => {
              const isSelected = selected.includes(c.id);
              return (
                <Card 
                  key={c.id} 
                  c={c} 
                  selected={isSelected} 
                  toggle={() => toggle(c.id)} 
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

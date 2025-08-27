'use client'

import * as React from 'react'
import DiscoveryForm, { type DiscoveryParams } from './DiscoveryForm'
import ResultsGrid from './ResultsGrid'
import useContactDiscovery from './useContactDiscovery'

export default function DiscoverContactsPage() {
  const { discovering, results, error, discover, saveSelected } = useContactDiscovery()
  const [query, setQuery] = React.useState('')
  const [status, setStatus] = React.useState<'ALL'|'VALID'|'RISKY'|'INVALID'>('ALL')

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return results.filter(r => {
      const okQ = !q || r.name.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || r.company.toLowerCase().includes(q)
      const okS = status === 'ALL' || r.verifiedStatus === status
      return okQ && okS
    })
  }, [results, query, status])

  const onDiscover = async (params: DiscoveryParams) => { await discover(params) }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Discover Contacts</h1>
        <p className="text-[var(--muted-fg)]">Find verified decision-makers at your target brands using smart discovery.</p>
      </div>

      {/* Form */}
      <DiscoveryForm onDiscover={onDiscover} discovering={discovering} />

      {/* Toolbar */}
      <div className="card p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex gap-2">
          <input
            value={query}
            onChange={e=>setQuery(e.target.value)}
            placeholder="Search name, title, email, company…"
            className="h-10 w-[280px] rounded-md border border-[var(--border)] bg-[var(--card)] px-3"
          />
          <select
            value={status}
            onChange={e=>setStatus(e.target.value as 'ALL'|'VALID'|'RISKY'|'INVALID')}
            className="h-10 rounded-md border border-[var(--border)] bg-[var(--card)] px-3"
          >
            <option value="ALL">All statuses</option>
            <option value="VALID">Valid</option>
            <option value="RISKY">Risky</option>
            <option value="INVALID">Invalid</option>
          </select>
        </div>

        <div className="text-sm text-[var(--muted-fg)]">
          {filtered.length} result{filtered.length===1?'':'s'}
        </div>
      </div>

      {/* Errors / Loading / Results */}
      {error && <div className="card p-4 border-[var(--error)] bg-[var(--tint-error)] text-[var(--error)] text-sm">{error}</div>}

      {discovering ? (
        <div className="card p-10 text-center text-[var(--muted-fg)]">
          <div className="w-8 h-8 mx-auto mb-3 border-4 border-[var(--brand-600)] border-t-transparent rounded-full animate-spin"/>
          Discovering contacts…
        </div>
      ) : (
        <ResultsGrid contacts={filtered} onSaveSelected={saveSelected} />
      )}
    </div>
  )
}

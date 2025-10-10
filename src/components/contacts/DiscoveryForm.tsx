'use client'

import * as React from 'react'
import { Sparkles, ChevronDown } from 'lucide-react'

export type DiscoveryParams = {
  brandName: string
  domain: string
  industry: string
  seniority: string[]
  departments: string[]
  titles?: string
}

export default function DiscoveryForm({
  onDiscover,
  discovering
}:{ onDiscover:(p:DiscoveryParams)=>Promise<void>, discovering:boolean }) {
  const [showAdvanced, setShowAdvanced] = React.useState(false)
  const [params, setParams] = React.useState<DiscoveryParams>({
    brandName: '',
    domain: '',
    industry: '',
    seniority: ['Manager','Director','VP','C-Level'],
    departments: ['Marketing','Partnerships','Business Development'],
    titles: ''
  })

  function update<K extends keyof DiscoveryParams>(k:K, v:DiscoveryParams[K]) {
    setParams(p => ({...p, [k]: v}))
  }
  
  const toggleDepartment = (dept: string) => {
    const newDepts = params.departments.includes(dept)
      ? params.departments.filter(d => d !== dept)
      : [...params.departments, dept]
    update('departments', newDepts)
  }
  
  const toggleSeniority = (level: string) => {
    const newSeniority = params.seniority.includes(level)
      ? params.seniority.filter(s => s !== level)
      : [...params.seniority, level]
    update('seniority', newSeniority)
  }

  return (
    <div className="card p-5 md:p-6">
      <div className="text-lg font-semibold mb-4">Discovery Criteria</div>
      
      <div className="space-y-4">
        {/* Basic search - always visible */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium block mb-1">Brand Name</label>
            <input
              className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 focus:outline-none focus:ring-2 focus:ring-[var(--brand-600)]"
              placeholder="e.g., Nike"
              value={params.brandName}
              onChange={e=>update('brandName', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Domain</label>
            <input
              className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 focus:outline-none focus:ring-2 focus:ring-[var(--brand-600)]"
              placeholder="e.g., nike.com"
              value={params.domain}
              onChange={e=>update('domain', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Industry (Optional)</label>
          <select
            className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 focus:outline-none focus:ring-2 focus:ring-[var(--brand-600)]"
            value={params.industry}
            onChange={e=>update('industry', e.target.value)}
          >
            <option value="">Select industry...</option>
            <option value="technology">Technology</option>
            <option value="fashion">Fashion & Apparel</option>
            <option value="health">Health & Wellness</option>
            <option value="finance">Finance</option>
            <option value="education">Education</option>
          </select>
        </div>

        {/* Advanced filters toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between px-4 py-2 rounded-md border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--surface)] transition-colors"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            🔍 {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>

        {/* Collapsible advanced section */}
        {showAdvanced && (
          <div className="space-y-4 p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
            <div>
              <label className="text-sm font-medium mb-2 block">Departments</label>
              <div className="grid grid-cols-2 gap-2">
                {['Marketing', 'Partnerships', 'Sales', 'Business Development'].map(dept => (
                  <label key={dept} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={params.departments.includes(dept)}
                      onChange={() => toggleDepartment(dept)}
                      className="w-4 h-4 rounded border-[var(--border)] text-[var(--brand-600)] focus:ring-2 focus:ring-[var(--brand-600)]"
                    />
                    <span className="text-sm">{dept}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Seniority Level</label>
              <div className="grid grid-cols-2 gap-2">
                {['Manager', 'Director', 'VP', 'C-Level'].map(level => (
                  <label key={level} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={params.seniority.includes(level)}
                      onChange={() => toggleSeniority(level)}
                      className="w-4 h-4 rounded border-[var(--border)] text-[var(--brand-600)] focus:ring-2 focus:ring-[var(--brand-600)]"
                    />
                    <span className="text-sm">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Specific Roles</label>
              <input
                className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 focus:outline-none focus:ring-2 focus:ring-[var(--brand-600)]"
                placeholder="e.g., CMO, VP Marketing"
                value={params.titles || ''}
                onChange={e=>update('titles', e.target.value)}
              />
              <p className="text-xs text-[var(--muted-fg)] mt-1">Comma-separated list of job titles</p>
            </div>
          </div>
        )}

        {/* Search button */}
        <button
          disabled={discovering || !params.domain || !params.brandName}
          onClick={()=>onDiscover(params)}
          className="w-full inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-[var(--brand-600)] hover:bg-[var(--brand-600)]/90 px-4 text-white font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          <Sparkles className="w-4 h-4"/>{discovering ? 'Discovering…' : 'Discover Contacts'}
        </button>
      </div>
    </div>
  )
}

'use client'

import * as React from 'react'
import { Sparkles } from 'lucide-react'

export type DiscoveryParams = {
  brandName: string
  domain: string
  industry: string
  seniority: string[]
  departments: string[]
}

export default function DiscoveryForm({
  onDiscover,
  discovering
}:{ onDiscover:(p:DiscoveryParams)=>Promise<void>, discovering:boolean }) {
  const [params, setParams] = React.useState<DiscoveryParams>({
    brandName: '',
    domain: '',
    industry: '',
    seniority: ['Manager','Director','VP','C-Level'],
    departments: ['Marketing','Partnerships','Business Development']
  })

  function update<K extends keyof DiscoveryParams>(k:K, v:DiscoveryParams[K]) {
    setParams(p => ({...p, [k]: v}))
  }

  return (
    <div className="card p-5 md:p-6">
      <div className="text-lg font-semibold mb-4">Discovery Criteria</div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm">Brand name</label>
          <input
            className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3"
            placeholder="Nike"
            value={params.brandName}
            onChange={e=>update('brandName', e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm">Domain</label>
          <input
            className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3"
            placeholder="nike.com"
            value={params.domain}
            onChange={e=>update('domain', e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm">Industry</label>
          <select
            className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3"
            value={params.industry}
            onChange={e=>update('industry', e.target.value)}
          >
            <option value="">Select</option>
            <option value="technology">Technology</option>
            <option value="fashion">Fashion & Apparel</option>
            <option value="health">Health & Wellness</option>
            <option value="finance">Finance</option>
            <option value="education">Education</option>
          </select>
        </div>
        <div>
          <label className="text-sm">Seniority (multi)</label>
          <select multiple
            className="mt-1 min-h-[104px] w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2"
            value={params.seniority}
            onChange={e=>update('seniority', Array.from(e.target.selectedOptions).map(o=>o.value))}
          >
            {['Manager','Director','Lead','Head','VP','C-Level'].map(o=><option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="text-sm">Departments (multi)</label>
          <select multiple
            className="mt-1 min-h-[104px] w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2"
            value={params.departments}
            onChange={e=>update('departments', Array.from(e.target.selectedOptions).map(o=>o.value))}
          >
            {['Marketing','Brand','Partnerships','Business Development','Social','Growth'].map(o=><option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          disabled={discovering || !params.domain || !params.brandName}
          onClick={()=>onDiscover(params)}
          className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[var(--brand-600)] hover:bg-[var(--brand-600)]/90 px-4 text-white disabled:opacity-60"
        >
          <Sparkles className="w-4 h-4"/>{discovering ? 'Discovering…' : 'Discover Contacts'}
        </button>
      </div>
    </div>
  )
}

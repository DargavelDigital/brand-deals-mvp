'use client'
import * as React from 'react'
import { PLATFORMS, type PlatformId } from '@/config/platforms'

export default function AuditConfig({
  selected, onChange, onRun, running,
}: {
  selected: PlatformId[]
  onChange: (list: PlatformId[]) => void
  onRun: () => void
  running: boolean
}){
  const toggle = (id:PlatformId)=> {
    const has = selected.includes(id)
    onChange(has ? selected.filter(x=>x!==id) : [...selected, id])
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold tracking-tight">AI Audit</div>
          <div className="text-sm text-[var(--muted-fg)]">Analyze your content & audience across selected platforms.</div>
        </div>
        <button
          onClick={onRun}
          disabled={running || selected.length===0}
          className="inline-flex items-center justify-center h-10 px-4 rounded-[10px] text-sm font-medium text-white bg-[var(--brand-600)] hover:bg-[color-mix(in oklch,var(--brand-600) 90%, black)] disabled:opacity-60"
        >
          {running ? 'Running…' : 'Run Audit'}
        </button>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {PLATFORMS.map(p=>(
          <label key={p.id} className="flex items-center gap-3 rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-3 py-2 cursor-pointer">
            <input
              type="checkbox"
              className="accent-[var(--brand-600)]"
              checked={selected.includes(p.id as PlatformId)}
              onChange={()=>toggle(p.id as PlatformId)}
            />
            <span>{p.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

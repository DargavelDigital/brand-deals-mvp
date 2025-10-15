'use client'
import * as React from 'react'
import { PLATFORMS, type PlatformId } from '@/config/platforms'

export default function AuditConfig({
  selected, onChange, onRun, running, disabled
}: {
  selected: PlatformId[]
  onChange: (list: PlatformId[]) => void
  onRun: () => void
  running: boolean
  disabled?: boolean
}){
  const toggle = (id:PlatformId)=> {
    const has = selected.includes(id)
    onChange(has ? selected.filter(x=>x!==id) : [...selected, id])
  }

  // Filter to only visible platforms
  const visiblePlatforms = PLATFORMS.filter(p => p.visible !== false)

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

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {visiblePlatforms.map(p=>{
          const isDisabled = p.enabled === false || disabled
          return (
            <label key={p.id} className={`flex items-center gap-3 rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-3 py-2 ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
              <input
                type="checkbox"
                className="accent-[var(--brand-600)]"
                checked={selected.includes(p.id as PlatformId)}
                onChange={()=>!isDisabled && toggle(p.id as PlatformId)}
                disabled={isDisabled}
              />
              <span className="flex-1">{p.label}</span>
              {isDisabled && (
                <span className="text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded">
                  Coming Soon
                </span>
              )}
            </label>
          )
        })}
      </div>
    </div>
  )
}

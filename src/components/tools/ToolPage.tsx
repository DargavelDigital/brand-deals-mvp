'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'

export type ToolPageProps = {
  title: string
  subtitle?: string
  primaryLabel: string       // e.g., "Run AI Audit"
  onPrimary: () => Promise<any>
  onAfterSuccess?: (data: any) => void
  showAdvance?: boolean      // show "Advance to next step"
}

export default function ToolPage({ 
  title, 
  subtitle, 
  primaryLabel, 
  onPrimary, 
  onAfterSuccess, 
  showAdvance 
}: ToolPageProps) {
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle')
  const [msg, setMsg] = useState<string>('')

  async function handlePrimary() {
    try {
      setStatus('running')
      setMsg('')
      const data = await onPrimary()
      setStatus('success')
      setMsg('Done.')
      onAfterSuccess?.(data)
    } catch (e: any) {
      setStatus('error')
      setMsg(e?.message || 'Something went wrong')
    }
  }

  async function handleAdvance() {
    try {
      setStatus('running')
      await (await import('@/lib/api')).advanceBrandRun()
      setStatus('success')
      setMsg('Advanced to next step.')
    } catch (e: any) {
      setStatus('error')
      setMsg(e?.message || 'Advance failed')
    }
  }

  return (
    <div className="container-max">
      <h1 className="text-3xl font-bold mb-1">{title}</h1>
      {subtitle && <p className="text-[var(--muted-fg)] mb-4">{subtitle}</p>}

      <div className="grid md:grid-cols-[1fr,320px] gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="font-medium">{primaryLabel}</div>
            <div className="text-xs text-[var(--muted-fg)]">
              {status === 'running' ? 'Running…' : status === 'success' ? 'Completed' : status === 'error' ? 'Failed' : 'Ready'}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handlePrimary} disabled={status === 'running'}>
              {status === 'running' ? 'Working…' : primaryLabel}
            </Button>
            {showAdvance && (
              <Button variant="secondary" onClick={handleAdvance} disabled={status === 'running'}>
                Advance to next step
              </Button>
            )}
          </div>

          {msg && (
            <div className={`mt-4 text-sm ${status === 'error' ? 'text-[var(--error)]' : 'text-[var(--success)]'}`}>
              {msg}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="font-medium mb-2">Tips</div>
          <ul className="text-sm list-disc pl-5 text-[var(--muted-fg)]">
            <li>Runs are cached; you can rerun anytime.</li>
            <li>Results feed into the Brand Run automatically.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

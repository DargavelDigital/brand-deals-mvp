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
    <div>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}

      <div>
        <div>
          <div>
            <div>{primaryLabel}</div>
            <div>
              {status === 'running' ? 'Running…' : status === 'success' ? 'Completed' : status === 'error' ? 'Failed' : 'Ready'}
            </div>
          </div>
          <div>
            <Button onClick={handlePrimary} disabled={status === 'running'}>
              {status === 'running' ? 'Working…' : primaryLabel}
            </Button>
            {showAdvance && (
              <Button onClick={handleAdvance} disabled={status === 'running'}>
                Advance to next step
              </Button>
            )}
          </div>

          {msg && (
            <div>
              {msg}
            </div>
          )}
        </div>

        <div>
          <div>Tips</div>
          <ul>
            <li>Runs are cached; you can rerun anytime.</li>
            <li>Results feed into the Brand Run automatically.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

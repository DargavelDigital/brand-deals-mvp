'use client'
import React, { useState, useEffect } from 'react'
import AuditConfig from '@/components/audit/AuditConfig'
import AuditProgress from '@/components/audit/AuditProgress'
import AuditResults, { type AuditResultFront } from '@/components/audit/AuditResults'
import { runAudit, pollAuditStatus, getLatestAudit } from '@/lib/auditClient'
import { type PlatformId } from '@/config/platforms'
import { useLocale } from 'next-intl'

interface StepAuditEmbedProps {
  workspaceId: string
  onDirtyChange: (dirty: boolean) => void
  data: any
  setData: (data: any) => void
  goNext: () => void
}

export default function StepAuditEmbed({ 
  workspaceId, 
  onDirtyChange, 
  data, 
  setData, 
  goNext 
}: StepAuditEmbedProps) {
  const locale = useLocale()
  const [running, setRunning] = useState(false)
  const [auditData, setAuditData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<PlatformId[]>([])

  const refreshLatest = React.useCallback(async () => {
    const res = await getLatestAudit('tiktok') // Default to tiktok for now
    if (res.ok) setAuditData(res.audit ?? null)
  }, [])

  const onRun = async () => {
    setRunning(true)
    setError(null)
    try {
      const run = await runAudit('tiktok') // Default to tiktok for now
      if (!run.ok || !run.jobId) {
        throw new Error(run.error ?? 'Failed to start audit')
      }
      const status = await pollAuditStatus(run.jobId, 15, 1000)
      if (!status.ok || status.error) {
        throw new Error(status.error ?? 'Audit did not complete')
      }
      await refreshLatest()
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong')
    } finally {
      setRunning(false)
    }
  }

  useEffect(() => {
    // fetch latest on mount
    refreshLatest()
  }, [refreshLatest])

  useEffect(() => {
    const hasRun = !!auditData?.id
    onDirtyChange(hasRun)
    setData(prevData => ({ ...prevData, hasRun, auditData }))
  }, [auditData, onDirtyChange, setData])

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="text-center">
        <p className="text-muted-foreground">
          Analyze your social media performance to understand your brand better.
        </p>
        <a 
          href={`/${locale}/tools/audit`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-800 underline mt-2 inline-block"
        >
          Learn more about content auditing →
        </a>
      </div>

      {/* Use the same audit components as the individual tool page */}
      <AuditConfig selected={selected} onChange={setSelected} onRun={onRun} running={running} />

      {running && <AuditProgress />}

      {error && (
        <div className="card p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {auditData?.id && (
        <AuditResults data={auditData as AuditResultFront} onRefresh={refreshLatest} />
      )}

      {!running && !auditData?.id && (
        <div className="card p-8 text-center text-muted-foreground">
          No audits yet. Select platforms above and click <span className="font-medium text-foreground">Run Audit</span>.
        </div>
      )}

      {auditData?.id && (
        <div className="text-center pt-4">
          <button
            onClick={goNext}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Continue to Brand Matching
          </button>
        </div>
      )}
    </div>
  )
}

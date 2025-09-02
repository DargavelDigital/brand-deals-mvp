'use client'
import React, { useState, useEffect } from 'react'
import AuditConfig from '@/components/audit/AuditConfig'
import AuditProgress from '@/components/audit/AuditProgress'
import AuditResults, { type AuditResultFront } from '@/components/audit/AuditResults'
import useAuditRunner from '@/components/audit/useAuditRunner'
import { type PlatformId } from '@/config/platforms'

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
  const { running, data: auditData, error, run, refresh } = useAuditRunner()
  const [selected, setSelected] = useState<PlatformId[]>([])

  const onRun = () => run({ platforms: selected })

  useEffect(() => {
    const hasRun = !!auditData?.auditId
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
          href="/tools/audit" 
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

      {auditData?.auditId && (
        <AuditResults data={auditData as AuditResultFront} onRefresh={refresh} />
      )}

      {!running && !auditData?.auditId && (
        <div className="card p-8 text-center text-muted-foreground">
          No audits yet. Select platforms above and click <span className="font-medium text-foreground">Run Audit</span>.
        </div>
      )}

      {auditData?.auditId && (
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

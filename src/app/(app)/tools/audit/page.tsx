'use client'
import * as React from 'react'
import AuditConfig from '@/components/audit/AuditConfig'
import AuditProgress from '@/components/audit/AuditProgress'
import AuditResults, { type AuditResultFront } from '@/components/audit/AuditResults'
import useAuditRunner from '@/components/audit/useAuditRunner'
import { type PlatformId } from '@/config/platforms'

export default function AuditToolPage(){
  const { running, data, error, run, refresh } = useAuditRunner()
  const [selected, setSelected] = React.useState<PlatformId[]>([])

  const onRun = ()=> run({ platforms: selected })

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Run AI Audit</h1>
          <p className="text-[var(--muted-fg)]">Audit your social profiles to unlock insights and better brand matches.</p>
        </div>
      </div>

      <AuditConfig selected={selected} onChange={setSelected} onRun={onRun} running={running} />

      {running && <AuditProgress />}

      {error && (
        <div className="card p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {data?.auditId && (
        <AuditResults data={data as AuditResultFront} onRefresh={refresh} />
      )}

      {!running && !data?.auditId && (
        <div className="card p-8 text-center text-[var(--muted-fg)]">
          No audits yet. Select platforms above and click <span className="font-medium text-[var(--fg)]">Run Audit</span>.
        </div>
      )}
    </div>
  )
}

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
  const [ytChannelId, setYtChannelId] = React.useState('')

  const onRun = ()=> run({ platforms: selected })

  // Dev-only snapshot puller
  const pullSnapshot = async () => {
    try {
      const wsId = document.cookie.split('; ').find(row => row.startsWith('wsid='))?.split('=')[1] || 'demo-workspace'
      const res = await fetch(`/api/social/snapshot?workspaceId=${wsId}&yt=${ytChannelId}`)
      const data = await res.json()
      alert('Snapshot pulled! Check console for details.')
    } catch (error) {
      alert('Failed to pull snapshot')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Run AI Audit</h1>
          <p className="text-[var(--muted-fg)]">Audit your social profiles to unlock insights and better brand matches.</p>
        </div>
      </div>

      {/* Dev-only snapshot puller */}
      {process.env.NODE_ENV === 'development' && (
        <div className="card p-4 space-y-3">
          <h3 className="font-medium">🔧 Dev: Test Social Snapshot</h3>
          <div className="flex gap-2 items-center">
            <input 
              value={ytChannelId} 
              onChange={e => setYtChannelId(e.target.value)} 
              placeholder="YouTube channelId (optional)" 
              className="flex-1 px-3 py-2 border rounded-md text-sm"
            />
            <button 
              onClick={pullSnapshot}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              Pull Snapshot
            </button>
          </div>
        </div>
      )}

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

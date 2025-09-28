'use client'
import * as React from 'react'
import AuditConfig from '@/components/audit/AuditConfig'
import AuditProgress from '@/components/audit/AuditProgress'
import AuditResults, { type AuditResultFront } from '@/components/audit/AuditResults'
import useAuditRunner from '@/components/audit/useAuditRunner'
import { type PlatformId } from '@/config/platforms'
import { get } from '@/lib/clientEnv'
import { isToolEnabled } from '@/lib/launch'
import { ComingSoon } from '@/components/ComingSoon'
import PageShell from '@/components/PageShell'

export default function AuditToolPage(){
  const enabled = isToolEnabled("audit")
  
  if (!enabled) {
    return (
      <PageShell title="AI Audit" subtitle="Audit your social profiles to unlock insights and better brand matches.">
        <div className="mx-auto max-w-md">
          <ComingSoon
            title="AI Audit"
            subtitle="This tool will be enabled soon. The page is visible so you can navigate and preview the UI."
          />
        </div>
      </PageShell>
    )
  }

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
    <PageShell title="AI Audit" subtitle="Audit your social profiles to unlock insights and better brand matches.">
      {/* Dev-only snapshot puller */}
      {get('NODE_ENV') === 'development' && (
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
    </PageShell>
  )
}

'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import AuditConfig from '@/components/audit/AuditConfig'
import AuditProgress from '@/components/audit/AuditProgress'
import AuditResults, { type AuditResultFront } from '@/components/audit/AuditResults'
import EnhancedAuditResults, { type EnhancedAuditData } from '@/components/audit/EnhancedAuditResults'
import useAuditRunner from '@/components/audit/useAuditRunner'
import { type PlatformId } from '@/config/platforms'
import { get } from '@/lib/clientEnv'
import { isToolEnabled } from '@/lib/launch'
import { ComingSoon } from '@/components/ComingSoon'
import PageShell from '@/components/PageShell'
import { Button } from '@/components/ui/Button'
import { WorkflowProgress } from '@/components/ui/WorkflowProgress'

export default function AuditToolPage(){
  const router = useRouter()
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

  const { running, data, error, run, refresh, jobId, progress, stage } = useAuditRunner()
  const [selected, setSelected] = React.useState<PlatformId[]>([])
  const [ytChannelId, setYtChannelId] = React.useState('')
  
  // Check if error is about missing social accounts
  const isSocialAccountsError = error && error.includes('No social accounts connected')

  const onRun = ()=> run({ platforms: selected })

  // Dev-only snapshot puller
  const pullSnapshot = async () => {
    try {
      const wsId = document.cookie.split('; ').find(row => row.startsWith('wsid='))?.split('=')[1]
      
      if (!wsId) {
        throw new Error('No workspace ID found. Please log in.')
      }
      const res = await fetch(`/api/social/snapshot?workspaceId=${wsId}&yt=${ytChannelId}`)
      const data = await res.json()
      alert('Snapshot pulled! Check console for details.')
    } catch (error) {
      alert('Failed to pull snapshot')
    }
  }

  return (
    <PageShell title="AI Audit" subtitle="Audit your social profiles to unlock insights and better brand matches.">
      {/* NEW: Workflow progress indicator */}
      <WorkflowProgress 
        currentStep={1} 
        steps={['Connect', 'Audit', 'Matches', 'Contacts', 'Pack', 'Outreach']}
      />

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
              className="px-4 py-2 bg-[var(--ds-primary)] text-white rounded-md text-sm hover:bg-[var(--ds-primary-hover)]"
            >
              Pull Snapshot
            </button>
          </div>
        </div>
      )}

      <AuditConfig selected={selected} onChange={setSelected} onRun={onRun} running={running} />

      {running && (
        <div className="space-y-4">
          {/* Async Progress Modal */}
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold mb-4">Running AI Audit...</h3>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              {/* Current stage */}
              <p className="text-sm text-gray-600 mb-2">{stage}</p>
              <p className="text-xs text-gray-500">{progress}% complete</p>
              
              {/* Time estimate */}
              {progress < 60 && (
                <p className="text-xs text-gray-400 mt-4">
                  This may take 2-3 minutes. We're using advanced AI reasoning for the best insights.
                </p>
              )}
              
              {/* Job ID for debugging */}
              {jobId && (
                <p className="text-xs text-gray-300 mt-2">Job ID: {jobId}</p>
              )}
            </div>
          </div>
          
          <AuditProgress />
        </div>
      )}

      {error && isSocialAccountsError && (
        <div className="card p-6 border border-[var(--ds-warning)] bg-[var(--ds-warning-light)]">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-[var(--ds-warning-hover)] mb-2">
                Social Accounts Required
              </h3>
              <p className="text-sm text-[var(--ds-warning-hover)]">
                Please connect at least one social media account (Instagram, TikTok, or YouTube) to run an audit.
              </p>
            </div>
            <Button 
              onClick={() => router.push('/tools/connect')}
              variant="primary"
            >
              Connect Accounts →
            </Button>
          </div>
        </div>
      )}

      {error && !isSocialAccountsError && (
        <div className="card p-6 border border-[var(--ds-error)] bg-[var(--ds-error-light)]">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-[var(--ds-error-hover)]">Audit Failed</h3>
            <p className="text-sm text-[var(--ds-error-hover)]">{error}</p>
          </div>
        </div>
      )}

      {data?.auditId && (
        <>
          {/* Show enhanced results if v2 data exists, otherwise fallback to v1 */}
          {data.creatorProfile || data.brandFit ? (
            <EnhancedAuditResults data={data as EnhancedAuditData} onRefresh={refresh} />
          ) : (
            <AuditResults data={data as AuditResultFront} onRefresh={refresh} />
          )}
        </>
      )}

      {!running && !data?.auditId && (
        <div className="card p-8 text-center text-[var(--muted-fg)]">
          No audits yet. Select platforms above and click <span className="font-medium text-[var(--fg)]">Run Audit</span>.
        </div>
      )}

      {/* NEW: Continue button - only show after audit completes */}
      {data?.auditId && !running && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => router.push('/tools/matches')}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[var(--ds-success)] to-[var(--ds-success-hover)] text-white font-semibold rounded-lg shadow-lg hover:scale-105 transition-all duration-200"
          >
            Continue to Brand Matches
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      )}
    </PageShell>
  )
}

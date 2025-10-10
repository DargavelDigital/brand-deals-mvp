'use client'
import { useRouter } from 'next/navigation'
import ConnectGrid from '@/components/connect/ConnectGrid'
import { isToolEnabled } from '@/lib/launch'
import { ComingSoon } from '@/components/ComingSoon'
import PageShell from '@/components/PageShell'
import { WorkflowProgress } from '@/components/ui/WorkflowProgress'

export default function ConnectToolPage() {
  const router = useRouter()
  const enabled = isToolEnabled("connect")
  
  return (
    <PageShell title="Connect Accounts" subtitle="Link your social profiles to power audits, matching, and outreach.">
      {/* NEW: Workflow progress indicator */}
      <WorkflowProgress 
        currentStep={0} 
        steps={['Connect', 'Audit', 'Matches', 'Contacts', 'Pack', 'Outreach']}
      />

      {enabled ? (
        <ConnectGrid />
      ) : (
        <div className="mx-auto max-w-md">
          <ComingSoon
            title="Connect Accounts"
            subtitle="This tool will be enabled soon. The page is visible so you can navigate and preview the UI."
          />
        </div>
      )}

      {/* NEW: Continue button - always show on Connect page */}
      {enabled && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => router.push('/tools/audit')}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[var(--ds-success)] to-[var(--ds-success-hover)] text-white font-semibold rounded-lg shadow-lg hover:scale-105 transition-all duration-200"
          >
            Continue to AI Audit
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      )}
    </PageShell>
  )
}

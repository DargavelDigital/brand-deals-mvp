'use client'

import ToolPage from '@/components/tools/ToolPage'
import { runAudit, getLatestAudit } from '@/lib/api'

export default function AuditTool() {
  return (
    <ToolPage
      title="AI Audit"
      subtitle="Analyze your content & audience to power brand discovery."
      primaryLabel="Run AI Audit"
      onPrimary={runAudit}
      onAfterSuccess={() => { /* optionally refetch latest */ }}
      showAdvance
    />
  )
}

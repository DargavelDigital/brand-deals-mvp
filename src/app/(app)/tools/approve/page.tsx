'use client'

import ToolPage from '@/components/tools/ToolPage'

export default function ApproveTool() {
  return (
    <ToolPage
      title="Approve Brands"
      subtitle="Review and approve brands for outreach."
      primaryLabel="Review Brands"
      onPrimary={() => Promise.resolve()}
      showAdvance
    />
  )
}

'use client'

import ToolPage from '@/components/tools/ToolPage'

export default function ConnectTool() {
  return (
    <ToolPage
      title="Connect Accounts"
      subtitle="Link your social media accounts for data sync."
      primaryLabel="Connect Accounts"
      onPrimary={() => Promise.resolve()}
      showAdvance
    />
  )
}

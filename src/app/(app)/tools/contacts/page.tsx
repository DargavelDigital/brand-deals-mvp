'use client'

import ToolPage from '@/components/tools/ToolPage'

export default function ContactsTool() {
  return (
    <ToolPage
      title="Discover Contacts"
      subtitle="Find decision makers at target brands."
      primaryLabel="Find Contacts"
      onPrimary={() => Promise.resolve()}
      showAdvance
    />
  )
}

'use client'

import ToolPage from '@/components/tools/ToolPage'
import { generateMatches } from '@/lib/api'

export default function MatchTool() {
  return (
    <ToolPage
      title="Brand Matches"
      subtitle="Generate matched brands using the latest audit."
      primaryLabel="Generate Matches"
      onPrimary={generateMatches}
      showAdvance
    />
  )
}

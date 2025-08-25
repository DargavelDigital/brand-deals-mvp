'use client'

import ToolPage from '@/components/tools/ToolPage'
import { startOutreach } from '@/lib/api'

export default function OutreachTool() {
  return (
    <ToolPage
      title="Outreach"
      subtitle="Start a 3–4 touch sequence with reply detection."
      primaryLabel="Start Outreach"
      onPrimary={() => startOutreach()}
      showAdvance
    />
  )
}

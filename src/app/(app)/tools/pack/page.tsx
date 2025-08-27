'use client'

import ToolPage from '@/components/tools/ToolPage'
import { generateMediaPack } from '@/lib/api'

export default function PackTool() {
  return (
    <ToolPage
      title="Media Pack"
      subtitle="Create a tailored media pack for selected brands."
      primaryLabel="Generate Media Pack"
      onPrimary={() => generateMediaPack()}
      showAdvance
    />
  )
}

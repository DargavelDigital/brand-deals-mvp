'use client'

import ToolPage from '@/components/tools/ToolPage'

export default function ToolsPage() {
  return (
    <div>
      <ToolPage 
        title="Tools"
        subtitle="Run any step on its own. Results flow into your Brand Run."
        primaryLabel="Run Tool"
        onPrimary={async () => {
          console.log('Tool executed')
          return { success: true }
        }}
      />
    </div>
  )
}

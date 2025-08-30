'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'

export default function DemoTogglePage() {
  const [demoMode, setDemoMode] = useState(false)

  const toggleDemoMode = () => {
    setDemoMode(!demoMode)
    // In a real implementation, this would set a cookie or call an API
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Demo Mode</h1>
        <p className="text-[var(--muted-fg)]">
          Enable demo mode to bypass authentication and use sample data for testing and demonstration purposes.
        </p>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Demo Mode</h3>
            <p className="text-sm text-[var(--muted-fg)]">
              Enable demo mode to bypass authentication and use sample data
            </p>
          </div>
          <button
            onClick={toggleDemoMode}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              demoMode
                ? 'bg-[var(--brand-600)] text-white'
                : 'bg-[var(--muted)] text-[var(--muted-fg)] hover:bg-[var(--muted)]/80'
            }`}
          >
            {demoMode ? 'Enabled' : 'Disabled'}
          </button>
        </div>
        
        {demoMode && (
          <div className="mt-4 p-4 bg-[var(--muted)] rounded-md">
            <p className="text-sm text-[var(--muted-fg)]">
              Demo mode is currently enabled. You can now access features without authentication.
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}

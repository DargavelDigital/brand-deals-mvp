'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'

export default function ThemeTogglePage() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
    // In a real implementation, this would set a cookie or call an API
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Theme Selection</h3>
            <p className="text-sm text-[var(--muted-fg)]">
              Choose your preferred theme or let the system decide
            </p>
          </div>
          
          <div className="grid gap-3">
            {(['light', 'dark', 'system'] as const).map((themeOption) => (
              <button
                key={themeOption}
                onClick={() => handleThemeChange(themeOption)}
                className={`flex items-center justify-between p-3 rounded-md border transition-colors ${
                  theme === themeOption
                    ? 'border-[var(--brand-600)] bg-[var(--brand-600)] text-white'
                    : 'border-[var(--border)] hover:border-[var(--brand-300)] hover:bg-[var(--muted)]/50'
                }`}
              >
                <span className="capitalize">{themeOption}</span>
                {theme === themeOption && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

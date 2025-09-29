'use client'

import { useTheme } from 'next-themes'
import { Card } from '@/components/ui/Card'

export default function ThemeTogglePage() {
  const { theme, setTheme, systemTheme } = useTheme()

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
    // best-effort persistence; ignore errors so UI never blocks
    try {
      await fetch('/api/settings/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: newTheme }),
      })
    } catch {/* noop */}
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Theme Settings</h1>
        <p className="text-[var(--muted-fg)]">
          Choose your preferred theme or let the system decide based on your device preferences.
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Theme Selection</h3>
            <p className="text-sm text-[var(--muted-fg)]">
              Choose your preferred theme or let the system decide
              {systemTheme && (
                <span className="ml-2 text-xs">
                  (System: {systemTheme})
                </span>
              )}
            </p>
          </div>
          
          <div className="grid gap-3">
            {(['light', 'dark', 'system'] as const).map((themeOption) => (
              <button
                key={themeOption}
                onClick={() => handleThemeChange(themeOption)}
                className={`flex items-center justify-between p-3 rounded-md border transition-colors ${
                  (theme ?? 'system') === themeOption
                    ? 'border-[var(--brand-600)] bg-[var(--brand-600)] text-white'
                    : 'border-[var(--border)] hover:border-[var(--brand-300)] hover:bg-[var(--muted)]/50'
                }`}
              >
                <span className="capitalize">{themeOption}</span>
                {(theme ?? 'system') === themeOption && (
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

'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Circle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'

type Theme = 'light' | 'dark' | 'system'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  const applyTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    
    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      document.documentElement.classList.toggle('dark', systemTheme === 'dark')
    } else {
      document.documentElement.classList.toggle('dark', newTheme === 'dark')
    }
  }

  if (!mounted) return null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text">Theme Settings</h2>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-text">Theme Mode</h3>
              <p className="text-muted">
                Choose your preferred theme appearance.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {(['light', 'dark', 'system'] as Theme[]).map((themeOption) => (
                <Button
                  key={themeOption}
                  variant={theme === themeOption ? 'primary' : 'secondary'}
                  onClick={() => applyTheme(themeOption)}
                  size="sm"
                >
                  {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-text">Current Theme Features:</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li className="flex items-center gap-2">
                <span className="text-success">✓</span>
                Responsive design
              </li>
              <li className="flex items-center gap-2">
                <span className="text-success">✓</span>
                Accessibility support
              </li>
              <li className="flex items-center gap-2">
                <span className="text-success">✓</span>
                Custom color schemes
              </li>
              <li className="flex items-center gap-2">
                <span className="text-success">✓</span>
                Dark mode support
              </li>
              <li className="flex items-center gap-2">
                <span className="text-success">✓</span>
                System preference detection
              </li>
            </ul>
          </div>

          <div className="p-4 bg-surface rounded-lg border border-border">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🎨</span>
              <span className="font-medium text-text">Light UI Refresh Pack</span>
            </div>
            <p className="text-sm text-muted">
              Modern, clean interface with improved readability and visual hierarchy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

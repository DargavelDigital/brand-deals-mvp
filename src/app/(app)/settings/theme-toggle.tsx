'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'

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
    <div>
      <h2>Theme Settings</h2>
      
      <div>
        <div>
          <div>
            <h3>Theme Mode</h3>
            <p>
              Choose your preferred theme appearance.
            </p>
          </div>
          
          <div>
            {(['light', 'dark', 'system'] as Theme[]).map((themeOption) => (
              <button
                key={themeOption}
                onClick={() => applyTheme(themeOption)}
              >
                {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4>Current Theme Features:</h4>
          <ul>
            <li>Responsive design</li>
            <li>Accessibility support</li>
            <li>Custom color schemes</li>
            <li>Dark mode support</li>
            <li>System preference detection</li>
          </ul>
        </div>

        <div>
          <div>
            <span>🎨</span>
            <span>Light UI Refresh Pack</span>
          </div>
          <p>
            Modern, clean interface with improved readability and visual hierarchy.
          </p>
        </div>
      </div>
    </div>
  )
}

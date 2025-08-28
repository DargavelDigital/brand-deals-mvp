'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Card } from '@/components/ui/Card'

interface SettingsLayoutProps {
  children: ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-[var(--muted-fg)]">Manage your workspace configuration</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Settings Navigation Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <nav className="space-y-2">
              <SettingsNavLink href="/settings" label="General" />
              <SettingsNavLink href="/settings/billing" label="Billing & Subscriptions" />
              <SettingsNavLink href="/settings/ai-usage" label="AI Usage & Costs" />
              <SettingsNavLink href="/settings/demo-toggle" label="Demo Mode" />
              <SettingsNavLink href="/settings/theme-toggle" label="Theme" />
            </nav>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {children}
        </div>
      </div>
    </div>
  )
}

function SettingsNavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== '/settings' && pathname.startsWith(href))
  
  return (
    <Link
      href={href}
      className={`block px-3 py-2 rounded-md text-sm transition-colors ${
        isActive
          ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
          : 'text-[var(--muted-fg)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/10'
      }`}
    >
      {label}
    </Link>
  )
}

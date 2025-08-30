// src/app/[locale]/settings/layout.tsx
'use client';

import AppShell from '@/components/shell/AppShell';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

const items = [
  { href: '/settings', label: 'General' },
  { href: '/settings/billing', label: 'Billing & Subscriptions' },
  { href: '/settings/notifications', label: 'Notifications' },
  { href: '/settings/ai-usage', label: 'AI Usage & Costs' },
  { href: '/settings/demo-toggle', label: 'Demo Mode' },
  { href: '/settings/theme-toggle', label: 'Theme' },
  { href: '/settings/agency-access', label: 'Access Control' },
  { href: '/settings/activity', label: 'Activity' },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AppShell>
      <div className="container-page max-w-[1200px] py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="col-span-12 md:col-span-3">
            <h1 className="text-2xl font-semibold mb-4">Settings</h1>
            <p className="text-[var(--muted-fg)] mb-6">
              Manage your workspace configuration
            </p>
            <nav className="space-y-1">
              {items.map((it) => {
                const active = pathname === it.href || (it.href !== '/settings' && pathname.startsWith(it.href));
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    className={cn(
                      'block rounded-md px-3 py-2 text-sm transition-colors',
                      active
                        ? 'bg-[var(--tint-accent)] text-[var(--text)]'
                        : 'hover:bg-[var(--surface)] text-[var(--muted-fg)]'
                    )}
                  >
                    {it.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Page content */}
          <main className="col-span-12 md:col-span-9 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </AppShell>
  );
}

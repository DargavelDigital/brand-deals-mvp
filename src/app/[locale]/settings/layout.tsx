// src/app/[locale]/settings/layout.tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useLocale } from 'next-intl';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = useLocale();

  // Single source of truth for Settings sections
  const items = [
    { href: `/${locale}/settings`, label: 'General' },

    { href: `/${locale}/settings/billing`, label: 'Billing & Subscriptions' },
    { href: `/${locale}/settings/notifications`, label: 'Notifications' },
    { href: `/${locale}/settings/ai-usage`, label: 'AI Usage & Costs' },
    { href: `/${locale}/settings/ai-quality`, label: 'AI Quality' },
    { href: `/${locale}/settings/demo-toggle`, label: 'Demo Mode' },
    { href: `/${locale}/settings/theme-toggle`, label: 'Theme' },
    { href: `/${locale}/settings/agency-access`, label: 'Access Control' },
    { href: `/${locale}/settings/activity`, label: 'Activity' },
    { href: `/${locale}/settings/feature-flags`, label: 'Feature Flags' },
  ];

  return (
    // container-page gives max-width + side padding (see step 4)
    <div className="container-page py-8">
      <div className="grid grid-cols-12 gap-8">
        {/* Left settings rail */}
        <aside className="col-span-12 md:col-span-3">
          <h1 className="text-2xl font-semibold mb-2">Settings</h1>
          <p className="text-[var(--muted-fg)] mb-6">
            Manage your workspace configuration
          </p>

          <nav className="space-y-1">
            {items.map((it) => {
              const active = pathname === it.href || (it.href !== `/${locale}/settings` && pathname.startsWith(it.href));
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

        {/* Right content */}
        <main className="col-span-12 md:col-span-9 min-w-0">
          <div className="space-y-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as L from 'lucide-react'
import { NAV } from '@/config/nav'

export default function Sidebar() {
  const pathname = usePathname()
  
  return (
    <aside className="w-68 shrink-0 border-r border-[var(--border)] bg-[var(--card)]">
      <div className="p-3">
        {NAV.map((group, gi) => (
          <div key={gi} className="mb-4">
            {group.title && (
              <div className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-[var(--muted-fg)]">
                {group.title}
              </div>
            )}
            <nav className="space-y-1">
              {group.items.map((item) => {
                // @ts-ignore - Lucide icon lookup
                const Icon = (L[item.icon as keyof typeof L] ?? L.Circle) as any
                const active = pathname === item.href || pathname.startsWith(item.href + '/')
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-[10px] transition-colors ${
                      active 
                        ? 'bg-[var(--muted)] font-medium text-[var(--fg)]' 
                        : 'text-[var(--muted-fg)] hover:bg-[var(--muted)] hover:text-[var(--fg)]'
                    }`}
                  >
                    <Icon className="size-4" aria-hidden />
                    <span className="truncate">{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        ))}
      </div>
    </aside>
  )
}

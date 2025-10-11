'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as L from 'lucide-react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { NAV, NavGroup, filterNavForRole } from '@/config/nav'
import SidebarSkin from './SidebarSkin'
import { Button } from '@/components/ui/Button'
import { useTranslations, useLocale } from 'next-intl'
import { useSession } from 'next-auth/react'
import { getRole } from '@/lib/auth/hasRole'
import { isToolEnabled, isProviderEnabled } from '@/lib/launch'
import { StatusPill } from '@/components/ui/status-pill'

export default function SidebarNav() {
  const t = useTranslations()
  const locale = useLocale()
  const pathname = usePathname()
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const { data: session } = useSession()
  const role = getRole(session)

  const toggleGroup = (title: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(title)) {
        newSet.delete(title)
      } else {
        newSet.add(title)
      }
      return newSet
    })
  }

  const isGroupCollapsed = (title: string) => collapsedGroups.has(title)

  // Helper function to determine if a tool should show "Coming soon" badge
  const shouldShowComingSoon = (href: string) => {
    // Map hrefs to tool names for isToolEnabled
    const toolMap: Record<string, string> = {
      '/tools/connect': 'connect',
      '/tools/audit': 'audit', 
      '/tools/matches': 'matches',
      '/tools/approve': 'approve',
      '/tools/contacts': 'contacts',
      '/tools/pack': 'pack',
      '/tools/outreach': 'outreach',
      '/outreach/inbox': 'inbox',
      '/tools/import': 'import',
      '/tools/deal-desk': 'dealdesk',
      '/crm': 'crm'
    }
    
    const toolName = toolMap[href]
    if (!toolName) return false
    
    return !isToolEnabled(toolName as any)
  }

  return (
    <SidebarSkin>
      {NAV.map((group, groupIndex) => (
        <div key={groupIndex} className="mb-6">
          {group.title && (
                          <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wide">{group.title}</span>
              {group.collapsible && (
                <Button
                  onClick={() => toggleGroup(group.title)}
                  className="p-1 h-6 w-6"
                >
                  {isGroupCollapsed(group.title) ? (
                    <ChevronRight className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </Button>
              )}
            </div>
          )}
          
          {(!group.collapsible || !isGroupCollapsed(group.title)) && (
            <div className="px-2 space-y-1">
              {filterNavForRole(group.items, role).map((item, itemIndex) => {
                // @ts-ignore icon-by-name
                const Icon = (L[item.icon] ?? L.Circle) as any
                const active = pathname === item.href || pathname.startsWith(item.href + '/')
                
                const showComingSoon = shouldShowComingSoon(item.href)
                
                return (
                  <Link 
                    key={`${groupIndex}-${itemIndex}`} 
                    href={`/${locale}${item.href}`}
                    className={`flex h-9 items-center gap-2 rounded-md px-2.5 md:px-3 text-sm hover:bg-[var(--surface)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] transition-standard ${
                      active 
                        ? 'bg-[color:var(--accent)]/10 text-[var(--text)] border border-[var(--border)]' 
                        : 'text-[var(--muted)] hover:text-[var(--text)]'
                    } ${item.indent ? 'ml-6' : ''}`}
                  >
                    <Icon aria-hidden className="w-4 h-4 shrink-0 text-[var(--muted-fg)]" />
                    <span className="flex-1">{item.label.includes('.') ? t(item.label as any) : item.label}</span>
                    <div className="ml-auto flex items-center gap-1">
                      {showComingSoon && (
                        <StatusPill tone="neutral" className="text-xs">
                          Coming soon
                        </StatusPill>
                      )}
                      {item.badge && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </SidebarSkin>
  )
}

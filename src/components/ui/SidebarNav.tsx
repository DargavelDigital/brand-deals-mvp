'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as L from 'lucide-react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { NAV, NavGroup } from '@/config/nav'
import SidebarSkin from './SidebarSkin'
import Button from '@/components/ui/Button'
import { useLocale } from 'next-intl'
import { isToolEnabled } from '@/lib/launch'
import { StatusPill } from '@/components/ui/status-pill'

export default function SidebarNav() {
  const locale = useLocale()
  const pathname = usePathname()
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

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
        <div key={groupIndex}>
          {group.title && (
            <div>
              <span>{group.title}</span>
              {group.collapsible && (
                <Button
                  onClick={() => toggleGroup(group.title)}
                >
                  {isGroupCollapsed(group.title) ? (
                    <ChevronRight />
                  ) : (
                    <ChevronDown />
                  )}
                </Button>
              )}
            </div>
          )}
          
          {(!group.collapsible || !isGroupCollapsed(group.title)) && (
            <div>
              {group.items.map((item, itemIndex) => {
                // @ts-ignore icon-by-name
                const Icon = (L[item.icon] ?? L.Circle) as any
                const active = pathname === item.href || pathname.startsWith(item.href + '/')
                const showComingSoon = shouldShowComingSoon(item.href)
                
                return (
                  <Link 
                    key={`${groupIndex}-${itemIndex}`} 
                    href={`/${locale}${item.href}`}
                  >
                    <Icon aria-hidden />
                    <span>{item.label}</span>
                    <div className="ml-auto flex items-center gap-1">
                      {showComingSoon && (
                        <StatusPill tone="neutral" className="text-xs">
                          Coming soon
                        </StatusPill>
                      )}
                      {item.badge && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
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

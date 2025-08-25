'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as L from 'lucide-react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { NAV, NavGroup } from '@/config/nav'
import SidebarSkin from './SidebarSkin'
import { Button } from '@/components/ui/Button'

export default function SidebarNav() {
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

  return (
    <SidebarSkin>
      {NAV.map((group, groupIndex) => (
        <div key={groupIndex} className="mb-8">
          {group.title && (
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-[var(--muted)] uppercase tracking-wide">{group.title}</span>
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
              {group.items.map((item, itemIndex) => {
                // @ts-ignore icon-by-name
                const Icon = (L[item.icon] ?? L.Circle) as any
                const active = pathname === item.href || pathname.startsWith(item.href + '/')
                
                return (
                  <Link 
                    key={`${groupIndex}-${itemIndex}`} 
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-[var(--muted)] hover:bg-[color:var(--muted)]/10 hover:text-[var(--text)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] transition-standard ${
                      active 
                        ? 'bg-[color:var(--accent)]/10 text-[var(--text)] border border-[var(--border)]' 
                        : ''
                    }`}
                  >
                    <Icon aria-hidden className="h-4 w-4 flex-shrink-0" />
                    <span>{item.label}</span>
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

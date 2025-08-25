'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as L from 'lucide-react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { NAV, NavGroup } from '@/config/nav'
import SidebarSkin from './SidebarSkin'

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
        <div key={groupIndex} className="space-y-1">
          {group.title && (
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs font-medium uppercase tracking-wide text-[var(--muted-fg)]">{group.title}</span>
              {group.collapsible && (
                <button
                  onClick={() => toggleGroup(group.title)}
                  className="p-1 hover:bg-[var(--muted)] rounded transition-colors"
                >
                  {isGroupCollapsed(group.title) ? (
                    <ChevronRight className="size-3" />
                  ) : (
                    <ChevronDown className="size-3" />
                  )}
                </button>
              )}
            </div>
          )}
          
          {(!group.collapsible || !isGroupCollapsed(group.title)) && (
            <div className="space-y-1">
              {group.items.map((item, itemIndex) => {
                // @ts-ignore icon-by-name
                const Icon = (L[item.icon] ?? L.Circle) as any
                const active = pathname === item.href || pathname.startsWith(item.href + '/')
                
                return (
                  <Link 
                    key={`${groupIndex}-${itemIndex}`} 
                    href={item.href}
                    className={`nav-row ${active ? 'nav-row-active' : ''}`}
                  >
                    <Icon className="size-4" aria-hidden />
                    <span className="truncate">{item.label}</span>
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

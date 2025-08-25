'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as L from 'lucide-react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { NAV, NavGroup } from '@/config/nav'
import SidebarSkin from './SidebarSkin'
import Button from '@/components/ui/Button'

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
                
                return (
                  <Link 
                    key={`${groupIndex}-${itemIndex}`} 
                    href={item.href}
                  >
                    <Icon aria-hidden />
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

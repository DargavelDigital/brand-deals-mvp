'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as L from 'lucide-react'
import { NAV } from '@/config/nav'

export default function SidebarNav(){
  const pathname = usePathname()
  return (
    <nav className="px-3 py-4 space-y-1">
      {NAV.map(item=>{
        // @ts-ignore: icon string -> component
        const Icon = (L[item.icon] ?? L.Circle) as React.ComponentType<any>
        const active = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl border border-transparent
              ${active ? 'bg-muted font-medium border-[var(--border)]' : 'hover:bg-muted text-[var(--fg)]'}`}>
            <Icon className="size-4" aria-hidden />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

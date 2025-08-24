'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as L from 'lucide-react'
import { NAV } from '@/src/config/nav'

export default function SidebarNav(){
  const pathname = usePathname()
  return (
    <aside className="w-64 shrink-0 border-r border-[var(--border)] bg-[var(--card)]">
      <nav className="px-3 py-4 space-y-1">
        {NAV.map(i=>{
          // @ts-ignore icon-by-name
          const Icon = (L[i.icon] ?? L.Circle) as any
          const active = pathname === i.href || pathname.startsWith(i.href + '/')
          return (
            <Link key={i.href} href={i.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl border border-transparent
                ${active ? 'bg-muted font-medium border-[var(--border)]' : 'hover:bg-muted text-[var(--fg)]'}`}>
              <Icon className="size-4" aria-hidden />
              <span className="truncate">{i.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

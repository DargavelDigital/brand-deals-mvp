'use client'
import * as React from 'react'
import Link from 'next/link'
import { Plug2 } from 'lucide-react'
import { PLATFORMS, type PlatformId } from '@/config/platforms' // NOTE alias is "@/..."
import PlatformBadge from '@/components/ui/PlatformBadge'

export default function ConnectCardNew({
  connectedPlatforms = [],
}: { connectedPlatforms?: PlatformId[] }) {
  const [open, setOpen] = React.useState(false)
  const connected = new Set(connectedPlatforms)
  console.log('[ConnectCardNew] active')
  if (typeof window !== 'undefined') console.log('[ConnectCardNew] render', { connectedPlatforms })
  return (
    <div className="card p-5 md:p-6" data-testid="connect-card-new" data-probe="brand-run/connect-card-new">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xl font-semibold tracking-tight">Connect Accounts</div>
          <div className="mt-1 text-sm text-[var(--muted-fg)]">Auto-saved as you go</div>
          <div className="mt-2 inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--card)] px-2.5 py-0.5 text-[11px] text-[var(--muted-fg)]">Auto-saved</div>
        </div>
        <button type="button" className="hidden md:inline-block text-sm text-[var(--muted-fg)] hover:text-[var(--fg)] underline-offset-4 hover:underline" onClick={() => setOpen(v=>!v)}>
          Supported platforms
        </button>
      </div>
      <p className="mt-4 text-[15px] leading-6 text-[var(--muted-fg)]">
        Connect your social profiles so we can analyze your content and audience for better brand matches.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/tools/connect" className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[var(--brand-600)] px-4 text-sm font-medium text-white shadow-sm hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]">
          <Plug2 className="h-4 w-4" /> Open Connect
        </Link>
        <button className="text-sm text-[var(--muted-fg)] hover:text-[var(--fg)] underline-offset-4 hover:underline md:hidden" onClick={() => setOpen(v=>!v)}>
          Supported platforms
        </button>
      </div>
      <div className={`transition-all duration-200 ease-out overflow-hidden ${open ? 'mt-4 max-h-[480px]' : 'max-h-0'}`}>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PLATFORMS.map(p => (
            <PlatformBadge 
              key={p.id} 
              platform={p} 
              connected={connected.has(p.id)} 
            />
          ))}
        </div>
      </div>
    </div>
  )
}

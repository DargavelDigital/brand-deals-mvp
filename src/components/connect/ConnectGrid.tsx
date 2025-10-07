'use client'
import useSWR from 'swr'
import * as L from 'lucide-react'
import { PLATFORMS } from '@/config/platforms'
import type { ConnectionStatus } from '@/types/connections'
import PlatformCard from './PlatformCard'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ConnectGrid() {
  const { data, isLoading, error, mutate } =
    useSWR<ConnectionStatus[]>('/api/connections/status', fetcher, { revalidateOnFocus: false })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-6 space-y-3">
              <div className="animate-pulse h-8 w-32 rounded bg-[var(--surface)] border border-[var(--border)]" />
              <div className="animate-pulse h-4 w-24 rounded bg-[var(--surface)] border border-[var(--border)]" />
              <div className="animate-pulse h-10 w-full rounded bg-[var(--surface)] border border-[var(--border)]" />
            </div>
          ))}
        </div>
        <div className="mt-4 text-right">
          <div className="animate-pulse h-9 w-32 rounded-[10px] bg-[var(--surface)] border border-[var(--border)] inline-block" />
        </div>
      </div>
    )
  }
  if (error || !Array.isArray(data)) {
    return (
      <div className="card p-6 text-sm text-[var(--error)]">
        Could not load connection status. Please refresh.
      </div>
    )
  }

  const byId = Object.fromEntries(data.map(s => [s.platform, s] as const))

  console.log('ConnectGrid rendering platforms:', PLATFORMS.map(p => ({ id: p.id, label: p.label }))) // Debug log

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PLATFORMS.map(p => (
          <PlatformCard key={p.id} platformId={p.id} status={byId[p.id]}/>
        ))}
      </div>
      <div className="mt-4 text-right">
        <button onClick={() => mutate()} className="inline-flex items-center gap-2 h-9 px-3 rounded-[10px] border border-[var(--border)] hover:bg-[var(--muted)] text-sm">
          <L.RefreshCw className="size-4" /> Refresh status
        </button>
      </div>
    </>
  )
}

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
      <div className="card p-6 flex items-center gap-3">
        <L.Loader2 className="size-4 animate-spin" />
        <span className="text-sm text-[var(--muted-fg)]">Checking connections…</span>
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

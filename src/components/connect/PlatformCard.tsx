'use client'
import * as L from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'
import { useLocale } from 'next-intl'
import type { ConnectionStatus } from '@/types/connections'
import { PLATFORMS } from '@/config/platforms'

// minimal glyphs; reuse your existing <PlatformBadge/> icons if you prefer
function Glyph({ id }: { id: string }) {
  const map: Record<string, any> = {
    instagram: L.Instagram, tiktok: L.Music2, youtube: L.Youtube,
    x: L.Twitter, facebook: L.Facebook, linkedin: L.Linkedin, onlyfans: L.ShieldCheck
  }
  const Icon = map[id] ?? L.Globe
  return <Icon className="size-5" aria-hidden />
}

export default function PlatformCard({
  platformId,
  status,
}: {
  platformId: (typeof PLATFORMS)[number]['id']
  status: ConnectionStatus
}) {
  const locale = useLocale();
  const label = useMemo(() => PLATFORMS.find(p => p.id === platformId)?.label ?? platformId, [platformId])
  const isConn = status?.connected || false
  const isExpired = status?.status === 'expired'

  const startHref = `/api/${platformId}/auth/start`
  const disconnectHref = `/api/${platformId}/disconnect`

  return (
    <div className="card p-4 flex items-start gap-3">
      <div className="size-9 rounded-xl grid place-items-center bg-[var(--muted)] text-[var(--fg)]">
        <Glyph id={platformId} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <div className="font-medium">{label}</div>
          <span className={`text-xs rounded-full px-2 py-0.5 border ${isConn ? (isExpired ? 'text-[var(--warning)] border-[var(--warning)]' : 'text-[var(--success)] border-[var(--success)]') : 'text-[var(--muted-fg)] border-[var(--border)]'}`}>
            {isConn ? (isExpired ? 'Expired' : 'Connected') : 'Not connected'}
          </span>
        </div>
        <div className="mt-1 text-sm text-[var(--muted-fg)] truncate">
          {isConn ? (status?.username ? `@${status.username}` : 'Connected account') : 'Connect to enable audits & matching'}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {!isConn && (
            <Link href={startHref}
              className="inline-flex items-center gap-2 px-3 h-9 rounded-[10px] text-sm text-white bg-[var(--brand-600)] hover:opacity-95 shadow-sm">
              <L.Plug2 className="size-4" /> Connect
            </Link>
          )}
          {isConn && (
            <>
              {isExpired ? (
                <Link href={startHref}
                  className="inline-flex items-center gap-2 px-3 h-9 rounded-[10px] text-sm text-white bg-[var(--brand-600)] hover:opacity-95 shadow-sm">
                  <L.RefreshCw className="size-4" /> Reconnect
                </Link>
              ) : (
                <Link href={`/${locale}/tools/connect?sync=1`}
                  className="inline-flex items-center gap-2 px-3 h-9 rounded-[10px] text-sm border border-[var(--border)] rounded-[10px] hover:bg-[var(--muted)]">
                  <L.Cloud className="size-4" /> Sync
                </Link>
              )}
              <Link href={disconnectHref}
                className="inline-flex items-center gap-2 px-3 h-9 rounded-[10px] text-sm border border-[var(--border)] hover:bg-[var(--muted)]">
                <L.Unplug className="size-4" /> Disconnect
              </Link>
            </>
          )}
        </div>

        {isConn && (
          <div className="mt-2 text-[12px] text-[var(--muted-fg)] flex items-center gap-3">
            {status?.expiresAt && <span>Expires: {new Date(status.expiresAt).toLocaleDateString()}</span>}
            {status?.lastSync && <span>Last sync: {new Date(status.lastSync).toLocaleString()}</span>}
          </div>
        )}
      </div>
    </div>
  )
}

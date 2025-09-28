'use client'
import * as L from 'lucide-react'
import Link from 'next/link'
import { useMemo, useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import type { ConnectionStatus } from '@/types/connections'
import { PLATFORMS } from '@/config/platforms'
import { getBoolean } from '@/lib/clientEnv'
import { useTikTokStatus } from '@/hooks/useTikTokStatus'
import { isEnabledSocial } from '@/lib/launch'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { StatusPill } from "@/components/ui/status-pill"
import { Clock } from "lucide-react"

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
  const [isLoading, setIsLoading] = useState(false)
  const [refreshError, setRefreshError] = useState<string | null>(null)

  // Check if TikTok refresh is supported
  const tiktokRefreshSupported = getBoolean('NEXT_PUBLIC_TIKTOK_REFRESH_SUPPORTED')

  // Use TikTok-specific hook for TikTok platform
  const tiktokStatus = useTikTokStatus()

  // Check for connected=1 in URL params and refetch TikTok status
  useEffect(() => {
    if (platformId === 'tiktok' && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('connected') === '1' && urlParams.get('provider') === 'tiktok') {
        tiktokStatus.refetch()
      }
    }
  }, [platformId, tiktokStatus.refetch])

  // Use TikTok-specific status if available, otherwise fall back to general status
  const effectiveStatus = platformId === 'tiktok' ? {
    ...status,
    connected: tiktokStatus.connected
  } : status

  const effectiveIsConn = effectiveStatus?.connected || false

  // Check if this platform is enabled for the current launch phase
  const enabled = isEnabledSocial(platformId)

  const startHref = `/api/${platformId}/auth/start`
  const disconnectHref = `/api/${platformId}/disconnect`

  // TikTok-specific action handlers
  const handleTiktokDisconnect = async () => {
    if (platformId !== 'tiktok') return
    setIsLoading(true)
    setRefreshError(null)
    
    try {
      const response = await fetch('/api/tiktok/disconnect', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      const data = await response.json()
      
      if (data.ok && data.disconnected) {
        // Successfully disconnected, refetch status
        await tiktokStatus.refetch()
      } else {
        console.error('Failed to disconnect TikTok:', data.error)
      }
    } catch (error) {
      console.error('Failed to disconnect TikTok:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTiktokRefresh = async () => {
    if (platformId !== 'tiktok') return
    setIsLoading(true)
    setRefreshError(null)
    
    try {
      const response = await fetch('/api/tiktok/refresh', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      const data = await response.json()
      
      if (data.ok) {
        // Successfully refreshed, refetch status
        await tiktokStatus.refetch()
      } else if (data.error === 'REFRESH_NOT_SUPPORTED') {
        // Show non-blocking notice for sandbox mode
        setRefreshError('TikTok Sandbox doesn\'t support token refresh. Please reconnect when needed.')
      } else {
        console.error('Failed to refresh TikTok:', data.error)
      }
    } catch (error) {
      console.error('Failed to refresh TikTok:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="card p-4 flex items-start gap-3">
      <div className="size-9 rounded-xl grid place-items-center bg-[var(--muted)] text-[var(--fg)]">
        <Glyph id={platformId} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <div className="font-medium">{label}</div>
          {enabled && (
            <StatusPill 
              tone={effectiveIsConn ? (isExpired ? "warning" : "success") : "warning"}
              className="ml-2"
            >
              {effectiveIsConn ? (isExpired ? 'Expired' : 'Connected') : 'Not connected'}
            </StatusPill>
          )}
        </div>
        <div className="mt-1 text-sm text-[var(--muted-fg)] truncate">
          {!enabled ? 'Available in future updates' : effectiveIsConn ? (effectiveStatus?.username ? `@${effectiveStatus.username}` : 'Connected account') : 'Connect to enable audits & matching'}
        </div>

        {!enabled && (
          <div className="mt-2">
            <StatusPill icon={<Clock className="h-3.5 w-3.5" />} tone="neutral">
              Coming soon
            </StatusPill>
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {!enabled ? (
            <Button
              variant="outline"
              disabled
              aria-disabled={true}
              className={cn(
                "inline-flex items-center gap-2 px-3 h-9 rounded-[10px] text-sm",
                !enabled && [
                  "opacity-100",
                  "bg-transparent",
                  "hover:bg-transparent",
                  "cursor-not-allowed",
                  "text-muted-foreground",
                  "border-muted-foreground/40",
                ],
              )}
            >
              <L.Clock className="size-4" /> Coming soon
            </Button>
          ) : !effectiveIsConn ? (
            <Link href={startHref}
              className="inline-flex items-center gap-2 px-3 h-9 rounded-[10px] text-sm text-white bg-[var(--brand-600)] hover:opacity-95 shadow-sm">
              <L.Plug2 className="size-4" /> Connect
            </Link>
          ) : null}
          {enabled && effectiveIsConn && (
            <>
              {isExpired ? (
                <Link href={startHref}
                  className="inline-flex items-center gap-2 px-3 h-9 rounded-[10px] text-sm text-white bg-[var(--brand-600)] hover:opacity-95 shadow-sm">
                  <L.RefreshCw className="size-4" /> Reconnect
                </Link>
              ) : (
                <>
                  {platformId === 'tiktok' ? (
                    tiktokRefreshSupported ? (
                      <button
                        onClick={handleTiktokRefresh}
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 px-3 h-9 rounded-[10px] text-sm border border-[var(--border)] hover:bg-[var(--muted)] disabled:opacity-50">
                        <L.RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} /> 
                        {isLoading ? 'Refreshing...' : 'Refresh'}
                      </button>
                    ) : (
                      <button
                        onClick={handleTiktokRefresh}
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 px-3 h-9 rounded-[10px] text-sm border border-[var(--border)] hover:bg-[var(--muted)] disabled:opacity-50">
                        <L.RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} /> 
                        {isLoading ? 'Refreshing...' : 'Refresh'}
                      </button>
                    )
                  ) : (
                    <Link href={`/${locale}/tools/connect?sync=1`}
                      className="inline-flex items-center gap-2 px-3 h-9 rounded-[10px] text-sm border border-[var(--border)] rounded-[10px] hover:bg-[var(--muted)]">
                      <L.Cloud className="size-4" /> Sync
                    </Link>
                  )}
                </>
              )}
              {platformId === 'tiktok' ? (
                <button
                  onClick={handleTiktokDisconnect}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-3 h-9 rounded-[10px] text-sm border border-[var(--border)] hover:bg-[var(--muted)] disabled:opacity-50">
                  <L.Unplug className="size-4" /> 
                  {isLoading ? 'Disconnecting...' : 'Disconnect'}
                </button>
              ) : (
                <Link href={disconnectHref}
                  className="inline-flex items-center gap-2 px-3 h-9 rounded-[10px] text-sm border border-[var(--border)] hover:bg-[var(--muted)]">
                  <L.Unplug className="size-4" /> Disconnect
                </Link>
              )}
            </>
          )}
        </div>

        {enabled && effectiveIsConn && (
          <div className="mt-2 text-[12px] text-[var(--muted-fg)] flex items-center gap-3">
            {effectiveStatus?.expiresAt && <span>Expires: {new Date(effectiveStatus.expiresAt).toLocaleDateString()}</span>}
            {effectiveStatus?.lastSync && <span>Last sync: {new Date(effectiveStatus.lastSync).toLocaleString()}</span>}
          </div>
        )}
        
        {enabled && platformId === 'tiktok' && !tiktokRefreshSupported && (
          <div className="mt-2 text-[11px] text-[var(--muted-fg)] italic">
            TikTok Sandbox: tokens expire in ~24h; reconnect when prompted.
          </div>
        )}
        
        {enabled && platformId === 'tiktok' && refreshError && (
          <div className="mt-2 text-[11px] text-[var(--warning)] bg-[var(--warning)]/10 px-2 py-1 rounded border border-[var(--warning)]/20">
            {refreshError}
          </div>
        )}
      </div>
    </div>
  )
}

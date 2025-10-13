'use client'
import * as L from 'lucide-react'
import Link from 'next/link'
import { useMemo, useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import type { ConnectionStatus } from '@/types/connections'
import { PLATFORMS } from '@/config/platforms'
import { getBoolean } from '@/lib/clientEnv'
import { useTikTokStatus } from '@/hooks/useTikTokStatus'
import { useInstagramStatus } from '@/hooks/useInstagramStatus'
import { isProviderEnabled } from '@/lib/launch'
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
  const locale = useLocale()
  const platformConfig = useMemo(() => PLATFORMS.find(p => p.id === platformId), [platformId])
  const label = platformConfig?.label ?? platformId
  const isPlatformEnabled = platformConfig?.enabled !== false
  const isConn = status?.connected || false
  const isExpired = status?.status === 'expired'
  const [isLoading, setIsLoading] = useState(false)
  const [refreshError, setRefreshError] = useState<string | null>(null)

  // Check if TikTok refresh is supported
  const tiktokRefreshSupported = getBoolean('NEXT_PUBLIC_TIKTOK_REFRESH_SUPPORTED')

  // Use TikTok-specific hook for TikTok platform
  const tiktokStatus = useTikTokStatus()
  
  // Use Instagram-specific hook for Instagram platform
  const instagramStatus = useInstagramStatus()

  // Check for connected=1 in URL params and refetch status
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('connected') === '1') {
        if (platformId === 'tiktok' && urlParams.get('provider') === 'tiktok') {
          tiktokStatus.refetch()
        } else if (platformId === 'instagram' && urlParams.get('connected') === 'instagram') {
          instagramStatus.refetch()
        }
      }
    }
  }, [platformId, tiktokStatus.refetch, instagramStatus.refetch])

  // Use platform-specific status if available, otherwise fall back to general status
  const effectiveStatus = platformId === 'tiktok' ? {
    ...status,
    connected: tiktokStatus.connected
  } : platformId === 'instagram' ? {
    ...status,
    connected: instagramStatus.status?.connected || false
  } : status

  const effectiveIsConn = effectiveStatus?.connected || false

  // Check if this provider is enabled for the current launch phase
  const enabledProvider = isProviderEnabled(platformId as any) && isPlatformEnabled
  
  // Debug log for Instagram specifically
  if (platformId === 'instagram') {
    console.log('Instagram PlatformCard render:', {
      platformId,
      enabledProvider,
      isConn: effectiveIsConn,
      status: effectiveStatus
    }) // Debug log
  }

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

  // Instagram-specific action handlers
  const handleInstagramConnect = async () => {
    if (platformId !== 'instagram') return
    
    console.error('🔴 FRONTEND: Instagram connect clicked'); // Debug log
    
    setIsLoading(true)
    
    try {
      console.error('🔴 FRONTEND: Calling Instagram OAuth start endpoint'); // Debug log
      
      const response = await fetch('/api/instagram/auth/start', { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      console.error('🔴 FRONTEND: Instagram OAuth response status:', response.status); // Debug log
      console.error('🔴 FRONTEND: Instagram OAuth response ok:', response.ok); // Debug log
      
      if (!response.ok) {
        console.error('🔴 FRONTEND: Response not OK, status:', response.status);
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json()
      
      console.error('🔴 FRONTEND: Instagram OAuth response data:', data); // Debug log
      
      if (data.ok && data.url) {
        console.error('🔴 FRONTEND: Redirecting to Instagram OAuth URL:', data.url); // Debug log
        // Redirect to Instagram OAuth URL
        window.location.href = data.url
      } else {
        console.error('🔴 FRONTEND: Failed to start Instagram auth:', {
          data,
          error: data.error || 'No URL returned',
          configured: data.configured,
          reason: data.reason
        });
      }
    } catch (error) {
      console.error('🔴 FRONTEND: Failed to start Instagram auth:', error);
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
          {enabledProvider && (
            <StatusPill 
              tone={
                platformId === 'instagram' && instagramStatus.status ? (
                  instagramStatus.status.connected ? "success" :
                  instagramStatus.status.configured ? "warning" : "neutral"
                ) : effectiveIsConn ? (isExpired ? "warning" : "success") : "warning"
              }
              className="ml-2"
            >
              {platformId === 'instagram' && instagramStatus.status ? (
                instagramStatus.status.connected ? 'Connected' :
                instagramStatus.status.configured ? 'Not connected' : 'Setup required'
              ) : effectiveIsConn ? (isExpired ? 'Expired' : 'Connected') : 'Not connected'}
            </StatusPill>
          )}
        </div>
        <div className="mt-1 text-sm text-[var(--muted-fg)] truncate">
          {!enabledProvider ? 'Available in future updates' : 
           platformId === 'instagram' && instagramStatus.status ? (
             instagramStatus.status.connected ? 
               (effectiveStatus?.username ? `@${effectiveStatus.username}` : 'Connected account') :
               instagramStatus.status.configured ? 'Connect to enable audits & matching' :
               'Admin setup required'
           ) : effectiveIsConn ? (effectiveStatus?.username ? `@${effectiveStatus.username}` : 'Connected account') : 'Connect to enable audits & matching'}
        </div>

        {!enabledProvider && (
          <div className="mt-2">
            <StatusPill icon={<Clock className="h-3.5 w-3.5" />} tone="neutral">
              Coming soon
            </StatusPill>
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {!effectiveIsConn ? (
            enabledProvider ? (
              platformId === 'instagram' ? (
                <Button
                  variant="default"
                  onClick={handleInstagramConnect}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2"
                >
                  <L.Plug2 className="size-4" /> 
                  {isLoading ? 'Connecting...' : 'Connect'}
                </Button>
              ) : (
                <Button
                  variant="default"
                  asChild
                >
                  <Link href={startHref} className="inline-flex items-center gap-2">
                    <L.Plug2 className="size-4" /> Connect
                  </Link>
                </Button>
              )
            ) : null
          ) : null}
          {enabledProvider && effectiveIsConn && (
            <>
              {isExpired ? (
                <Link href={startHref}
                  className="inline-flex items-center gap-2 px-4 h-10 rounded-lg text-sm font-semibold text-white bg-[var(--ds-primary)] hover:bg-[var(--ds-primary-hover)] transition-colors shadow-sm">
                  <L.RefreshCw className="size-4" /> Reconnect
                </Link>
              ) : (
                <>
                  {platformId === 'tiktok' ? (
                    tiktokRefreshSupported ? (
                      <button
                        onClick={handleTiktokRefresh}
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 px-4 h-10 rounded-lg text-sm font-medium border-2 border-[var(--ds-gray-200)] hover:bg-[var(--ds-gray-50)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        <L.RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} /> 
                        {isLoading ? 'Refreshing...' : 'Refresh'}
                      </button>
                    ) : (
                      <button
                        onClick={handleTiktokRefresh}
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 px-4 h-10 rounded-lg text-sm font-medium border-2 border-[var(--ds-gray-200)] hover:bg-[var(--ds-gray-50)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        <L.RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} /> 
                        {isLoading ? 'Refreshing...' : 'Refresh'}
                      </button>
                    )
                  ) : (
                    <Link href={`/${locale}/tools/connect?sync=1`}
                      className="inline-flex items-center gap-2 px-4 h-10 rounded-lg text-sm font-medium border-2 border-[var(--ds-gray-200)] hover:bg-[var(--ds-gray-50)] transition-colors">
                      <L.Cloud className="size-4" /> Sync
                    </Link>
                  )}
                </>
              )}
              {platformId === 'tiktok' ? (
                <button
                  onClick={handleTiktokDisconnect}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-4 h-10 rounded-lg text-sm font-medium border-2 border-[var(--ds-gray-200)] hover:bg-[var(--ds-gray-50)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  <L.Unplug className="size-4" /> 
                  {isLoading ? 'Disconnecting...' : 'Disconnect'}
                </button>
              ) : (
                <Link href={disconnectHref}
                  className="inline-flex items-center gap-2 px-4 h-10 rounded-lg text-sm font-medium border-2 border-[var(--ds-gray-200)] hover:bg-[var(--ds-gray-50)] transition-colors">
                  <L.Unplug className="size-4" /> Disconnect
                </Link>
              )}
            </>
          )}
        </div>

        {enabledProvider && effectiveIsConn && (
          <div className="mt-2 text-[12px] text-[var(--muted-fg)] flex items-center gap-3">
            {effectiveStatus?.expiresAt && <span>Expires: {new Date(effectiveStatus.expiresAt).toLocaleDateString()}</span>}
            {effectiveStatus?.lastSync && <span>Last sync: {new Date(effectiveStatus.lastSync).toLocaleString()}</span>}
          </div>
        )}
        
        {enabledProvider && platformId === 'tiktok' && !tiktokRefreshSupported && (
          <div className="mt-2 text-[11px] text-[var(--muted-fg)] italic">
            TikTok Sandbox: tokens expire in ~24h; reconnect when prompted.
          </div>
        )}
        
        {enabledProvider && platformId === 'tiktok' && refreshError && (
          <div className="mt-2 text-[11px] text-[var(--warning)] bg-[var(--warning)]/10 px-2 py-1 rounded border border-[var(--warning)]/20">
            {refreshError}
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useEffect, useRef } from 'react'

interface MPTrackingProps {
  mpId: string
  isPublic?: boolean
}

export default function MPTracking({ mpId, isPublic = false }: MPTrackingProps) {
  const startTimeRef = useRef<number>(Date.now())
  const hasTrackedClose = useRef<boolean>(false)

  useEffect(() => {
    if (!isPublic || typeof window === 'undefined') return

    const trackEvent = async (event: string, data: any = {}) => {
      try {
        await fetch('/api/media-pack/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mp: mpId,
            event,
            ...data,
            referer: document.referrer || window.location.href
          })
        })
      } catch (error) {
        console.warn('Failed to track event:', error)
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden && !hasTrackedClose.current) {
        const durationMs = Date.now() - startTimeRef.current
        trackEvent('view_close', { ms: durationMs })
        hasTrackedClose.current = true
      }
    }

    const handleBeforeUnload = () => {
      if (!hasTrackedClose.current) {
        const durationMs = Date.now() - startTimeRef.current
        // Use sendBeacon for more reliable tracking on page unload
        const data = JSON.stringify({
          mp: mpId,
          event: 'view_close',
          ms: durationMs,
          referer: document.referrer || window.location.href
        })
        
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/media-pack/track', data)
        } else {
          // Fallback for older browsers
          trackEvent('view_close', { ms: durationMs })
        }
        hasTrackedClose.current = true
      }
    }

    // Track initial view
    trackEvent('view')

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [mpId, isPublic])

  return null // This component doesn't render anything
}

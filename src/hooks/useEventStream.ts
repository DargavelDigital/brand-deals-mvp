'use client'
import * as React from 'react'
import { getBoolean } from '@/lib/clientEnv'

export function useEventStream(wsId: string, onEvent?: (e:any)=>void) {
  const [connected, setConnected] = React.useState(false)

  React.useEffect(() => {
    if (!getBoolean('NEXT_PUBLIC_REALTIME')) return
    const src = new EventSource(`/api/events/stream?ws=${encodeURIComponent(wsId)}`)
    src.onopen = () => setConnected(true)
    src.onerror = () => setConnected(false)
    src.onmessage = (m) => {
      try { onEvent?.(JSON.parse(m.data)) } catch {}
    }
    return () => src.close()
  }, [wsId, onEvent])

  return { connected }
}

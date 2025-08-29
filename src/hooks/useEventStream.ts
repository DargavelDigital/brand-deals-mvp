'use client'
import * as React from 'react'

export function useEventStream(wsId: string, onEvent?: (e:any)=>void) {
  const [connected, setConnected] = React.useState(false)

  React.useEffect(() => {
    if (!process.env.NEXT_PUBLIC_REALTIME || process.env.NEXT_PUBLIC_REALTIME !== 'true') return
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

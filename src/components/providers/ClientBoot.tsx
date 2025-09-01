'use client'
import { useEffect } from 'react'
import { isOn } from '@/config/flags'
import { get } from '@/lib/clientEnv'

export default function ClientBoot() {
  useEffect(() => {
    if (!isOn('pwa.enabled')) return
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(()=>{})
    }
  }, [])

  useEffect(() => {
    if (!isOn('push.enabled')) return
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

    async function sub() {
      try {
        const reg = await navigator.serviceWorker.ready
        const existing = await reg.pushManager.getSubscription()
        if (existing) return

        const vapid = get('NEXT_PUBLIC_VAPID_PUBLIC_KEY')
        if (!vapid) return
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapid)
        })
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({
            endpoint: sub.endpoint,
            keys: sub.toJSON().keys,
            userAgent: navigator.userAgent,
            platform: navigator.platform
          })
        })
      } catch {}
    }
    sub()
  }, [])

  return null
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}

'use client'
import { useState } from 'react'

export function UpsellBanner({ kind, reason }: { kind: 'AI'|'EMAIL', reason?: string }) {
  const [loading, setLoading] = useState(false)
  const lookupKey = kind === 'AI' ? 'addon_ai_100k' : 'addon_email_100'
  const click = async () => {
    setLoading(true)
    const res = await fetch('/api/billing/checkout', { method: 'POST', body: JSON.stringify({ lookupKey }) })
    const { url } = await res.json()
    window.location.href = url
  }
  return (
    <div className="flex items-center justify-between rounded-lg border p-3 bg-[var(--tint-warn)]">
      <div className="text-sm">
        You've hit a {kind === 'AI' ? 'token' : 'daily email'} limit. Top up to continue.
      </div>
      <button onClick={click} disabled={loading} className="px-3 py-1 rounded bg-[var(--brand-600)] text-white">
        {loading ? 'Opening…' : 'Buy top-up'}
      </button>
    </div>
  )
}

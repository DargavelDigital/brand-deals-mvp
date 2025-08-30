'use client'
import { useState, useEffect } from 'react'

export function UpsellBanner({ kind, reason }: { kind: 'AI'|'EMAIL', reason?: string }) {
  const [loading, setLoading] = useState(true)
  const [buttonLoading, setButtonLoading] = useState(false)
  
  // Simulate environment/availability check
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 100)
    return () => clearTimeout(timer)
  }, [])
  
  const lookupKey = kind === 'AI' ? 'addon_ai_100k' : 'addon_email_100'
  const click = async () => {
    setButtonLoading(true)
    const res = await fetch('/api/billing/checkout', { method: 'POST', body: JSON.stringify({ lookupKey }) })
    const { url } = await res.json()
    window.location.href = url
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-between rounded-lg border p-3 bg-[var(--tint-warn)]">
        <div className="animate-pulse h-8 w-32 rounded bg-[var(--surface)] border border-[var(--border)]" />
        <div className="animate-pulse h-8 w-24 rounded bg-[var(--surface)] border border-[var(--border)]" />
      </div>
    )
  }
  
  return (
    <div className="flex items-center justify-between rounded-lg border p-3 bg-[var(--tint-warn)]">
      <div className="text-sm">
        You've hit a {kind === 'AI' ? 'token' : 'daily email'} limit. Top up to continue.
      </div>
      <button onClick={click} disabled={buttonLoading} className="px-3 py-1 rounded bg-[var(--brand-600)] text-white">
        {buttonLoading ? 'Opening…' : 'Buy top-up'}
      </button>
    </div>
  )
}

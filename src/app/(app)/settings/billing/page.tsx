'use client'
import { useEffect, useState } from 'react'

export default function BillingPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/billing/summary')
      .then(r => r.json())
      .then(setData)
      .catch(error => {
        console.error('Error fetching billing data:', error)
        setData({ error: 'network_error' })
      })
      .finally(() => setLoading(false))
  }, [])

  const openPortal = async () => {
    const r = await fetch('/api/billing/portal', { method: 'POST' })
    const { url } = await r.json()
    window.location.href = url
  }

  const buy = async (lookupKey: string) => {
    const r = await fetch('/api/billing/checkout', { method: 'POST', body: JSON.stringify({ lookupKey }) })
    const { url } = await r.json()
    window.location.href = url
  }

  if (loading) return <div className="p-6">Loading billing…</div>
  if (!data || data.error) {
    return (
      <div className="p-6 space-y-4">
        <div className="text-red-600 font-medium">Error loading billing data</div>
        <div className="text-sm text-muted-foreground">
          {data?.error === 'payment_required' 
            ? 'Please set up your billing information to continue.'
            : data?.error === 'unauthenticated'
            ? 'Please log in to view your billing information.'
            : 'Unable to load billing information. Please try again later.'
          }
        </div>
        {data?.error === 'payment_required' && (
          <button 
            className="px-4 py-2 rounded bg-[var(--brand-600)] text-white"
            onClick={openPortal}
          >
            Set Up Billing
          </button>
        )}
        {data?.error === 'unauthenticated' && (
          <div className="text-sm text-muted-foreground">
            Navigate to the dashboard first to establish a session.
          </div>
        )}
      </div>
    )
  }

  // Extract data with safe defaults
  const workspace = data.workspace || {}
  const plan = workspace.plan || 'FREE'
  const aiTokensBalance = workspace.aiTokensBalance || 0
  const emailBalance = workspace.emailBalance || 0
  const emailDailyUsed = workspace.emailDailyUsed || 0
  
  // Get limits from the data or use defaults
  const limits = data.limits || {
    aiTokensMonthly: 100_000,
    emailsPerDay: 20,
    maxContacts: 500
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded border p-4">
          <div className="text-sm text-muted-foreground">Plan</div>
          <div className="text-lg font-medium">{plan}</div>
          <button className="mt-3 px-3 py-1 rounded bg-[var(--brand-600)] text-white" onClick={openPortal}>Manage plan</button>
        </div>
        <div className="rounded border p-4">
          <div className="text-sm">AI Tokens</div>
          <div className="text-lg">{aiTokensBalance.toLocaleString()} balance</div>
          <div className="text-xs text-muted-foreground">Monthly cap: {limits.aiTokensMonthly.toLocaleString()}</div>
          <div className="mt-2 flex gap-2">
            <button className="px-3 py-1 rounded border" onClick={()=>buy('addon_ai_100k')}>+100k</button>
            <button className="px-3 py-1 rounded border" onClick={()=>buy('addon_ai_1M')}>+1M</button>
          </div>
        </div>
        <div className="rounded border p-4">
          <div className="text-sm">Emails</div>
          <div className="text-lg">{emailBalance} credits</div>
          <div className="text-xs text-muted-foreground">Daily plan limit: {limits.emailsPerDay} (used {emailDailyUsed})</div>
          <div className="mt-2 flex gap-2">
            <button className="px-3 py-1 rounded border" onClick={()=>buy('addon_email_100')}>+100</button>
            <button className="px-3 py-1 rounded border" onClick={()=>buy('addon_email_1000')}>+1000</button>
          </div>
        </div>
      </div>
    </div>
  )
}

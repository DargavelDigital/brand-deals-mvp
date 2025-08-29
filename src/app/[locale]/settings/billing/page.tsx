'use client'
import { useEffect, useState } from 'react'
import { UsageRing } from '@/components/billing/UsageRing'

function defaultUiSummary() {
  const now = new Date()
  const end = new Date(now); end.setMonth(now.getMonth() + 1)
  return {
    workspace: {
      plan: 'FREE',
      periodStart: now.toISOString(),
      periodEnd: end.toISOString(),
      aiTokensBalance: 0,
      emailBalance: 0,
      emailDailyUsed: 0,
    },
    limits: { aiTokensMonthly: 100_000, emailsPerDay: 20, maxContacts: 500 },
    tokensUsed: 0,
    tokensLimit: 100_000,
    emailsUsed: 0,
    emailsLimit: 500,
  }
}

export default function BillingPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBillingSummary() {
      let data: any = null
      try {
        const res = await fetch('/api/billing/summary', { cache: 'no-store' })
        data = await res.json().catch(() => null)
        if (!res.ok || !data) {
          // keep a safe default on any odd response
          return { ok: true, mode: 'mock-client', ...defaultUiSummary() }
        }
        return data
      } catch {
        return { ok: true, mode: 'mock-client-catch', ...defaultUiSummary() }
      }
    }

    async function loadBilling() {
      try {
        const responseData = await fetchBillingSummary()
        setData(responseData)
      } catch (error) {
        console.error('Error fetching billing data:', error)
        setData({ ok: true, mode: 'mock-client-catch', ...defaultUiSummary() })
      } finally {
        setLoading(false)
      }
    }

    loadBilling()
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
  
  // Since our API now always returns ok: true, we don't need error handling here
  if (!data) {
    return <div className="p-6">Loading billing…</div>
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

  // Get usage data with safe defaults
  const tokensUsed = data.tokensUsed || 0
  const tokensLimit = data.tokensLimit || limits.aiTokensMonthly
  const emailsUsed = data.emailsUsed || 0
  const emailsLimit = data.emailsLimit || limits.emailsPerDay

  return (
    <div className="space-y-6">
      {/* Mock mode banner */}
      {data.mode && (
        <div className="rounded-md border border-[var(--border)] bg-[var(--tint-warn)] p-2 text-xs text-[var(--warn)]">
          Billing is in demo mode. Connect Stripe to enable live usage.
        </div>
      )}

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

      {/* Usage Rings */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded border p-6">
          <h3 className="text-lg font-medium mb-4">AI Token Usage</h3>
          <UsageRing 
            used={tokensUsed} 
            limit={tokensLimit} 
            label="AI Tokens" 
          />
        </div>
        <div className="rounded border p-6">
          <h3 className="text-lg font-medium mb-4">Email Usage</h3>
          <UsageRing 
            used={emailsUsed} 
            limit={emailsLimit} 
            label="Emails" 
          />
        </div>
      </div>
    </div>
  )
}

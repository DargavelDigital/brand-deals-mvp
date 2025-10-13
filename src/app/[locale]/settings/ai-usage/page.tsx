'use client'
import * as React from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProgressBeacon } from '@/components/ui/ProgressBeacon'

export default function AiUsagePage() {
  const [data, setData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(false)
  // TODO: Get from session instead of hardcoded
  const wsId = null // Placeholder - should derive from session

  async function load() {
    setLoading(true)
    try {
      const r = await fetch(`/api/ai/usage?workspaceId=${wsId}`)
      const j = await r.json()
      setData(j)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { load() }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">AI Token & Cost Usage</h1>
        <Button onClick={load} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {data && (
        <>
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-[var(--muted-fg)]">Input tokens</div>
                <div className="text-xl font-semibold">{data.totals.inputTokens.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-[var(--muted-fg)]">Output tokens</div>
                <div className="text-xl font-semibold">{data.totals.outputTokens.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-[var(--muted-fg)]">Total cost (USD)</div>
                <div className="text-xl font-semibold">${data.totals.totalCostUsd.toFixed(4)}</div>
              </div>
            </div>
          </Card>

          <Card className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--surface)]">
                <tr>
                  <th className="text-left p-3">When</th>
                  <th className="text-left p-3">Pack</th>
                  <th className="text-left p-3">Model</th>
                  <th className="text-right p-3">In</th>
                  <th className="text-right p-3">Out</th>
                  <th className="text-right p-3">Cost</th>
                  <th className="text-left p-3">Trace</th>
                  <th className="text-left p-3">Mode</th>
                </tr>
              </thead>
              <tbody>
                {data.events.map((e: any) => (
                  <tr key={e.id} className="border-t border-[var(--border)]">
                    <td className="p-3">{new Date(e.createdAt).toLocaleString()}</td>
                    <td className="p-3">{e.packKey}</td>
                    <td className="p-3">{e.model}</td>
                    <td className="p-3 text-right">{e.inputTokens}</td>
                    <td className="p-3 text-right">{e.outputTokens}</td>
                    <td className="p-3 text-right">${e.totalCostUsd.toFixed(4)}</td>
                    <td className="p-3 font-mono text-xs">{e.traceId.slice(0, 8)}...</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${e.dryRun ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {e.dryRun ? 'DRY' : 'LIVE'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}

      {!data && !loading && (
        <Card className="p-8 text-center">
          <p className="text-[var(--muted-fg)]">No usage data available</p>
        </Card>
      )}

      {loading && (
        <Card className="p-8 text-center">
          <ProgressBeacon label="Loading usage data..." />
        </Card>
      )}
    </div>
  )
}

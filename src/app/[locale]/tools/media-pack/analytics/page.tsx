'use client'
import { useEffect, useState, use } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { safeJson } from '@/lib/http/safeJson'

export default function MediaPackAnalyticsPage({ searchParams }: any) {
  const mediaPackId = use(searchParams)?.id
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const { ok, body } = await safeJson(`/api/media-pack/analytics?mediaPackId=${mediaPackId}`)
      setData(ok ? body : null)
      setLoading(false)
    })()
  }, [mediaPackId])

  if (loading) return <div className="p-6">Loading…</div>
  if (!data?.ok) return <div className="p-6 text-red-600">Failed to load analytics.</div>

  const f = data.summary || { views:0, clicks:0, conversions:0, ctr:0, cvr:0 }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Media Pack Conversion</h1>
        <Button href={`/tools/media-pack?id=${mediaPackId}`}>Back to Pack</Button>
      </div>

      {/* Funnel */}
      <Card className="p-6">
        <h2 className="font-medium mb-4">Funnel</h2>
        <div className="grid grid-cols-3 gap-4">
          <Stat label="Views" value={f.views}/>
          <Stat label="Clicks" value={f.clicks} sub={`CTR ${(f.ctr*100).toFixed(1)}%`}/>
          <Stat label="Booked Calls" value={f.conversions} sub={`CVR ${(f.cvr*100).toFixed(1)}%`}/>
        </div>
      </Card>

      {/* Variant performance */}
      <Card className="p-6">
        <h2 className="font-medium mb-4">Variant Comparison</h2>
        <div className="text-center text-[var(--muted-fg)] py-8">
          {data.variants.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-4">
              {data.variants.map((v:any)=>(
                <div key={v.variant} className="rounded-lg border p-4">
                  <div className="text-sm text-[var(--muted-fg)]">Variant {v.variant}</div>
                  <div className="mt-2 text-lg font-semibold">{v.conversions} conversions</div>
                  <div className="text-sm">Views {v.views} · CTR {(v.ctr*100).toFixed(1)}% · CVR {(v.cvr*100).toFixed(1)}%</div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <p>No variant data available yet.</p>
              <p className="text-sm mt-2">Data will appear here once you start tracking media pack views and conversions.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Time series */}
      <Card className="p-6">
        <h2 className="font-medium mb-4">Daily Trend</h2>
        <div className="h-72">
          <div className="text-center text-[var(--muted-fg)] py-12">
            {data.series.length > 0 ? (
              <div>
                <p>Chart component would go here (using recharts or similar)</p>
                <p className="text-sm mt-2">Showing {data.series.length} data points</p>
              </div>
            ) : (
              <div>
                <p>No time series data available yet.</p>
                <p className="text-sm mt-2">Daily aggregates will appear here once the rollup job runs.</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

function Stat({label,value,sub}:{label:string,value:number,sub?:string}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="text-sm text-[var(--muted-fg)]">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
      {sub && <div className="text-sm text-[var(--muted-fg)]">{sub}</div>}
    </div>
  )
}

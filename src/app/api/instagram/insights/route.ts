import { NextResponse } from 'next/server'
import { log } from '@/lib/logger'
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo'
import { getInstagramAccount, fetchAccountInsights } from '@/services/instagram/graph'

export async function GET(req: Request) {
  try {
    // Get current workspace ID
    let workspaceId: string
    try {
      const { workspaceId: wsid } = await requireSessionOrDemo(req)
      workspaceId = wsid
    } catch (e) {
      log.warn({ e }, '[instagram/insights] failed to get workspace ID')
      return NextResponse.json({ ok: false, error: 'NOT_AUTHENTICATED' }, { status: 401 })
    }

    // Get Instagram account for current workspace
    const account = await getInstagramAccount()
    if (!account) {
      log.debug({ workspaceId }, '[instagram/insights] no Instagram connection found')
      return NextResponse.json({ 
        ok: false, 
        connected: false,
        error: 'NOT_CONNECTED'
      })
    }

    // Parse query parameters
    const url = new URL(req.url)
    const range = url.searchParams.get('range') || '30d'
    
    // Calculate date range
    const today = new Date()
    const until = today.toISOString().split('T')[0] // YYYY-MM-DD format
    
    let daysBack: number
    switch (range) {
      case '7d':
        daysBack = 7
        break
      case '30d':
        daysBack = 30
        break
      case '90d':
        daysBack = 90
        break
      default:
        daysBack = 30
    }
    
    const sinceDate = new Date(today)
    sinceDate.setDate(today.getDate() - daysBack)
    const since = sinceDate.toISOString().split('T')[0] // YYYY-MM-DD format

    // Fetch account insights
    try {
      const result = await fetchAccountInsights(account.igUserId, account.token, { since, until })
      
      // Process insights data into totals and series
      const totals: Record<string, number> = {}
      const series: Array<{ date: string; metrics: Record<string, number> }> = []
      
      // Group insights by metric name
      const insightsByMetric: Record<string, any[]> = {}
      result.data.forEach(insight => {
        if (!insightsByMetric[insight.name]) {
          insightsByMetric[insight.name] = []
        }
        insightsByMetric[insight.name].push(insight)
      })
      
      // Calculate totals and build series
      Object.entries(insightsByMetric).forEach(([metricName, insights]) => {
        let total = 0
        const dailyValues: Record<string, number> = {}
        
        insights.forEach(insight => {
          insight.values.forEach(value => {
            const date = value.end_time.split('T')[0]
            const val = typeof value.value === 'object' 
              ? Object.values(value.value).reduce((sum: number, v: any) => sum + (typeof v === 'number' ? v : 0), 0)
              : (typeof value.value === 'number' ? value.value : 0)
            
            total += val
            dailyValues[date] = (dailyValues[date] || 0) + val
          })
        })
        
        totals[metricName] = total
        
        // Add to series
        Object.entries(dailyValues).forEach(([date, value]) => {
          let dayData = series.find(s => s.date === date)
          if (!dayData) {
            dayData = { date, metrics: {} }
            series.push(dayData)
          }
          dayData.metrics[metricName] = value
        })
      })
      
      // Sort series by date
      series.sort((a, b) => a.date.localeCompare(b.date))
      
      log.info({ 
        workspaceId, 
        igUserId: account.igUserId,
        range,
        since,
        until,
        metricsCount: result.data.length,
        seriesLength: series.length
      }, '[instagram/insights] account insights fetched and processed successfully')

      return NextResponse.json({
        ok: true,
        range,
        totals,
        series
      })
    } catch (error) {
      log.error({ error, workspaceId, igUserId: account.igUserId }, '[instagram/insights] failed to fetch account insights')
      return NextResponse.json({ 
        ok: false, 
        error: 'INSIGHTS_FETCH_FAILED' 
      }, { status: 500 })
    }

  } catch (err) {
    log.error({ err }, '[instagram/insights] unhandled error')
    return NextResponse.json({ ok: false, error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}

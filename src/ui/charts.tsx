'use client'

interface ChartProps {
  data: Array<{
    name: string
    value: number
    color?: string
  }>
  height?: number
}

export function LineChartComponent({ data, height = 300 }: ChartProps) {
  return (
    <div style={{ height }} className="w-full">
      <div className="text-center text-[var(--muted-fg)] py-8">
        Line charts temporarily disabled due to bundling issues
      </div>
    </div>
  )
}

export function BarChartComponent({ data, height = 300 }: ChartProps) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height }} className="w-full flex items-center justify-center">
        <div className="text-[var(--muted-fg)]">No data available</div>
      </div>
    )
  }

  const maxValue = Math.max(...data.map(item => item.value))
  
  return (
    <div style={{ height }} className="w-full p-4">
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-[var(--fg)]">{item.name}</span>
              <span className="text-[var(--muted-fg)]">{item.value.toLocaleString()}</span>
            </div>
            <div className="w-full bg-[var(--muted)]/20 rounded-full h-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
                  backgroundColor: item.color || 'var(--accent)'
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AreaChartComponent({ data, height = 300 }: ChartProps) {
  return (
    <div style={{ height }} className="w-full">
      <div className="text-center text-[var(--muted-fg)] py-8">
        Area charts temporarily disabled due to bundling issues
      </div>
    </div>
  )
}

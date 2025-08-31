'use client'

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ChartProps {
  data: any[]
  height?: number
}

export function LineChartComponent({ data, height = 300 }: ChartProps) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="name" className="text-muted" />
          <YAxis className="text-muted" />
          <Tooltip className="bg-surface border border-border rounded-lg shadow-lg" />
          <Line type="monotone" dataKey="value" stroke="var(--accent)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function BarChartComponent({ data, height = 300 }: ChartProps) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="name" className="text-muted" />
          <YAxis className="text-muted" />
          <Tooltip className="bg-surface border border-border rounded-lg shadow-lg" />
          <Bar dataKey="value" fill="var(--accent)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function AreaChartComponent({ data, height = 300 }: ChartProps) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="name" className="text-muted" />
          <YAxis className="text-muted" />
          <Tooltip className="bg-surface border border-border rounded-lg shadow-lg" />
          <Line type="monotone" dataKey="value" stroke="var(--accent)" fill="var(--accent)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

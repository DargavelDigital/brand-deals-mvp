import React from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface ChartDataPoint {
  name: string;
  value: number;
}

interface MinimalAreaChartProps {
  data: ChartDataPoint[];
  height?: number;
  showLegend?: boolean;
  className?: string;
}

export function MinimalAreaChart({ 
  data, 
  height = 320, 
  showLegend = false,
  className = '' 
}: MinimalAreaChartProps) {
  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--brand)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--brand)" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: 'var(--muted)' }}
            tickMargin={8}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: 'var(--muted)' }}
            tickMargin={8}
          />
          
          <Tooltip 
            contentStyle={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text)'
            }}
            labelStyle={{ color: 'var(--muted)' }}
          />
          
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--brand)"
            strokeWidth={2}
            fill="url(#colorValue)"
            fillOpacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Optional legend - auto-hides on small screens */}
      {showLegend && (
        <div className="hidden md:flex items-center justify-center mt-4 space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-md bg-[var(--brand-600)]"></div>
            <span className="text-sm text-[var(--muted-fg)]">Value</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Additional chart components can be added here
export function MinimalBarChart({ 
  data, 
  height = 320,
  className = '' 
}: MinimalAreaChartProps) {
  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: 'var(--muted)' }}
            tickMargin={8}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: 'var(--muted)' }}
            tickMargin={8}
          />
          
          <Tooltip 
            contentStyle={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text)'
            }}
            labelStyle={{ color: 'var(--muted)' }}
          />
          
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--brand-600)"
            strokeWidth={2}
            fill="var(--brand-600)"
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

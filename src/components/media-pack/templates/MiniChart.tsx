import React from 'react';

interface MiniChartProps {
  data: Array<{
    label: string;
    value: number; // 0..1
  }>;
  type?: 'bar' | 'waffle';
  maxItems?: number;
  className?: string;
}

export default function MiniChart({ data, type = 'bar', maxItems = 5, className = '' }: MiniChartProps) {
  const displayData = data.slice(0, maxItems);
  const maxValue = Math.max(...displayData.map(d => d.value));

  if (type === 'waffle') {
    return (
      <div className={`space-y-2 ${className}`}>
        {displayData.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-16 text-sm text-[var(--muted)] truncate">{item.label}</div>
            <div className="flex-1 flex gap-1">
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-sm ${
                    i < Math.round(item.value * 10) 
                      ? 'bg-[var(--brand-600)]' 
                      : 'bg-[var(--border)]'
                  }`}
                />
              ))}
            </div>
            <div className="w-12 text-sm text-[var(--muted)] text-right">
              {Math.round(item.value * 100)}%
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Bar chart
  return (
    <div className={`space-y-2 ${className}`}>
      {displayData.map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="w-16 text-sm text-[var(--muted)] truncate">{item.label}</div>
          <div className="flex-1 bg-[var(--border)] rounded-full h-2">
            <div
              className="bg-[var(--brand-600)] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
          <div className="w-12 text-sm text-[var(--muted)] text-right">
            {Math.round(item.value * 100)}%
          </div>
        </div>
      ))}
    </div>
  );
}

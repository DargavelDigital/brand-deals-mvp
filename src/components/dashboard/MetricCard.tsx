import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  delta?: {
    value: number;
    isPositive: boolean;
  };
  badge?: {
    text: string;
    tone: 'blue' | 'green' | 'purple' | 'orange' | 'neutral';
  };
  className?: string;
}

export function MetricCard({ label, value, delta, badge, className = '' }: MetricCardProps) {
  const getBadgeColors = (tone: string) => {
    switch (tone) {
      case 'blue':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'green':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'purple':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'orange':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <div className={`bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-none">
          <p className="text-[var(--muted)] text-sm font-medium mb-2">{label}</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl md:text-4xl font-bold text-[var(--text)] font-variant-numeric-tabular-nums">
              {value}
            </span>
            {delta && (
              <span className={`text-sm font-medium ${
                delta.isPositive ? 'text-[var(--positive)]' : 'text-[var(--danger)]'
              }`}>
                {delta.isPositive ? '+' : ''}{delta.value}%
              </span>
            )}
          </div>
        </div>
        
        {badge && (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-medium ${getBadgeColors(badge.tone)}`}>
            {badge.text}
          </div>
        )}
      </div>
    </div>
  );
}

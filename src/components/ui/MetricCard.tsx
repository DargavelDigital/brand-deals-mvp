import { ReactNode } from 'react'

export default function MetricCard({ 
  label, 
  value, 
  delta, 
  icon 
}: { 
  label: string
  value: string
  delta?: string
  icon?: ReactNode 
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-[var(--muted-fg)]">{label}</div>
        {icon && (
          <div className="size-8 rounded-lg grid place-items-center bg-[var(--muted)] text-[var(--brand-600)]">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {delta && (
        <div className="mt-1 text-xs text-[var(--success)]">▲ {delta}</div>
      )}
    </div>
  )
}

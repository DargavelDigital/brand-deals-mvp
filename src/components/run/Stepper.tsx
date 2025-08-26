'use client'
import { ORDER, stepIndex } from '@/services/brand-run/types'

export default function Stepper({ step }:{ step: string }){
  const idx = stepIndex(step as any)
  return (
    <div className="card p-4">
      <div className="text-sm font-medium mb-3">Brand Run Progress</div>

      {/* Row of dots that wraps on small screens */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 min-w-0">
        {ORDER.map((s, i)=>(
          <div key={s} className="flex items-center gap-3">
            <div className={`size-3 rounded-full ${i<=idx ? 'bg-[var(--brand-600)]' : 'bg-[var(--border)]'}`} />
            {i < ORDER.length-1 && (
              <div className="h-[2px] w-16 sm:w-20 md:w-24 bg-[var(--border)]">
                <div className="h-[2px] bg-[var(--brand-600)]" style={{ width: i<idx ? '100%' : i===idx ? '50%' : '0%' }} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-2 text-xs text-[var(--muted-fg)]">{idx+1} of {ORDER.length}</div>
    </div>
  )
}

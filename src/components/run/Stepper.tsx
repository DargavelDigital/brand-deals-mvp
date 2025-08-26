'use client'
import { ORDER, stepIndex } from '@/services/brand-run/types'

export default function Stepper({ step }:{ step: string }){
  const idx = stepIndex(step as any)
  return (
    <div className="card p-4">
      <div className="text-sm font-medium mb-2">Brand Run Progress</div>
      <div className="flex items-center gap-2">
        {ORDER.map((s, i)=>(
          <div key={s} className="flex items-center gap-2">
            <div className={`size-3 rounded-full ${i<=idx ? 'bg-[var(--brand-600)]' : 'bg-[var(--border)]'}`} />
            {i < ORDER.length-1 && (
              <div className="h-[2px] w-20 bg-[var(--border)]">
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

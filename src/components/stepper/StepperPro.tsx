'use client'
import * as L from 'lucide-react'
import clsx from 'clsx'

type Step = { id: string; label: string; icon?: string }

export default function StepperPro({ steps, current }:{ steps: Step[]; current: string }){
  const currentIdx = Math.max(0, steps.findIndex(s=>s.id===current))
  
  return (
    <div className="card p-4">
      <ol className="flex items-center gap-4 overflow-x-auto" aria-label="Brand Run progress">
        {steps.map((s, i) => {
          const state: 'done'|'current'|'next' = i < currentIdx ? 'done' : i === currentIdx ? 'current' : 'next'
          // choose icon (fallback: Dot)
          // @ts-expect-error icon-by-name
          const Icon = (L[s.icon as keyof typeof L ?? 'Dot'] ?? L.Dot)
          
          return (
            <li key={s.id} className="flex items-center gap-3 min-w-max">
              <div className={clsx(
                'size-8 rounded-full grid place-items-center border',
                state==='done' && 'bg-[var(--brand-600)] text-white border-transparent',
                state==='current' && 'bg-[var(--card)] text-[var(--fg)] border-[var(--ring)]',
                state==='next' && 'bg-[var(--muted)] text-[var(--muted-fg)] border-[var(--border)]'
              )}>
                <Icon className="size-4" aria-hidden />
              </div>
              <div className="text-sm">
                <div className={clsx('font-medium', state==='next' && 'text-[var(--muted-fg)]')}>{s.label}</div>
                <div className="hidden sm:block text-xs text-[var(--muted-fg)]">
                  {state==='done' ? 'Completed' : state==='current' ? 'In progress' : 'Up next'}
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className={clsx('h-px w-10 sm:w-16 mx-2',
                  state==='done' ? 'bg-[var(--brand-600)]' : 'bg-[var(--border)]')}/>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

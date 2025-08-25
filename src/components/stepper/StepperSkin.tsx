'use client'

import clsx from 'clsx'

export default function StepperSkin({ steps, currentIndex }:{ 
  steps:{label:string}[]; 
  currentIndex:number 
}){
  return (
    <div className="card p-4">
      <ol className="flex items-center gap-4 overflow-x-auto">
        {steps.map((s, i)=>(
          <li key={i} className="flex items-center gap-3 min-w-max">
            <div className={clsx(
              'size-3 rounded-full',
              i<=currentIndex ? 'bg-[var(--brand-600)]' : 'bg-[var(--border)]'
            )}/>
            <div className={clsx('text-sm', i>currentIndex && 'text-[var(--muted-fg)]')}>{s.label}</div>
            {i<steps.length-1 && <div className="h-px w-10 sm:w-16 bg-[var(--border)]" />}
          </li>
        ))}
      </ol>
    </div>
  )
}

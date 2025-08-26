'use client'
import { advance } from '@/services/brand-run/api'
import { useTransition } from 'react'

export default function BottomBar(){
  const [pending, start] = useTransition()
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
      <div className="mx-auto max-w-[1200px] px-4 pb-4">
        <div className="card p-2">
          <button
            onClick={()=>start(async()=>{ await advance(); location.href='/brand-run' })}
            disabled={pending}
            className="w-full h-12 rounded-md bg-[var(--brand-600)] text-white disabled:opacity-60">
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

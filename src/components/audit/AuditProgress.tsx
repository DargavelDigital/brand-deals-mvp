'use client'
import * as React from 'react'

export default function AuditProgress(){
  return (
    <div className="card p-5">
      <div className="text-sm font-medium mb-2">Audit in progress</div>
      <div className="h-2 w-full rounded-full bg-[var(--muted)] overflow-hidden">
        <div className="h-full w-1/2 animate-[pulse_1.2s_ease_infinite] bg-[var(--brand-600)]/70 rounded-full" />
      </div>
      <div className="mt-3 text-sm text-[var(--muted-fg)]">Collecting signals, crunching metrics, and generating insights…</div>
    </div>
  )
}

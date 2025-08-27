'use client'
import * as React from 'react'
import type { OutreachSequence } from './SequenceBuilder'

export default function SequencePreview({
  sequence, contactCount, brandId, mediaPackId
}:{ sequence:OutreachSequence; contactCount:number; brandId:string; mediaPackId?:string }){
  return (
    <div className="card p-5">
      <div className="text-lg font-semibold mb-3">Preview</div>
      <div className="text-sm text-[var(--muted-fg)] mb-3">
        {contactCount} recipients • {sequence.steps.length} steps {brandId ? `• Brand ${brandId.slice(0,6)}` : ''} {mediaPackId ? `• Media Pack ${mediaPackId.slice(0,6)}` : ''}
      </div>
      <div className="space-y-3">
        {sequence.steps.map((s, i)=>(
          <div key={s.id} className="rounded-lg border border-[var(--border)] p-3 bg-[var(--card)]">
            <div className="text-sm mb-1"><span className="font-medium">Step {i+1}:</span> {s.name}</div>
            <div className="text-sm">Subject: <span className="font-medium">{s.subject || '(no subject yet)'}</span></div>
            <div className="text-xs text-[var(--muted-fg)]">Delay: {s.delay} {s.delayUnit}</div>
          </div>
        ))}
        {!sequence.steps.length && <div className="text-[var(--muted-fg)] text-sm">Nothing to preview yet.</div>}
      </div>
    </div>
  )
}

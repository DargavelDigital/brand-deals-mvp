'use client'
import * as React from 'react'
import type { OutreachSequence } from './SequenceBuilder'
import AiFeedbackButtons from '@/components/feedback/AiFeedbackButtons'
import AdaptiveBadge from '@/components/ui/AdaptiveBadge'

export default function SequencePreview({
  sequence, 
  contactCount, 
  brandId, 
  mediaPackId,
  tone,
  brevity
}:{ 
  sequence:OutreachSequence; 
  contactCount:number; 
  brandId:string; 
  mediaPackId?:string;
  tone?: 'professional' | 'relaxed' | 'fun';
  brevity?: 'short' | 'medium' | 'detailed';
}){
  return (
    <div className="card p-5">
      <div className="text-lg font-semibold mb-3">Preview</div>
      <div className="text-sm text-[var(--muted-fg)] mb-3">
        {contactCount} recipients • {sequence.steps.length} steps {brandId ? `• Brand ${brandId.slice(0,6)}` : ''} {mediaPackId ? `• Media Pack ${mediaPackId.slice(0,6)}` : ''}
        {tone && brevity && (
          <> • <span className="font-medium">{tone}</span> tone • <span className="font-medium">{brevity}</span> detail</>
        )}
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
      
      {/* AI Feedback Integration */}
      {sequence.steps.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[var(--border)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[var(--muted-fg)]">How was this sequence?</span>
            <AdaptiveBadge />
          </div>
          <AiFeedbackButtons 
            type="OUTREACH" 
            targetId={`sequence_${sequence.name.replace(/\s+/g, '_').toLowerCase()}`}
            className="justify-start"
          />
        </div>
      )}
    </div>
  )
}

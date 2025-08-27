'use client'
import * as React from 'react'
import ContactPicker from './pieces/ContactPicker'
import BrandPicker from './pieces/BrandPicker'
import MediaPackPicker from './pieces/MediaPackPicker'
import SequenceBuilder, { type OutreachSequence } from './pieces/SequenceBuilder'
import SequencePreview from './pieces/SequencePreview'
import useOutreachSequence from './useOutreachSequence'

export default function OutreachPage(){
  const [contactIds, setContactIds] = React.useState<string[]>([])
  const [brandId, setBrandId] = React.useState<string>('')
  const [mediaPackId, setMediaPackId] = React.useState<string>('')

  const [sequence, setSequence] = React.useState<OutreachSequence>({
    name: 'New Sequence',
    steps: [],
    settings: { pauseFirstSend: false, replyDetection: true, autoFollowUp: true }
  })

  const canStart = contactIds.length>0 && brandId && sequence.steps.length>0
  const { startSequence, isStarting, error, okToast } = useOutreachSequence()

  const onStart = async () => {
    await startSequence({
      workspaceId: 'demo-workspace', // replace with real
      brandId,
      mediaPackId: mediaPackId || undefined,
      contactIds,
      sequence,
      pauseFirstSend: sequence.settings.pauseFirstSend
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Start Outreach</h1>
        <p className="text-[var(--muted-fg)]">Create and launch multi-step sequences to your selected contacts.</p>
      </div>

      {error && <div className="card p-4 border-[var(--error)] bg-[var(--tint-error)] text-[var(--error)] text-sm">{error}</div>}
      {okToast && <div className="card p-3 text-sm bg-[var(--tint-success)] text-[var(--success)]">{okToast}</div>}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT: pickers */}
        <div className="space-y-6">
          <ContactPicker selected={contactIds} onChange={setContactIds}/>
          <BrandPicker value={brandId} onChange={setBrandId}/>
          <MediaPackPicker value={mediaPackId} onChange={setMediaPackId}/>
        </div>

        {/* RIGHT: builder + preview */}
        <div className="space-y-6">
          <SequenceBuilder value={sequence} onChange={setSequence}/>
          <SequencePreview
            sequence={sequence}
            contactCount={contactIds.length}
            brandId={brandId}
            mediaPackId={mediaPackId}
          />
        </div>
      </div>

      <div className="card p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="text-sm text-[var(--muted-fg)]">
          <span className="font-medium">{contactIds.length}</span> contacts • <span className="font-medium">{sequence.steps.length}</span> steps
        </div>
        <div className="flex gap-2">
          <button className="h-10 px-4 rounded-md border border-[var(--border)] bg-[var(--card)]">Save Draft</button>
          <button
            onClick={onStart}
            disabled={!canStart || isStarting}
            className="h-10 px-4 rounded-[10px] bg-[var(--brand-600)] text-white disabled:opacity-60"
          >
            {isStarting ? 'Starting…' : 'Start Sequence'}
          </button>
        </div>
      </div>
    </div>
  )
}

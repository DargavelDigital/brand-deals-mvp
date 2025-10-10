'use client'
import * as React from 'react'
import ContactPicker from './pieces/ContactPicker'
import BrandPicker from './pieces/BrandPicker'
import MediaPackPicker from './pieces/MediaPackPicker'
import SequenceBuilder, { type OutreachSequence } from './pieces/SequenceBuilder'
import SequencePreview from './pieces/SequencePreview'
import OutreachAnalytics from './OutreachAnalytics'
import useOutreachSequence from './useOutreachSequence'
import { Select } from '@/components/ui/Select'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { flags } from '@/config/flags'
import { ProgressBeacon } from '@/components/ui/ProgressBeacon'
import { toast } from '@/hooks/useToast'
import { Button } from '@/components/ui/Button'
import { useLocale } from 'next-intl'
import { WorkflowProgress } from '@/components/ui/WorkflowProgress'

export default function OutreachPage(){
  const locale = useLocale();
  const [contactIds, setContactIds] = React.useState<string[]>([])
  const [brandId, setBrandId] = React.useState<string>('')
  const [mediaPackId, setMediaPackId] = React.useState<string>('')
  const [tone, setTone] = React.useState<'professional' | 'relaxed' | 'fun'>('professional')
  const [brevity, setBrevity] = React.useState<'short' | 'medium' | 'detailed'>('medium')
  const [activeTab, setActiveTab] = React.useState<'outreach' | 'analytics'>('outreach')

  const [sequence, setSequence] = React.useState<OutreachSequence>({
    name: 'New Sequence',
    steps: [],
    settings: {
      pauseFirstSend: false,
      replyDetection: true,
      autoFollowUp: true
    }
  })

  const canStart = contactIds.length > 0 && brandId && sequence.steps.length > 0
  const { startSequence, isStarting, error, okToast } = useOutreachSequence()

  const onStart = async () => {
    await startSequence({
      workspaceId: 'demo-workspace', // replace with real
      brandId,
      mediaPackId: mediaPackId || undefined,
      contactIds,
      sequence,
      pauseFirstSend: sequence.settings.pauseFirstSend,
      tone, // Added for Epic 1
      brevity // Added for Epic 1
    })
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: 'Tools', href: `/${locale}/tools` },
        { label: 'Start Outreach' }
      ]} />
      
      {/* NEW: Workflow progress indicator */}
      <WorkflowProgress 
        currentStep={5} 
        steps={['Connect', 'Audit', 'Matches', 'Contacts', 'Pack', 'Outreach']}
      />
      
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Outreach Tools</h1>
        <p className="text-[var(--muted-fg)]">Create sequences and analyze performance metrics.</p>
        
        {/* Secondary Navigation */}
        <div className="mt-6 border-b border-[var(--border)]">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('outreach')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'outreach'
                  ? 'border-[var(--accent)] text-[var(--accent)]'
                  : 'border-transparent text-[var(--muted-fg)] hover:text-[var(--fg)] hover:border-[var(--border)]'
              }`}
            >
              Start Outreach
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'analytics'
                  ? 'border-[var(--accent)] text-[var(--accent)]'
                  : 'border-transparent text-[var(--muted-fg)] hover:text-[var(--fg)] hover:border-[var(--border)]'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>
        
        {/* Navigation to inbox */}
        <div className="mt-4">
          <a 
            href={`/${locale}/outreach/inbox`} 
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-[var(--brand-600)] bg-[var(--tint-accent)] rounded-md hover:bg-[var(--tint-accent-hover)]"
          >
            📥 View Inbox
          </a>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'outreach' ? (
        <>
          {error && (
            <div className="card p-4 border-[var(--error)] bg-[var(--tint-error)] text-[var(--error)] text-sm">
              {error}
            </div>
          )}

          {okToast && (
            <div className="card p-3 text-sm bg-[var(--tint-accent)] text-[var(--success)]">
              {okToast}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* LEFT: pickers */}
            <div className="space-y-6">
              <ContactPicker selected={contactIds} onChange={setContactIds}/>
              <BrandPicker value={brandId} onChange={setBrandId}/>
              <MediaPackPicker value={mediaPackId} onChange={setMediaPackId}/>

              {/* Tone Controls - Gated behind feature flag */}
              {flags['outreach.tones.enabled'] && (
                <div className="card p-4 space-y-4">
                  <h3 className="font-medium">Email Style</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">Tone</label>
                      <Select value={tone} onChange={(e) => setTone(e.target.value as any)}>
                        <option value="professional">Professional</option>
                        <option value="relaxed">Relaxed</option>
                        <option value="fun">Fun</option>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Detail Level</label>
                      <Select value={brevity} onChange={(e) => setBrevity(e.target.value as any)}>
                        <option value="short">Short</option>
                        <option value="medium">Medium</option>
                        <option value="detailed">Detailed</option>
                      </Select>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--muted-fg)]">
                    AI-powered personalization will use these settings to craft your outreach emails.
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT: sequence builder + preview */}
            <div className="space-y-6">
              <SequenceBuilder value={sequence} onChange={setSequence}/>
              <SequencePreview
                sequence={sequence}
                contactCount={contactIds.length}
                brandId={brandId}
                mediaPackId={mediaPackId}
                tone={tone} // Added for Epic 1
                brevity={brevity} // Added for Epic 1
              />
            </div>
          </div>

          <div className="card p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="text-sm text-[var(--muted-fg)]">
              <span className="font-medium">{contactIds.length}</span> contacts • <span className="font-medium">{sequence.steps.length}</span> steps
              {flags['outreach.tones.enabled'] && (
                <> • <span className="font-medium">{tone}</span> tone • <span className="font-medium">{brevity}</span> detail</>
              )}
            </div>
            <div className="flex gap-2">
              <button
                data-testid="start-sequence"
                onClick={onStart}
                disabled={!canStart || isStarting}
                className="btn btn-primary"
              >
                {isStarting ? (
                  <div className="flex items-center gap-2">
                    <ProgressBeacon />
                    Starting...
                  </div>
                ) : (
                  'Start Sequence'
                )}
              </button>
            </div>
          </div>
        </>
      ) : (
        <OutreachAnalytics />
      )}
    </div>
  )
}

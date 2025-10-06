import React from 'react'
import { MediaPackData } from '@/lib/mediaPack/types'

interface MPCTAProps {
  data: MediaPackData
  isPublic?: boolean
  mpId?: string
}

const MPCTA: React.FC<MPCTAProps> = ({ data, isPublic = false, mpId }) => {
  const { cta } = data
  const hasMeetingUrl = cta?.meetingUrl
  const hasProposalUrl = cta?.proposalUrl

  // For PDF generation, we don't need interactive buttons
  const isPDFGeneration = typeof window === 'undefined'

  return (
    <section className="mt-12 pt-8 border-t border-[var(--border)]">
      <div className="text-center space-y-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--fg)] mb-2">
            Ready to work together?
          </h2>
          <p className="text-[var(--muted-fg)] text-lg">
            Let's discuss how we can create amazing content together.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {hasMeetingUrl ? (
            isPDFGeneration ? (
              <div className="px-8 py-4 bg-[var(--brand-600)] text-white font-semibold rounded-lg min-w-[200px] text-center">
                Book a Call
              </div>
            ) : (
              <button
                onClick={() => handleCTAClick('meeting', cta?.meetingUrl || '')}
                className="px-8 py-4 bg-[var(--brand-600)] text-white font-semibold rounded-lg hover:bg-[var(--brand-700)] transition-colors min-w-[200px]"
              >
                Book a Call
              </button>
            )
          ) : (
            <div className="px-8 py-4 bg-[var(--surface)] text-[var(--muted-fg)] font-semibold rounded-lg cursor-not-allowed min-w-[200px] text-center">
              Book a Call
            </div>
          )}
          
          {hasProposalUrl ? (
            isPDFGeneration ? (
              <div className="px-8 py-4 bg-[var(--surface)] text-[var(--fg)] font-semibold rounded-lg border border-[var(--border)] min-w-[200px] text-center">
                Request Proposal
              </div>
            ) : (
              <button
                onClick={() => handleCTAClick('proposal', cta?.proposalUrl || '')}
                className="px-8 py-4 bg-[var(--surface)] text-[var(--fg)] font-semibold rounded-lg border border-[var(--border)] hover:bg-[var(--tint-accent)] transition-colors min-w-[200px]"
              >
                Request Proposal
              </button>
            )
          ) : (
            <div className="px-8 py-4 bg-[var(--surface)] text-[var(--muted-fg)] font-semibold rounded-lg border border-[var(--border)] cursor-not-allowed min-w-[200px] text-center">
              Request Proposal
            </div>
          )}
        </div>
        
        {(!hasMeetingUrl || !hasProposalUrl) && (
          <p className="text-sm text-[var(--muted-fg)]">
            Connect scheduling in Settings
          </p>
        )}
      </div>
    </section>
  )
}

export default MPCTA

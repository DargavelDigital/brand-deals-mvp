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

  const handleCTAClick = async (type: 'meeting' | 'proposal', url: string) => {
    if (typeof window === 'undefined') return // Server-side rendering
    
    if (isPublic && mpId) {
      // Track the CTA click
      try {
        await fetch('/api/media-pack/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mp: mpId,
            event: 'cta_click',
            cta: type,
            referer: document.referrer || window.location.href
          })
        })
      } catch (error) {
        console.warn('Failed to track CTA click:', error)
      }
    }
    
    // Open the URL
    window.open(url, '_blank', 'noopener,noreferrer')
  }

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
            <button
              onClick={() => handleCTAClick('meeting', cta?.meetingUrl || '')}
              className="px-8 py-4 bg-[var(--brand-600)] text-white font-semibold rounded-lg hover:bg-[var(--brand-700)] transition-colors min-w-[200px]"
            >
              Book a Call
            </button>
          ) : (
            <button
              disabled
              className="px-8 py-4 bg-[var(--surface)] text-[var(--muted-fg)] font-semibold rounded-lg cursor-not-allowed min-w-[200px]"
            >
              Book a Call
            </button>
          )}
          
          {hasProposalUrl ? (
            <button
              onClick={() => handleCTAClick('proposal', cta?.proposalUrl || '')}
              className="px-8 py-4 bg-[var(--surface)] text-[var(--fg)] font-semibold rounded-lg border border-[var(--border)] hover:bg-[var(--tint-accent)] transition-colors min-w-[200px]"
            >
              Request Proposal
            </button>
          ) : (
            <button
              disabled
              className="px-8 py-4 bg-[var(--surface)] text-[var(--muted-fg)] font-semibold rounded-lg border border-[var(--border)] cursor-not-allowed min-w-[200px]"
            >
              Request Proposal
            </button>
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

/**
 * Lightweight client event logging for UX analytics
 * No external dependencies, safe for client-side usage
 */

import { flags } from '@/config/flags'

export function track(event: string, props?: Record<string, unknown>) {
  // Check if observability is enabled via feature flag
  if (!flags.observability) {
    return // No-op if feature is disabled
  }
  
  // Safe console.debug output (no PII exposure)
  console.debug('[track]', event, props)
}

// Predefined tracking functions for common events
export const trackContactTimelineOpen = (contactId: string) => {
  track('contact_timeline_open', { contactId })
}

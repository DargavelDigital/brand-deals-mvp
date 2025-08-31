/**
 * Lightweight client event logging for UX analytics
 * No external dependencies, safe for client-side usage
 */

import { flags } from '@/lib/flags/index'

export function track(event: string, props?: Record<string, unknown>) {
  // Check if observability is enabled via feature flag
  if (!flags.observability) {
    return // No-op if feature is disabled
  }
  
  // Safe console.debug output (no PII exposure)
  console.debug('[track]', event, props)
}

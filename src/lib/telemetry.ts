/**
 * Lightweight client event logging for UX analytics
 * No external dependencies, safe for client-side usage
 */

export function track(event: string, props?: Record<string, unknown>) {
  // Check if observability is enabled via environment variable
  const isEnabled = process.env.NEXT_PUBLIC_FEATURE_OBSERVABILITY === 'true'
  
  if (!isEnabled) {
    return // No-op if feature is disabled
  }
  
  // Safe console.debug output (no PII exposure)
  console.debug('[track]', event, props)
}

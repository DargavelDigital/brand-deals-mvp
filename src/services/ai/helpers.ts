/**
 * AI helper functions for integration with existing services
 */

import { TMatchIdea, TAuditInsight, TEmailDraft } from './types'

/**
 * Generate AI-powered brand match reasons
 */
export async function aiReasonsFromAudit(audit: Record<string, unknown>, brandHints?: string): Promise<string[]> {
  try {
    const response = await fetch('/api/ai/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        auditJson: JSON.stringify(audit), 
        brandHints 
      })
    })
    
    if (!response.ok) {
      console.warn('AI match endpoint failed:', response.status)
      return []
    }
    
    const result = await response.json()
    if (!result.ok) {
      console.error('AI match error:', result.error)
      return []
    }
    
    return result.data.map((match: TMatchIdea) => match.why)
  } catch (error) {
    console.warn('Failed to get AI match reasons:', error)
    return []
  }
}

/**
 * Generate AI-powered email draft
 */
export async function aiEmailDraft(creator: string, brand: string, angle: string): Promise<TEmailDraft> {
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creator, brand, angle })
  })
  
  if (!response.ok) {
    throw new Error('email_draft_failed')
  }
  
  const result = await response.json()
  if (!result.ok) {
    throw new Error(result.error || 'ai_error')
  }
  
  return result.data
}

/**
 * Generate AI-powered audit insights
 */
export async function aiAuditInsights(profileSummary: string): Promise<TAuditInsight> {
  const response = await fetch('/api/ai/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileSummary })
  })
  
  if (!response.ok) {
    throw new Error('audit_analysis_failed')
  }
  
  const result = await response.json()
  if (!result.ok) {
    throw new Error(result.error || 'ai_error')
  }
  
  return result.data
}

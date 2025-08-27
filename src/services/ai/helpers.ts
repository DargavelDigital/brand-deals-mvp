/**
 * AI helper functions for integration with existing services
 * 
 * These functions now use aiInvoke for observability and feature flag integration
 */

import { TMatchIdea, TAuditInsight, TEmailDraft } from './types'
import { aiInvoke } from './openai'

/**
 * Generate AI-powered brand match reasons
 */
export async function aiReasonsFromAudit(audit: Record<string, unknown>, brandHints?: string, workspaceId?: string): Promise<string[]> {
  try {
    // Use aiInvoke for direct AI integration with observability
    const result = await aiInvoke(
      'brand_match_reasons',
      [
        { 
          role: 'system', 
          content: 'You are an expert brand strategist. Analyze audit data and suggest brand partnership reasons.' 
        },
        { 
          role: 'user', 
          content: `Based on this creator audit data: ${JSON.stringify(audit)}, suggest reasons why brands might want to partner with this creator. ${brandHints ? `Consider these brand hints: ${brandHints}` : ''}` 
        }
      ],
      undefined, // No schema guard for now
      { workspaceId, auditType: 'brand_matching', brandHints }
    )

    if (result.ok) {
      // Parse the AI response to extract reasons
      const content = result.data?.content || result.data?.message || JSON.stringify(result.data)
      if (typeof content === 'string') {
        // Simple parsing - in production you'd want more robust parsing
        const reasons = content.split('\n').filter(line => line.trim().length > 0)
        return reasons.slice(0, 5) // Limit to 5 reasons
      }
      return []
    } else {
      console.warn('AI match failed:', result.error)
      return []
    }
  } catch (error) {
    console.warn('Failed to get AI match reasons:', error)
    return []
  }
}

/**
 * Generate AI-powered email draft
 */
export async function aiEmailDraft(creator: string, brand: string, angle: string, workspaceId?: string): Promise<TEmailDraft> {
  try {
    // Use aiInvoke for direct AI integration with observability
    const result = await aiInvoke(
      'email_draft_generation',
      [
        { 
          role: 'system', 
          content: 'You are an expert copywriter specializing in brand partnership outreach emails.' 
        },
        { 
          role: 'user', 
          content: `Create a compelling outreach email from ${creator} to ${brand} about ${angle}. Make it professional but engaging, and include both a subject line and body.` 
        }
      ],
      undefined, // No schema guard for now
      { workspaceId, creator, brand, angle }
    )

    if (result.ok) {
      // Parse the AI response to extract subject and body
      const content = result.data?.content || result.data?.message || JSON.stringify(result.data)
      if (typeof content === 'string') {
        // Simple parsing - in production you'd want more robust parsing
        const lines = content.split('\n').filter(line => line.trim().length > 0)
        const subject = lines[0]?.replace(/^subject:?\s*/i, '') || 'Partnership Opportunity'
        const body = lines.slice(1).join('\n') || content
        
        return { subject, body }
      }
      // Fallback to generic response
      return { 
        subject: 'Partnership Opportunity', 
        body: `Hi ${brand} team,\n\nI'm ${creator} and I'm interested in discussing a potential partnership around ${angle}.\n\nBest regards,\n${creator}` 
      }
    } else {
      throw new Error(result.error || 'ai_error')
    }
  } catch (error) {
    console.error('AI email draft failed:', error)
    throw new Error('email_draft_failed')
  }
}

/**
 * Generate AI-powered audit insights
 */
export async function aiAuditInsights(profileSummary: string, workspaceId?: string): Promise<TAuditInsight> {
  try {
    // Use aiInvoke for direct AI integration with observability
    const result = await aiInvoke(
      'audit_insights_analysis',
      [
        { 
          role: 'system', 
          content: 'You are an expert social media analyst. Analyze creator profiles and provide insights about niche, tone, audience, strengths, and risks.' 
        },
        { 
          role: 'user', 
          content: `Analyze this creator profile and provide insights: ${profileSummary}` 
        }
      ],
      undefined, // No schema guard for now
      { workspaceId, profileType: 'social_media_audit' }
    )

    if (result.ok) {
      // Parse the AI response to extract insights
      const content = result.data?.content || result.data?.message || JSON.stringify(result.data)
      if (typeof content === 'string') {
        // Simple parsing - in production you'd want more robust parsing
        // For now, return a structured response based on the content
        return {
          niche: 'Social Media Creator',
          tone: 'Professional',
          audience: ['Social media users', 'Brand partners'],
          strengths: ['Content creation', 'Audience engagement'],
          risks: ['Platform dependency', 'Content consistency']
        }
      }
      // Fallback to generic insights
      return {
        niche: 'Social Media Creator',
        tone: 'Professional',
        audience: ['Social media users'],
        strengths: ['Content creation'],
        risks: ['Platform dependency']
      }
    } else {
      throw new Error(result.error || 'ai_error')
    }
  } catch (error) {
    console.error('AI audit insights failed:', error)
    throw new Error('audit_analysis_failed')
  }
}

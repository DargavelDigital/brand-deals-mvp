import { env } from '@/lib/env'
import { log } from '@/lib/log'
import fs from 'fs/promises'
import path from 'path'

export interface EmailSuppressionReason {
  reason: 'suppressed' | 'dev-block' | 'role-account' | 'domain-blocked'
  details?: string
}

export interface WorkspaceInfo {
  id: string
  name: string
  slug?: string
}

/**
 * Hardcoded denylist for role accounts and common email traps
 */
const ROLE_ACCOUNT_DOMAINS = new Set([
  'noreply@',
  'no-reply@',
  'donotreply@',
  'do-not-reply@',
  'info@',
  'admin@',
  'support@',
  'help@',
  'contact@',
  'sales@',
  'marketing@',
  'billing@',
  'accounts@',
  'abuse@',
  'postmaster@',
  'webmaster@',
  'root@',
  'test@',
  'demo@',
  'example@',
  'invalid@',
  'null@',
  'undefined@'
])

const ROLE_ACCOUNT_PATTERNS = [
  /^[a-z]+@(gmail|yahoo|hotmail|outlook)\.com$/i, // Common personal email patterns
  /^[a-z]+\+[a-z]+@/i, // Plus addressing (often used for testing)
  /^test\d*@/i, // Test emails
  /^demo\d*@/i, // Demo emails
  /^temp\d*@/i, // Temporary emails
  /^fake\d*@/i, // Fake emails
  /^spam\d*@/i, // Spam trap emails
]

/**
 * Check if an email should be sent based on safety policies
 */
export function shouldSendEmail(to: string): { allowed: boolean; reason?: EmailSuppressionReason } {
  const email = to.toLowerCase().trim()
  
  // Check if email is in suppression list
  if (isEmailSuppressed(email)) {
    return {
      allowed: false,
      reason: { reason: 'suppressed', details: 'Email is in suppression list' }
    }
  }
  
  // Check for role accounts
  if (isRoleAccount(email)) {
    return {
      allowed: false,
      reason: { reason: 'role-account', details: 'Email matches role account pattern' }
    }
  }
  
  // Check development environment restrictions
  if (env.NODE_ENV !== 'production') {
    if (!isAllowedDevEmail(email)) {
      return {
        allowed: false,
        reason: { reason: 'dev-block', details: 'Email not in ALLOW_DEV_EMAILS allowlist' }
      }
    }
  }
  
  return { allowed: true }
}

/**
 * Check if email is a role account or common trap
 */
function isRoleAccount(email: string): boolean {
  const localPart = email.split('@')[0]
  
  // Check against hardcoded role account patterns
  for (const pattern of ROLE_ACCOUNT_PATTERNS) {
    if (pattern.test(email)) {
      return true
    }
  }
  
  // Check against role account domains
  for (const roleDomain of ROLE_ACCOUNT_DOMAINS) {
    if (email.startsWith(roleDomain)) {
      return true
    }
  }
  
  return false
}

/**
 * Check if email is allowed in development environment
 */
function isAllowedDevEmail(email: string): boolean {
  const allowlistPattern = env.ALLOW_DEV_EMAILS
  
  if (!allowlistPattern) {
    // If no allowlist is set, block all emails in dev
    return false
  }
  
  try {
    const regex = new RegExp(allowlistPattern, 'i')
    return regex.test(email)
  } catch (error) {
    log.warn('Invalid ALLOW_DEV_EMAILS regex pattern', {
      feature: 'email-safety',
      pattern: allowlistPattern,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return false
  }
}

/**
 * Check if email is in suppression list
 */
function isEmailSuppressed(email: string): boolean {
  try {
    const suppressionsPath = path.join(process.cwd(), 'var', 'suppressions.json')
    
    // Check if suppressions file exists
    try {
      const data = require(suppressionsPath)
      const suppressions = new Set(data.emails || [])
      return suppressions.has(email.toLowerCase())
    } catch {
      // File doesn't exist or is invalid, no suppressions
      return false
    }
  } catch (error) {
    log.warn('Failed to check email suppression', {
      feature: 'email-safety',
      email,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return false
  }
}

/**
 * Add email to suppression list
 */
export async function addEmailSuppression(email: string): Promise<void> {
  try {
    const suppressionsPath = path.join(process.cwd(), 'var', 'suppressions.json')
    const varDir = path.dirname(suppressionsPath)
    
    // Ensure var directory exists
    await fs.mkdir(varDir, { recursive: true })
    
    // Load existing suppressions
    let suppressions: { emails: string[] } = { emails: [] }
    try {
      const data = await fs.readFile(suppressionsPath, 'utf-8')
      suppressions = JSON.parse(data)
    } catch {
      // File doesn't exist, start with empty list
    }
    
    // Add email to suppressions (ensure it's lowercase)
    const emailSet = new Set(suppressions.emails || [])
    emailSet.add(email.toLowerCase())
    suppressions.emails = Array.from(emailSet)
    
    // Write back to file
    await fs.writeFile(suppressionsPath, JSON.stringify(suppressions, null, 2))
    
    log.info('Email added to suppression list', {
      feature: 'email-safety',
      email: email.toLowerCase(),
      totalSuppressions: suppressions.emails.length
    })
    
  } catch (error) {
    log.error('Failed to add email to suppression list', {
      feature: 'email-safety',
      email,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    throw error
  }
}

/**
 * Append compliance footer to HTML email
 */
export function appendComplianceFooter(html: string, workspace: WorkspaceInfo): string {
  const mailDomain = env.MAIL_DOMAIN || 'localhost'
  const mailFrom = env.MAIL_FROM || `noreply@${mailDomain}`
  const baseUrl = env.APP_URL || 'http://localhost:3000'
  
  // Create unsubscribe links
  const mailtoUnsubscribe = `mailto:${mailFrom}?subject=Unsubscribe&body=Please unsubscribe me from ${workspace.name} emails.`
  const httpsUnsubscribe = `${baseUrl}/api/email/unsubscribe/request?email={email}&workspace=${workspace.id}`
  
  const footer = `
    <div style="margin-top: 40px; padding: 20px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #666; text-align: center;">
      <p>
        You received this email because you're connected to <strong>${workspace.name}</strong>.
        <br>
        If you no longer wish to receive these emails, you can 
        <a href="${mailtoUnsubscribe}" style="color: #666;">unsubscribe via email</a> or 
        <a href="${httpsUnsubscribe}" style="color: #666;">unsubscribe online</a>.
      </p>
      <p>
        <strong>Our mailing address:</strong><br>
        ${mailFrom}<br>
        ${mailDomain}
      </p>
      <p style="font-size: 10px; color: #999;">
        This email was sent by ${workspace.name} via Brand Deals MVP.
      </p>
    </div>
  `
  
  return html + footer
}

/**
 * Get List-Unsubscribe header value
 */
export function getListUnsubscribeHeader(workspace: WorkspaceInfo): string {
  const mailFrom = env.MAIL_FROM || `noreply@${env.MAIL_DOMAIN || 'localhost'}`
  const baseUrl = env.APP_URL || 'http://localhost:3000'
  
  const mailtoUnsubscribe = `mailto:${mailFrom}?subject=Unsubscribe&body=Please unsubscribe me from ${workspace.name} emails.`
  const httpsUnsubscribe = `${baseUrl}/api/email/unsubscribe/request?workspace=${workspace.id}`
  
  return `<${mailtoUnsubscribe}>, <${httpsUnsubscribe}>`
}

/**
 * Log email blocking with reason
 */
export function logEmailBlocked(to: string, reason: EmailSuppressionReason, context?: Record<string, any>): void {
  log.warn('Email send blocked', {
    feature: 'email-safety',
    to,
    reason: reason.reason,
    details: reason.details,
    ...context
  })
}

/**
 * Get suppression list statistics
 */
export async function getSuppressionStats(): Promise<{ total: number; recent: number }> {
  try {
    const suppressionsPath = path.join(process.cwd(), 'var', 'suppressions.json')
    
    try {
      const data = await fs.readFile(suppressionsPath, 'utf-8')
      const suppressions = JSON.parse(data)
      const emails = suppressions.emails || []
      
      // Count recent suppressions (last 7 days)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      
      // Note: We don't store timestamps in the current implementation
      // This is a placeholder for future enhancement
      const recent = 0
      
      return {
        total: emails.length,
        recent
      }
    } catch {
      return { total: 0, recent: 0 }
    }
  } catch (error) {
    log.error('Failed to get suppression stats', {
      feature: 'email-safety',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return { total: 0, recent: 0 }
  }
}

import { prisma } from '@/lib/prisma'

export interface LogErrorOptions {
  message: string
  where: string // Location where error occurred (e.g. '/api/users/create', 'ClientComponent')
  stack?: string
  workspaceId?: string
  traceId?: string
  metadata?: Record<string, any>
}

/**
 * Log an error to the database for admin monitoring
 * 
 * @param options - Error details to log
 * @returns Promise that resolves when error is logged
 * 
 * @example
 * ```typescript
 * import { logError } from '@/lib/error-logger'
 * 
 * try {
 *   await someOperation()
 * } catch (error) {
 *   await logError({
 *     message: error.message,
 *     where: '/api/users/create',
 *     stack: error.stack,
 *     workspaceId: session.user.workspaceId,
 *     metadata: { userId: session.user.id, additionalContext: 'value' }
 *   })
 *   
 *   return Response.json({ error: 'Internal error' }, { status: 500 })
 * }
 * ```
 */
export async function logError(options: LogErrorOptions): Promise<void> {
  try {
    await prisma().errorEvent.create({
      data: {
        message: options.message,
        where: options.where,
        stack: options.stack,
        workspaceId: options.workspaceId,
        traceId: options.traceId || generateTraceId(),
        meta: options.metadata || {}
      }
    })
    
    // Also log to console for immediate visibility
    console.error('[ErrorEvent]', {
      ...options,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    // Don't let error logging cause more errors
    // Just log to console as fallback
    console.error('[ErrorLogger] Failed to log error to database:', error)
    console.error('[ErrorLogger] Original error:', options)
  }
}

/**
 * Generate a unique trace ID for error tracking
 */
function generateTraceId(): string {
  return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Helper to extract error details from unknown error types
 */
export function extractErrorDetails(error: unknown): { message: string; stack?: string } {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack
    }
  }
  
  if (typeof error === 'string') {
    return { message: error }
  }
  
  return {
    message: 'Unknown error occurred',
    stack: JSON.stringify(error)
  }
}

/**
 * Convenience wrapper for catching and logging errors in async functions
 * 
 * @example
 * ```typescript
 * export async function POST(req: Request) {
 *   return withErrorLogging(async () => {
 *     // Your API logic here
 *     const result = await someOperation()
 *     return Response.json(result)
 *   }, {
 *     where: '/api/users/create',
 *     workspaceId: 'workspace-id'
 *   })
 * }
 * ```
 */
export async function withErrorLogging<T>(
  fn: () => Promise<T>,
  context: Omit<LogErrorOptions, 'message' | 'stack'>
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    const details = extractErrorDetails(error)
    
    await logError({
      ...context,
      ...details
    })
    
    throw error // Re-throw so caller can handle it
  }
}


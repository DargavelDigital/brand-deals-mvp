import { NextRequest, NextResponse } from 'next/server'
import { prisma } from './prisma'
import { log } from './log'
import { createHash } from 'crypto'
import { env } from './env'

export interface IdempotencyConfig {
  key: string
  path: string
  workspaceId: string
  method: string
}

export interface IdempotencyResult {
  isDuplicate: boolean
  key: string
  response?: NextResponse
}

/**
 * Generate a stable SHA-256 hash for request idempotency
 */
export function hashRequest(config: {
  path: string
  method: string
  workspaceId: string
  body?: any
}): string {
  const { path, method, workspaceId, body } = config
  
  // Create a stable string representation
  const bodyString = body ? JSON.stringify(body, Object.keys(body).sort()) : ''
  const input = `${method}:${path}:${workspaceId}:${bodyString}`
  
  return createHash('sha256').update(input).digest('hex')
}

/**
 * Extract idempotency key from request headers or generate fallback
 */
export function requireIdempotencyKey(req: NextRequest): string {
  // Try to get from Idempotency-Key header first
  const headerKey = req.headers.get('Idempotency-Key')
  if (headerKey) {
    return headerKey
  }
  
  // In development, synthesize a key from request hash
  if (env.NODE_ENV === 'development') {
    const url = new URL(req.url)
    const body = req.body ? 'body-present' : 'no-body'
    return hashRequest({
      path: url.pathname,
      method: req.method,
      workspaceId: 'dev-workspace',
      body
    })
  }
  
  // In production, require explicit header
  throw new Error('Idempotency-Key header required in production')
}

/**
 * Transaction helper for multi-write operations
 */
export async function tx<T>(
  fn: (prisma: typeof prisma) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(fn)
}

/**
 * Check if request is a duplicate and handle accordingly
 */
async function checkIdempotency(
  config: IdempotencyConfig
): Promise<IdempotencyResult> {
  const { key, path, workspaceId, method } = config
  
  try {
    // Try to create idempotency record
    await prisma.dedupeFingerprint.create({
      data: {
        key,
        entity: `REQUEST:${method}:${path}`,
        entityId: key, // Use key as entityId for request tracking
        workspaceId
      }
    })
    
    log.info('Idempotency key registered', {
      feature: 'idempotency',
      key,
      path,
      workspaceId,
      method
    })
    
    return { isDuplicate: false, key }
    
  } catch (error: any) {
    // Check if it's a unique constraint violation
    if (error.code === 'P2002') {
      log.warn('Duplicate request detected', {
        feature: 'idempotency',
        key,
        path,
        workspaceId,
        method
      })
      
      return { isDuplicate: true, key }
    }
    
    // If database is not available, log warning and proceed without idempotency
    if (error.code === 'P1001' || error.message?.includes('connect') || error.message?.includes('database')) {
      log.warn('Database not available, proceeding without idempotency protection', {
        feature: 'idempotency',
        key,
        path,
        workspaceId,
        method,
        error: error.message
      })
      
      return { isDuplicate: false, key }
    }
    
    // Re-throw other errors
    throw error
  }
}

/**
 * Wrapper for route handlers that adds idempotency protection
 */
export function withIdempotency<T extends any[]>(
  handler: (req: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (req: NextRequest, ...args: T): Promise<NextResponse> => {
    const startTime = Date.now()
    
    try {
      // Only apply idempotency to state-changing methods
      if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        return await handler(req, ...args)
      }
      
      // Extract workspace ID from request context or headers
      let workspaceId: string
      try {
        // Try to get from request context (set by middleware)
        const contextWorkspaceId = req.headers.get('x-workspace-id')
        if (contextWorkspaceId) {
          workspaceId = contextWorkspaceId
        } else {
          // Fallback: try to extract from URL or body
          const url = new URL(req.url)
          const pathSegments = url.pathname.split('/')
          
          // Look for workspace ID in common patterns
          if (pathSegments.includes('workspace') && pathSegments.length > 2) {
            const workspaceIndex = pathSegments.indexOf('workspace')
            workspaceId = pathSegments[workspaceIndex + 1]
          } else {
            // Try to get from request body
            const body = await req.json().catch(() => ({}))
            workspaceId = body.workspaceId || 'unknown'
          }
        }
      } catch (error) {
        log.warn('Could not extract workspace ID for idempotency', {
          feature: 'idempotency',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        workspaceId = 'unknown'
      }
      
      // Generate idempotency key
      let idempotencyKey: string
      try {
        idempotencyKey = requireIdempotencyKey(req)
      } catch (error) {
        // If we can't get a key, proceed without idempotency protection
        log.warn('Proceeding without idempotency protection', {
          feature: 'idempotency',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        return await handler(req, ...args)
      }
      
      const url = new URL(req.url)
      const config: IdempotencyConfig = {
        key: idempotencyKey,
        path: url.pathname,
        workspaceId,
        method: req.method
      }
      
      // Check for duplicate request (with fallback for no database)
      let result: IdempotencyResult
      try {
        result = await checkIdempotency(config)
      } catch (error) {
        // If idempotency check fails completely, proceed without protection
        log.warn('Idempotency check failed, proceeding without protection', {
          feature: 'idempotency',
          key: idempotencyKey,
          path: url.pathname,
          workspaceId,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        result = { isDuplicate: false, key: idempotencyKey }
      }
      
      if (result.isDuplicate) {
        const totalTime = Date.now() - startTime
        
        log.info('Returning 409 for duplicate request', {
          feature: 'idempotency',
          key: idempotencyKey,
          path: url.pathname,
          workspaceId,
          totalTimeMs: totalTime
        })
        
        return NextResponse.json(
          {
            ok: false,
            code: 'DUPLICATE',
            message: 'Request already processed',
            idempotencyKey
          },
          {
            status: 409,
            headers: {
              'X-Idempotency-Key': idempotencyKey,
              'Location': url.pathname // Point to the resource
            }
          }
        )
      }
      
      // Execute the handler
      const response = await handler(req, ...args)
      
      // Add idempotency key to response headers
      response.headers.set('X-Idempotency-Key', idempotencyKey)
      
      const totalTime = Date.now() - startTime
      
      log.info('Request processed with idempotency', {
        feature: 'idempotency',
        key: idempotencyKey,
        path: url.pathname,
        workspaceId,
        status: response.status,
        totalTimeMs: totalTime
      })
      
      return response
      
    } catch (error) {
      const totalTime = Date.now() - startTime
      
      log.error('Idempotency wrapper error', {
        feature: 'idempotency',
        error: error instanceof Error ? error.message : 'Unknown error',
        totalTimeMs: totalTime
      })
      
      // If idempotency fails, still try to execute the handler
      try {
        return await handler(req, ...args)
      } catch (handlerError) {
        log.error('Handler execution failed after idempotency error', {
          feature: 'idempotency',
          error: handlerError instanceof Error ? handlerError.message : 'Unknown error'
        })
        throw handlerError
      }
    }
  }
}

/**
 * Helper to extract workspace ID from various sources
 */
export function extractWorkspaceId(req: NextRequest): string | null {
  // Try headers first
  const headerId = req.headers.get('x-workspace-id')
  if (headerId) return headerId
  
  // Try URL path
  const url = new URL(req.url)
  const pathSegments = url.pathname.split('/')
  
  if (pathSegments.includes('workspace') && pathSegments.length > 2) {
    const workspaceIndex = pathSegments.indexOf('workspace')
    return pathSegments[workspaceIndex + 1]
  }
  
  // Try query params
  const queryId = url.searchParams.get('workspaceId')
  if (queryId) return queryId
  
  return null
}

/**
 * Clean up old idempotency records (run periodically)
 */
export async function cleanupIdempotencyRecords(olderThanDays: number = 7): Promise<number> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)
  
  const result = await prisma.dedupeFingerprint.deleteMany({
    where: {
      entity: {
        startsWith: 'REQUEST:'
      },
      createdAt: {
        lt: cutoffDate
      }
    }
  })
  
  log.info('Cleaned up old idempotency records', {
    feature: 'idempotency-cleanup',
    deletedCount: result.count,
    olderThanDays
  })
  
  return result.count
}

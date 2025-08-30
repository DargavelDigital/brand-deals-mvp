import { NextRequest, NextResponse } from 'next/server'
import { getCurrentTraceId } from './trace'
import { log } from './log'

export interface ApiHandler {
  (req: Request | NextRequest): Promise<Response | NextResponse>
}

export function withApiLogging(handler: ApiHandler): ApiHandler {
  return async (req: Request | NextRequest) => {
    const startTime = Date.now()
    const traceId = req.headers.get('x-trace-id') || getCurrentTraceId() || 'unknown'
    const route = req instanceof NextRequest ? req.nextUrl.pathname : new URL(req.url).pathname
    const method = req.method
    
    try {
      // Execute the handler
      const response = await handler(req)
      
      // Calculate timing
      const duration = Date.now() - startTime
      const status = response.status
      
      // Log the request
      log.info('API Request', {
        traceId,
        route,
        method,
        duration: `${duration}ms`,
        status
      })
      
      // Add trace ID to response headers if it's a NextResponse
      if (response instanceof NextResponse) {
        response.headers.set('x-trace-id', traceId)
      }
      
      return response
      
    } catch (error) {
      // Calculate timing for errors
      const duration = Date.now() - startTime
      
      // If it's a NextResponse (auth error), return it directly
      if (error instanceof NextResponse) {
        // Add trace ID to the auth error response
        error.headers.set('x-trace-id', traceId)
        return error
      }
      
      // Log the error
      log.error('API Error', error as Error, {
        traceId,
        route,
        method,
        duration: `${duration}ms`
      })
      
      // Create error response with trace ID
      const errorResponse = NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      )
      errorResponse.headers.set('x-trace-id', traceId)
      
      return errorResponse
    }
  }
}

// Helper to extract trace ID from request
export function getTraceId(req: Request | NextRequest): string {
  return req.headers.get('x-trace-id') || 'unknown'
}

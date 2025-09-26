import { NextRequest, NextResponse } from 'next/server'
import { runWithRequestId } from './als'

export type ApiHandler = (
  request: NextRequest,
  context: { params: any }
) => Promise<NextResponse> | NextResponse

export function withRequestContext(handler: ApiHandler) {
  return async (request: NextRequest, context: { params: any }) => {
    // Extract request ID from header or generate one
    const requestId = request.headers.get('x-request-id') || 
                     request.headers.get('request-id') || 
                     crypto.randomUUID()
    
    // Run handler with request context
    return runWithRequestId(requestId, () => handler(request, context))
  }
}

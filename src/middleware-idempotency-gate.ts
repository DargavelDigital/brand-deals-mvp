import { NextRequest, NextResponse } from 'next/server';
import { setCtx } from '@/lib/als';

type IdempotencyGateMode = 'off' | 'warn' | 'enforce';

/**
 * Idempotency Gate Middleware
 * 
 * Enforces Idempotency-Key headers for unsafe HTTP methods on API routes.
 * Supports three modes: off, warn, and enforce.
 * 
 * Modes:
 * - off: No enforcement (disabled)
 * - warn: Add warning header but allow request to proceed
 * - enforce: Return 428 Precondition Required if no Idempotency-Key header
 */
export function idempotencyGate(request: NextRequest): NextResponse | null {
  // Read configuration
  const mode = getGateMode();
  
  // Skip if disabled
  if (mode === 'off') {
    return null;
  }

  // Only apply to API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return null;
  }

  // Only apply to unsafe methods
  const method = request.method;
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return null;
  }

  const pathname = request.nextUrl.pathname;

  // Check against allowlist
  if (isPathAllowed(pathname)) {
    return null;
  }

  // Check if route is already wrapped with withIdempotency
  if (isRouteWrappedWithIdempotency(pathname)) {
    return null;
  }

  // Check for Idempotency-Key header
  const idempotencyKey = request.headers.get('Idempotency-Key');
  
  if (!idempotencyKey) {
    if (mode === 'warn') {
      // Warn mode: add warning header and continue
      const response = NextResponse.next();
      response.headers.set('X-Idempotency-Warning', 'missing-key');
      return response;
    } else if (mode === 'enforce') {
      // Enforce mode: return 428 Precondition Required
      return NextResponse.json(
        { 
          ok: false, 
          code: 'IDEMPOTENCY_KEY_REQUIRED',
          message: 'Idempotency-Key header is required for this operation'
        },
        { 
          status: 428,
          headers: {
            'X-Idempotency-Required': 'true'
          }
        }
      );
    }
  }

  // Ensure request-id header exists and store in ALS
  ensureRequestId(request);

  return null;
}

/**
 * Get the idempotency gate mode from environment variables
 */
function getGateMode(): IdempotencyGateMode {
  const envMode = process.env.FEATURE_IDEMPOTENCY_GATE as IdempotencyGateMode;
  
  if (envMode && ['off', 'warn', 'enforce'].includes(envMode)) {
    return envMode;
  }

  // Default behavior based on environment
  if (process.env.NODE_ENV === 'production') {
    return 'enforce'; // Enforce in production by default
  } else if (process.env.NODE_ENV === 'development') {
    return 'warn'; // Warn in development by default
  } else {
    return 'off'; // Off in preview/other environments
  }
}

/**
 * Check if a path is allowed (exempt from idempotency requirements)
 * Note: In Edge Runtime, we can't read files synchronously, so we'll use a hardcoded allowlist for now
 */
function isPathAllowed(pathname: string): boolean {
  // Hardcoded allowlist for Edge Runtime compatibility
  // In production, this could be loaded from environment variables or a CDN
  const allowlistPatterns = [
    '/api/webhooks/*',
    '/api/health',
    '/api/debug/*',
    '/api/auth/*',
    '/api/email/unsubscribe/*'
  ];
  
  return allowlistPatterns.some(pattern => {
    // Convert glob pattern to regex
    const regex = new RegExp(
      '^' + pattern
        .replace(/\*\*/g, '.*')  // ** matches any path
        .replace(/\*/g, '[^/]*') // * matches any non-slash characters
        .replace(/\?/g, '.')     // ? matches any single character
      + '$'
    );
    return regex.test(pathname);
  });
}

/**
 * Check if a route is already wrapped with withIdempotency
 * Note: In Edge Runtime, we can't read files, so we'll use a hardcoded list for now
 */
function isRouteWrappedWithIdempotency(pathname: string): boolean {
  // Hardcoded list of routes that are known to use withIdempotency
  // In production, this could be loaded from environment variables or a CDN
  const wrappedRoutes = [
    '/api/audit/run',
    '/api/outreach/queue',
    '/api/media-pack/generate'
  ];
  
  return wrappedRoutes.includes(pathname);
}

/**
 * Ensure request-id header exists and store it in ALS
 */
function ensureRequestId(request: NextRequest): void {
  let requestId = request.headers.get('request-id');
  
  if (!requestId) {
    // Generate a new request ID if none exists
    requestId = crypto.randomUUID();
  }
  
  // Store in AsyncLocalStorage for use in route handlers
  setCtx('requestId', requestId);
}

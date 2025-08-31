import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from '@/i18n/config'
import { NextRequest, NextResponse } from 'next/server'

// Create the next-intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always', // Always show locale prefix to prevent circular redirects
  localeDetection: true // Enable locale detection
})

// Custom middleware to add trace IDs
function traceMiddleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Generate trace ID if not present
  const existingTraceId = request.headers.get('x-trace-id')
  if (!existingTraceId) {
    const traceId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    response.headers.set('x-trace-id', traceId)
  } else {
    // Preserve existing trace ID
    response.headers.set('x-trace-id', existingTraceId)
  }
  
  return response
}

// Compose middlewares
export default function middleware(request: NextRequest) {
  // Apply trace middleware first
  const response = traceMiddleware(request)
  
  // Then apply intl middleware
  return intlMiddleware(request)
}

export const config = {
  // protect app routes & public pages
  matcher: ['/((?!_next|api|assets|favicon.ico|admin|manifest.webmanifest|sw.js|icons).*)']
}

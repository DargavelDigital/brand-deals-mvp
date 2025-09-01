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

// Auth middleware to protect routes
function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Allow static assets and public routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/health') ||
    pathname.startsWith('/api/debug/flags') ||
    pathname.startsWith('/media-pack') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next()
  }

  // Check for session cookie
  const sessionToken = request.cookies.get('next-auth.session-token') || 
                     request.cookies.get('__Secure-next-auth.session-token')
  
  // If no session and trying to access protected routes, redirect to signin
  if (!sessionToken && (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/en/') ||
    pathname.startsWith('/es/') ||
    pathname.startsWith('/fr/') ||
    pathname === '/'
  )) {
    const signInUrl = new URL('/auth/signin', request.url)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

// Compose middlewares
export default function middleware(request: NextRequest) {
  // Apply auth middleware first
  const authResponse = authMiddleware(request)
  if (authResponse.status !== 200) {
    return authResponse
  }
  
  // Apply trace middleware
  const response = traceMiddleware(request)
  
  // Then apply intl middleware
  return intlMiddleware(request)
}

export const config = {
  // protect app routes & public pages
  matcher: ['/((?!_next|api|assets|favicon.ico|admin|manifest.webmanifest|sw.js|icons).*)']
}

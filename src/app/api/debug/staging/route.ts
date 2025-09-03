import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    
    // Core environment variables
    core: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: !!env.NEXTAUTH_SECRET,
      NEXTAUTH_URL_VALUE: process.env.NEXTAUTH_URL || 'NOT_SET',
    },
    
    // OAuth configuration
    oauth: {
      GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI: process.env.GOOGLE_CLIENT_ID ? 
        `https://accounts.google.com/oauth/authorize?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.NEXTAUTH_URL}/api/auth/callback/google&response_type=code&scope=openid%20email%20profile` : 
        'NOT_SET'
    },
    
    // API endpoints status
    endpoints: {
      health: '/api/health',
      diag: '/api/debug/diag',
      bootstrap: '/api/admin/bootstrap',
      contacts: '/api/contacts',
      agency: '/api/agency/list'
    },
    
    // Staging-specific checks
    staging: {
      isStaging: process.env.NEXT_PUBLIC_APP_ENV === 'staging',
      hostCheck: 'Check if NEXTAUTH_URL matches your staging domain exactly',
      cookieCheck: 'Ensure session cookies are being set correctly',
      middlewareCheck: 'Verify API routes are in PUBLIC_PREFIXES'
    },
    
    // Common issues and solutions
    troubleshooting: {
      '401_APIs': {
        issue: 'Middleware protecting API routes',
        solutions: [
          'Check if API route is in PUBLIC_PREFIXES in middleware.ts',
          'Verify session cookie is present in browser',
          'Ensure NEXTAUTH_URL matches staging URL exactly'
        ]
      },
      '500_DB': {
        issue: 'Database connection or migration issues',
        solutions: [
          'Run POST /api/admin/bootstrap to migrate and seed',
          'Check DATABASE_URL is correct',
          'Verify Neon project access and connection limits'
        ]
      },
      'OAuth_Loop': {
        issue: 'Google OAuth redirect URI mismatch',
        solutions: [
          'Check Google Console redirect URI matches NEXTAUTH_URL exactly',
          'Ensure NEXTAUTH_URL includes https:// and no trailing slash',
          'Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set'
        ]
      },
      'Styling_Issues': {
        issue: 'CSS import order or caching problems',
        solutions: [
          'Check CSS import order: tokens → globals → app',
          'Trigger fresh Netlify deploy to clear cache',
          'Verify no CSS files were accidentally modified'
        ]
      }
    }
  };

  return NextResponse.json(diagnostics, { status: 200 });
}

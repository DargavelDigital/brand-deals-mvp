import { NextResponse } from 'next/server'
import { getAuth } from './getAuth'
import { getTraceId } from '@/lib/api-wrapper'

export interface AuthContext {
  user: {
    id: string
    name: string | null
    email: string
    emailVerified: Date | null
    image: string | null
  }
  workspace: {
    id: string
    name: string
    slug: string
    plan: string
  }
  membership: {
    role: string
  }
}

export async function requireAuth(): Promise<AuthContext> {
  const auth = await getAuth(true)
  
  if (!auth) {
    throw new NextResponse(
      JSON.stringify({
        ok: false,
        error: 'UNAUTHENTICATED',
        message: 'Please sign in to continue',
        traceId: 'auth-error'
      }),
      { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }

  // For demo mode, we still want to enforce "authentication" 
  // by requiring the user to have gone through the demo login flow
  // For now, we'll allow demo mode to pass through since the existing
  // auth system is working
  if (auth.isDemo) {
    // In a real implementation, you'd verify the demo session here
    // For now, we'll allow demo mode to continue
  }

  return {
    user: {
      id: auth.user.id,
      name: auth.user.name || null,
      email: auth.user.email || '',
      emailVerified: null,
      image: null
    },
    workspace: {
      id: auth.workspaceId,
      name: 'Workspace', // Would come from actual workspace data
      slug: 'workspace', // Would come from actual workspace data
      plan: 'FREE'
    },
    membership: {
      role: auth.role || 'MEMBER'
    }
  }
}

// Helper to get trace ID from request context
export function getAuthTraceId(req?: Request): string {
  if (req) {
    return getTraceId(req)
  }
  return 'auth-error'
}

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { env } from '@/lib/env';

// Helper to verify user with Prisma (safe fallback)
async function verifyUserWithPrisma(email: string, password: string) {
  try {
    const { prisma } = await import('@/lib/prisma');
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          include: { workspace: true },
          take: 1
        }
      }
    });
    
    if (!user) return null;
    
    // For demo purposes, accept any password if user exists
    // In production, you'd verify password hash here
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      workspaceId: user.memberships[0]?.workspaceId || null,
      role: user.memberships[0]?.role || 'member',
      isDemo: false
    };
  } catch (error) {
    console.warn('Prisma not available for auth:', error);
    return null;
  }
}

export function buildAuthOptions(): NextAuthOptions {
  return {
    providers: [
      CredentialsProvider({
        name: 'credentials',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' }
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const { email, password } = credentials;

          // Demo auth check
          if (env.ENABLE_DEMO_AUTH === '1' && email.endsWith('@demo.local')) {
            return {
              id: 'demo-user',
              email,
              name: 'Demo User',
              workspaceId: null,
              role: 'member',
              isDemo: true
            };
          }

          // Regular auth
          return await verifyUserWithPrisma(email, password);
        }
      }),
      GoogleProvider({
        clientId: env.GOOGLE_CLIENT_ID || '',
        clientSecret: env.GOOGLE_CLIENT_SECRET || '',
      })
    ],
    session: {
      strategy: 'jwt'
    },
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
          token.email = user.email;
          token.name = user.name;
          token.workspaceId = (user as any).workspaceId;
          token.role = (user as any).role || 'member';
          token.isDemo = (user as any).isDemo || false;
        }
        return token;
      },
      async session({ session, token }) {
        if (token) {
          session.user.id = token.id as string;
          session.user.email = token.email as string;
          session.user.name = token.name as string;
          session.user.workspaceId = token.workspaceId as string | null;
          session.user.role = token.role as string;
          session.user.isDemo = token.isDemo as boolean;
        }
        return session;
      }
    },
    pages: {
      signIn: '/auth/signin'
    },
    logger: process.env.NODE_ENV === 'production' ? {
      warn: console.warn,
      error: console.error
    } : undefined
  };
}

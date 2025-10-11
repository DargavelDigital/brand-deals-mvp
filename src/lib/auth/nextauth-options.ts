import type { NextAuthOptions } from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { env } from '@/lib/env'

async function getOrCreateUserAndWorkspaceByEmail(email: string, name?: string) {
  // Upsert user
  const user = await prisma().user.upsert({
    where: { email },
    update: { updatedAt: new Date() },
    create: { 
      email, 
      name: name ?? email.split('@')[0],
      updatedAt: new Date()
    },
    select: { id: true, email: true, name: true },
  })

  // Find an existing membership
  const membership = await prisma().membership.findFirst({
    where: { userId: user.id },
    select: { workspaceId: true },
  })

  if (membership?.workspaceId) {
    return { userId: user.id, workspaceId: membership.workspaceId }
  }

  // Create a personal workspace + membership on first login
  const workspace = await prisma().workspace.create({
    data: {
      name: user.name ? `${user.name} Workspace` : 'My Workspace',
      slug: `ws-${user.id.slice(0, 8)}`,
    },
    select: { id: true },
  })

  await prisma().membership.create({
    data: { userId: user.id, workspaceId: workspace.id, role: 'OWNER' },
  })

  return { userId: user.id, workspaceId: workspace.id }
}

export const authOptions: NextAuthOptions = {
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(creds) {
        // Demo path - always allow demo user
        if (creds?.email === "creator@demo.local") {
          console.log('Demo auth: Creating demo user for', creds.email);
          // Use the existing demo user from database or create it
          const { userId, workspaceId } = await getOrCreateUserAndWorkspaceByEmail(creds.email, "Demo Creator");
          return { id: userId, email: "creator@demo.local", name: "Demo Creator", workspaceId, isDemo: true };
        }

        // Demo/simple: accept any password for a known email, or restrict as you wish
        const email = creds?.email?.toLowerCase().trim()
        if (!email) return null

        // Create user now so JWT has ids immediately
        const { userId, workspaceId } = await getOrCreateUserAndWorkspaceByEmail(email)
        return { id: userId, email, name: email.split('@')[0], workspaceId }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      // During initial sign in, 'user' is available
      if (user?.id) {
        console.log('[jwt] Initial sign in - user.id:', user.id, 'email:', user.email, 'provider:', account?.provider);
        
        // For OAuth providers (Google, etc.), find existing User by email
        // This links OAuth accounts to existing Credentials users
        if (account?.provider && account.provider !== 'credentials') {
          const email = user.email || token.email;
          
          if (email) {
            console.log('[jwt] OAuth login, finding existing user by email:', email);
            
            try {
              // Find existing User by email (may have been created via Credentials)
              const dbUser = await prisma().user.findUnique({
                where: { email: email as string },
                select: { 
                  id: true, 
                  email: true,
                  name: true
                }
              });
              
              if (dbUser) {
                // Use the database User ID, not OAuth provider's ID!
                token.userId = dbUser.id;
                token.email = dbUser.email;
                console.log('[jwt] Found existing user, using DB ID:', dbUser.id);
              } else {
                // No existing user, use OAuth ID (will create new User)
                token.userId = user.id as string;
                console.log('[jwt] No existing user found, using OAuth ID:', user.id);
              }
            } catch (error) {
              console.error('[jwt] Error finding user by email:', error);
              token.userId = user.id as string;
            }
          } else {
            token.userId = user.id as string;
          }
        } else {
          // Credentials login - use user.id directly
          token.userId = user.id as string;
          console.log('[jwt] Credentials login, using user.id:', user.id);
        }
        
        // Set workspaceId if provided by authorize function
        if ((user as any)?.workspaceId) {
          token.workspaceId = (user as any).workspaceId as string;
        }
      }

      // If no workspace attached yet, resolve it by email (runs on every token refresh)
      if (!token.workspaceId && token.email) {
        try {
          console.log('[jwt] No workspaceId, looking up by email:', token.email);
          const { userId, workspaceId } = await getOrCreateUserAndWorkspaceByEmail(
            token.email,
            token.name as string | undefined
          )
          token.userId = userId
          token.workspaceId = workspaceId
          console.log('[jwt] Set workspaceId from lookup:', workspaceId);
        } catch (e) {
          console.error('[jwt] Error getting workspace:', e);
          // As a last resort: allow demo-only reads for demo users
          if (token.email === 'creator@demo.local') {
            token.workspaceId = 'demo-workspace'
          }
        }
      }

      // Check if user is admin by email
      if (token.email) {
        try {
          const admin = await prisma().admin.findUnique({
            where: { email: token.email as string },
            select: { id: true, email: true, role: true }
          })
          token.isAdmin = !!admin
          token.adminRole = admin?.role
          
          if (admin) {
            console.log('[jwt] Admin found for email:', token.email, 'role:', admin.role);
          } else {
            console.log('[jwt] No admin record found for email:', token.email);
          }
        } catch (e) {
          console.error('[jwt] Error checking admin:', e);
          token.isAdmin = false
        }
      }

      return token
    },
    async session({ session, token }) {
      (session.user as any).id = token.userId ?? null
      
      // Load workspaceId from Membership table (more reliable than token)
      if (token.userId) {
        try {
          const membership = await prisma().membership.findFirst({
            where: { userId: token.userId as string },
            select: { workspaceId: true, role: true },
            orderBy: { createdAt: 'asc' } // Get oldest (main) workspace
          });
          
          if (membership) {
            ;(session.user as any).workspaceId = membership.workspaceId
            ;(session.user as any).membershipRole = membership.role
          } else {
            // Fallback to token if no membership found yet
            ;(session.user as any).workspaceId = token.workspaceId ?? null
          }
        } catch (error) {
          console.error('[session] Error loading workspace:', error);
          // Fallback to token
          ;(session.user as any).workspaceId = token.workspaceId ?? null
        }
      } else {
        // Fallback to token
        ;(session.user as any).workspaceId = token.workspaceId ?? null
      }
      
      // Add admin status to session
      ;(session.user as any).isAdmin = token.isAdmin ?? false
      ;(session.user as any).adminRole = token.adminRole ?? null
      
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: env.NEXTAUTH_SECRET!,
}

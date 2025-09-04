import type { NextAuthOptions } from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { env } from '@/lib/env'

async function getOrCreateUserAndWorkspaceByEmail(email: string, name?: string) {
  // Upsert user
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: name ?? email.split('@')[0] },
    select: { id: true, email: true, name: true },
  })

  // Find an existing membership
  const membership = await prisma.membership.findFirst({
    where: { userId: user.id },
    select: { workspaceId: true },
  })

  if (membership?.workspaceId) {
    return { userId: user.id, workspaceId: membership.workspaceId }
  }

  // Create a personal workspace + membership on first login
  const workspace = await prisma.workspace.create({
    data: {
      name: user.name ? `${user.name} Workspace` : 'My Workspace',
      slug: `ws-${user.id.slice(0, 8)}`,
    },
    select: { id: true },
  })

  await prisma.membership.create({
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
        inviteCode: { label: 'Invite Code', type: 'text' },
      },
      async authorize(creds) {
        const inviteRequired = !!process.env.INVITE_CODE;
        if (inviteRequired) {
          if (!creds?.inviteCode || creds.inviteCode !== process.env.INVITE_CODE) {
            throw new Error("INVALID_INVITE_CODE");
          }
        }

        // Demo path (optional)
        if (env.ENABLE_DEMO_AUTH === "1" && creds?.email === "creator@demo.local") {
          console.log('Demo auth: Creating demo user for', creds.email);
          return { id: "demo-user", email: "creator@demo.local", name: "Demo Creator", role: "CREATOR", isDemo: true };
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
    async jwt({ token, user, trigger }) {
      // During sign in, 'user' is available
      if (user?.id) token.userId = user.id as string
      if ((user as any)?.workspaceId) token.workspaceId = (user as any).workspaceId as string

      // If no workspace attached yet, resolve it by email (one-time per account)
      if (!token.workspaceId && token.email) {
        try {
          const { userId, workspaceId } = await getOrCreateUserAndWorkspaceByEmail(
            token.email,
            token.name as string | undefined
          )
          token.userId = userId
          token.workspaceId = workspaceId
        } catch (e) {
          // As a last resort: allow demo-only reads if you've enabled demo
          if (process.env.ENABLE_DEMO_AUTH === '1' || process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH === '1') {
            token.workspaceId = 'demo-workspace' // NOTE: creating new contacts would still require a real workspace row
          }
        }
      }

      return token
    },
    async session({ session, token }) {
      (session.user as any).id = token.userId ?? null
      ;(session.user as any).workspaceId = token.workspaceId ?? null
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: env.NEXTAUTH_SECRET!,
}

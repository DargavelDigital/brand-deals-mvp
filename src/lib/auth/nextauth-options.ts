import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { env } from "@/lib/env"; // your centralized env reader
import { ensureWorkspaceForUser } from "@/lib/workspace/ensureWorkspace";

export function buildAuthOptions(): NextAuthOptions {
  const providers = [];

  providers.push(
    Google({
      clientId: env.GOOGLE_CLIENT_ID!,
      clientSecret: env.GOOGLE_CLIENT_SECRET!,
    })
  );

  providers.push(
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        inviteCode: { label: "Invite Code", type: "text" },
      },
      async authorize(credentials) {
        const inviteRequired = !!process.env.INVITE_CODE;
        if (inviteRequired) {
          if (!credentials?.inviteCode || credentials.inviteCode !== process.env.INVITE_CODE) {
            throw new Error("INVALID_INVITE_CODE");
          }
        }

        // Demo path (optional)
        if (env.ENABLE_DEMO_AUTH === "1" && credentials?.email === "creator@demo.local") {
          console.log('Demo auth: Creating demo user for', credentials.email);
          return { id: "demo-user", email: "creator@demo.local", name: "Demo Creator", role: "CREATOR", isDemo: true };
        }

        // TODO: real user lookup / password check here (or return null to fail)
        // For MVP, allow any email/password if invite passed:
        if (credentials?.email) {
          return { 
            id: credentials.email, 
            email: credentials.email, 
            name: credentials.email.split("@")[0],
            role: "MEMBER",
            isDemo: false
          };
        }

        return null;
      },
    })
  );

  return {
    // Disable Prisma adapter when demo auth is enabled to avoid database issues
    adapter: env.ENABLE_DEMO_AUTH === "1" ? undefined : PrismaAdapter(prisma),
    // Trust Netlify proxy
    trustHost: true,
    providers,
    session: { strategy: "jwt" },
    callbacks: {
      async signIn({ user }) {
        console.log('signIn callback: user', { id: user?.id, email: user?.email, isDemo: (user as any)?.isDemo });
        try {
          // Skip workspace creation for demo users to avoid Prisma issues
          if (user?.id && !(user as any).isDemo) {
            console.log('signIn: Creating workspace for real user', user.id);
            await ensureWorkspaceForUser(user.id);
          } else {
            console.log('signIn: Skipping workspace creation for demo user');
          }
        } catch (e) {
          console.warn('ensureWorkspaceForUser failed', e);
        }
        return true;
      },
      async jwt({ token, user }) {
        if (user) {
          token.user = {
            id: (user as any).id ?? token.sub ?? "",
            email: user.email,
            name: user.name,
            role: (user as any).role ?? "MEMBER",
            isDemo: (user as any).isDemo ?? false,
          };
        }
        return token;
      },
      async session({ session, token }) {
        // For demo users, use hardcoded workspace
        if ((token.user as any)?.isDemo) {
          (session as any).user = token.user ?? null;
          (session as any).user.workspaceId = "demo-workspace";
          (session as any).user.role = "CREATOR";
          return session;
        }
        
        // For real users, pull workspaceId from DB via Membership
        try {
          if (token?.sub) {
            const membership = await prisma.membership.findFirst({
              where: { userId: token.sub },
              select: { workspaceId: true, role: true },
            });
            (session as any).user.role = membership?.role ?? (session as any).user.role ?? 'creator';
            (session as any).user.workspaceId = membership?.workspaceId ?? null;
          }
        } catch {}
        // Preserve the workspaceId and role that were set above
        const workspaceId = (session as any).user.workspaceId;
        const role = (session as any).user.role;
        (session as any).user = token.user ?? null;
        // Restore the workspaceId and role
        if (workspaceId) (session as any).user.workspaceId = workspaceId;
        if (role) (session as any).user.role = role;
        return session;
      },
    },
    pages: { signIn: "/auth/signin" },
    secret: env.NEXTAUTH_SECRET!,
  };
}

export const authOptions = buildAuthOptions();

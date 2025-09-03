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
      credentials: { email: {}, password: {}, inviteCode: {} },
      async authorize(creds) {
        const email = String(creds?.email || "");
        const password = String(creds?.password || "");
        const inviteCode = String(creds?.inviteCode || "");
        
        // Validate invite code
        const validInviteCode = process.env.INVITE_CODE;
        if (validInviteCode && inviteCode !== validInviteCode) {
          throw new Error('INVALID_INVITE');
        }
        
        // Demo auth
        if (env.ENABLE_DEMO_AUTH === "1" && email.endsWith("@demo.local")) {
          console.log('Demo auth: Creating demo user for', email);
          return { id: "demo-user", email, name: "Demo User", role: "MEMBER", isDemo: true };
        }
        // TODO: replace with real DB verify
        return null;
      },
    })
  );

  return {
    // Disable Prisma adapter when demo auth is enabled to avoid database issues
    adapter: env.ENABLE_DEMO_AUTH === "1" ? undefined : PrismaAdapter(prisma),
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

import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { env } from "@/lib/env"; // your centralized env reader
import { ensureWorkspaceForUser } from "@/lib/auth/ensureWorkspace";

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
          return { id: "demo-user", email, name: "Demo User", role: "member", isDemo: true };
        }
        // TODO: replace with real DB verify
        return null;
      },
    })
  );

  return {
    adapter: PrismaAdapter(prisma),
    providers,
    session: { strategy: "jwt" },
    callbacks: {
      async signIn({ user }) {
        try {
          if (user?.id) {
            await ensureWorkspaceForUser(user.id);
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
            role: (user as any).role ?? "member",
            isDemo: (user as any).isDemo ?? false,
          };
        }
        return token;
      },
      async session({ session, token }) {
        // pull workspaceId from DB every time via Membership
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
        (session as any).user = token.user ?? null;
        return session;
      },
    },
    pages: { signIn: "/auth/signin" },
    secret: env.NEXTAUTH_SECRET!,
  };
}

export const authOptions = buildAuthOptions();

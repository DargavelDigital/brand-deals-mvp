import type { NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { env } from "@/lib/env"; // your centralized env reader

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
      credentials: { email: {}, password: {} },
      async authorize(creds) {
        const email = String(creds?.email || "");
        const password = String(creds?.password || "");
        // Demo auth
        if (env.ENABLE_DEMO_AUTH === "1" && email.endsWith("@demo.local")) {
          return { id: "demo-user", email, name: "Demo User", workspaceId: "cmeyc4q1m00032gk3w0pgv4tw", role: "member", isDemo: true };
        }
        // TODO: replace with real DB verify
        return null;
      },
    })
  );

  return {
    providers,
    session: { strategy: "jwt" },
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.user = {
            id: (user as any).id ?? token.sub ?? "",
            email: user.email,
            name: user.name,
            workspaceId: (user as any).workspaceId ?? null,
            role: (user as any).role ?? "member",
            isDemo: (user as any).isDemo ?? false,
          };
        }
        return token;
      },
      async session({ session, token }) {
        (session as any).user = token.user ?? null;
        return session;
      },
    },
    pages: { signIn: "/auth/signin" },
    secret: env.NEXTAUTH_SECRET!,
  };
}

export const authOptions = buildAuthOptions();

import NextAuth, { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string
      workspaceId?: string | null
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string
    workspaceId?: string | null
  }
}

declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_API_INTEGRATIONS_VISIBLE?: string;
  }
}

import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      workspaceId?: string | null;
    }
  }
  
  interface User {
    id: string;
    workspaceId?: string | null;
  }
}

// Extend JWT types
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    workspaceId?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Add your authentication providers here
    // For now, we'll use a simple credentials provider for demo purposes
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub) {
        // Get user from database to include workspaceId
        const user = await prisma.user.findUnique({
          where: { id: token.sub },
          include: { workspace: true }
        });
        
        if (user) {
          session.user = {
            ...session.user,
            id: user.id,
            workspaceId: user.workspaceId
          };
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.workspaceId = user.workspaceId;
      }
      return token;
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

import NextAuth from 'next-auth';
import { buildAuthOptions } from '@/lib/auth/nextauth-options';

const handler = NextAuth(buildAuthOptions());

export { handler as GET, handler as POST };

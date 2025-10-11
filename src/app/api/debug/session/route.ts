import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth-options';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  return Response.json({
    timestamp: new Date().toISOString(),
    session: session,
    user: session?.user,
    hasIsAdmin: 'isAdmin' in (session?.user || {}),
    isAdminValue: (session?.user as any)?.isAdmin,
    adminRole: (session?.user as any)?.adminRole,
    userId: session?.user?.id,
    email: session?.user?.email,
  }, { status: 200 });
}


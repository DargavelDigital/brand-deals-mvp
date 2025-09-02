import { getServerSession } from "next-auth";
import { NextResponse, type NextRequest } from "next/server";
import { buildAuthOptions } from "@/lib/auth/nextauth-options";
import { getRole, type AppRole } from "@/lib/auth/hasRole";

export async function requireSession(req: NextRequest) {
  const session = await getServerSession(buildAuthOptions());
  if (!session?.user?.email) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  return session;
}

export async function requireRole(req: NextRequest, allowedRoles: AppRole[]) {
  const session = await getServerSession(buildAuthOptions());
  if (!session?.user?.email) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  
  const role = getRole(session);
  if (!allowedRoles.includes(role)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  
  return session;
}

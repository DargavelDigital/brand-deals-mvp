import { getServerSession } from "next-auth";
import { NextResponse, type NextRequest } from "next/server";
import { authOptions } from "@/lib/auth/nextauth-options";
import { getRole, type AppRole } from "@/lib/auth/hasRole";

export async function requireSession(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { ok: false, res: NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 }) };
  }
  return { ok: true, session };
}

export async function requireRole(req: NextRequest, allowedRoles: AppRole[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { ok: false, res: NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 }) };
  }
  
  const role = getRole(session);
  if (!allowedRoles.includes(role)) {
    return { ok: false, res: NextResponse.json({ error: "FORBIDDEN" }, { status: 403 }) };
  }
  
  return { ok: true, session };
}

export async function requireSessionWithWorkspace() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) {
    return { ok: false as const, status: 400, error: 'NO_WORKSPACE' };
  }
  return { ok: true as const, session };
}

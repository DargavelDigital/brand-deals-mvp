import { getServerSession } from "next-auth";
import { NextResponse, type NextRequest } from "next/server";
import { buildAuthOptions } from "@/lib/auth/nextauth-options";

export async function requireSession(req: NextRequest) {
  const session = await getServerSession(buildAuthOptions());
  if (!session?.user?.email) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  return session;
}

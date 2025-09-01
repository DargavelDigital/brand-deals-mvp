import { getServerSession } from "next-auth";
import { NextResponse, type NextRequest } from "next/server";
import { buildAuthOptions } from "@/lib/auth/nextauth-options";
import { env } from "@/lib/env";

export async function requireSessionOrDemo(req: NextRequest) {
  const session = await getServerSession(buildAuthOptions());
  
  if (session?.user?.email) {
    return { workspaceId: (session.user as any).workspaceId };
  }
  
  // Demo fallback
  if (env.ENABLE_DEMO_AUTH === "1") {
    return { workspaceId: "demo-workspace" };
  }
  
  throw new NextResponse("Unauthorized", { status: 401 });
}

import { getServerSession } from "next-auth";
import { NextResponse, type NextRequest } from "next/server";
import { buildAuthOptions } from "@/lib/auth/nextauth-options";
import { env } from "@/lib/env";

export async function requireSessionOrDemo(req: NextRequest) {
  const session = await getServerSession(buildAuthOptions());
  
  console.log('requireSessionOrDemo: session?.user?.email:', session?.user?.email);
  console.log('requireSessionOrDemo: env.ENABLE_DEMO_AUTH:', env.ENABLE_DEMO_AUTH);
  console.log('requireSessionOrDemo: env.ENABLE_DEMO_AUTH === "1":', env.ENABLE_DEMO_AUTH === "1");
  
  if (session?.user?.email) {
    console.log('requireSessionOrDemo: returning session workspaceId:', (session.user as any).workspaceId);
    return (session.user as any).workspaceId;
  }
  
  // Demo fallback
  if (env.ENABLE_DEMO_AUTH === "1") {
    console.log('requireSessionOrDemo: returning demo workspaceId: demo-workspace');
    return "demo-workspace";
  }
  
  console.log('requireSessionOrDemo: throwing unauthorized');
  throw new NextResponse("Unauthorized", { status: 401 });
}

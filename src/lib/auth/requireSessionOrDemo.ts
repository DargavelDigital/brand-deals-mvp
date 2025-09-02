import { getServerSession } from "next-auth";
import { NextResponse, type NextRequest } from "next/server";
import { buildAuthOptions } from "@/lib/auth/nextauth-options";
import { env } from "@/lib/env";
import { getRole, type AppRole } from "@/lib/auth/hasRole";

export async function requireSessionOrDemo(req: NextRequest) {
  const session = await getServerSession(buildAuthOptions());
  
  console.log('requireSessionOrDemo: session?.user?.email:', session?.user?.email);
  console.log('requireSessionOrDemo: env.ENABLE_DEMO_AUTH:', env.ENABLE_DEMO_AUTH);
  console.log('requireSessionOrDemo: env.ENABLE_DEMO_AUTH === "1":', env.ENABLE_DEMO_AUTH === "1");
  
  if (session?.user?.email) {
    const workspaceId = (session.user as any).workspaceId;
    console.log('requireSessionOrDemo: session workspaceId:', workspaceId);
    if (workspaceId) {
      return workspaceId;
    }
    // If session exists but no workspaceId, fall through to demo fallback
  }
  
  // Demo fallback
  if (env.ENABLE_DEMO_AUTH === "1" || env.FEATURE_DEMO_AUTH === "true") {
    console.log('requireSessionOrDemo: returning demo workspaceId: demo-workspace');
    return "demo-workspace";
  }
  
  console.log('requireSessionOrDemo: throwing unauthorized');
  throw new NextResponse("Unauthorized", { status: 401 });
}

export async function requireSessionOrDemoWithRole(req: NextRequest, allowedRoles: AppRole[]) {
  const session = await getServerSession(buildAuthOptions());
  
  console.log('requireSessionOrDemoWithRole: session?.user?.email:', session?.user?.email);
  console.log('requireSessionOrDemoWithRole: env.ENABLE_DEMO_AUTH:', env.ENABLE_DEMO_AUTH);
  
  if (session?.user?.email) {
    const role = getRole(session);
    console.log('requireSessionOrDemoWithRole: user role:', role);
    console.log('requireSessionOrDemoWithRole: allowed roles:', allowedRoles);
    
    if (!allowedRoles.includes(role)) {
      console.log('requireSessionOrDemoWithRole: role not allowed, throwing forbidden');
      throw new NextResponse("Forbidden", { status: 403 });
    }
    
    const workspaceId = (session.user as any).workspaceId;
    console.log('requireSessionOrDemoWithRole: session workspaceId:', workspaceId);
    if (workspaceId) {
      return workspaceId;
    }
    // If session exists but no workspaceId, fall through to demo fallback
  }
  
  // Demo fallback - check if demo role is allowed
  if (env.ENABLE_DEMO_AUTH === "1" || env.FEATURE_DEMO_AUTH === "true") {
    const demoRole = 'creator'; // Demo users default to creator role
    console.log('requireSessionOrDemoWithRole: demo role:', demoRole);
    console.log('requireSessionOrDemoWithRole: allowed roles:', allowedRoles);
    
    if (!allowedRoles.includes(demoRole)) {
      console.log('requireSessionOrDemoWithRole: demo role not allowed, throwing forbidden');
      throw new NextResponse("Forbidden", { status: 403 });
    }
    
    console.log('requireSessionOrDemoWithRole: returning demo workspaceId: demo-workspace');
    return "demo-workspace";
  }
  
  console.log('requireSessionOrDemoWithRole: throwing unauthorized');
  throw new NextResponse("Unauthorized", { status: 401 });
}

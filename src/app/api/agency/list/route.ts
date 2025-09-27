import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession().catch(() => null);
  if (!session?.user) {
    // Don't 401 on the dashboard; return empty quietly
    return NextResponse.json({ ok: true, agencies: [] });
  }

  // Optional: only show for users with agency role; else empty list
  const isAgency = session.user.roles?.includes?.("AGENCY");
  if (!isAgency) return NextResponse.json({ ok: true, agencies: [] });

  const agencies = await prisma.workspace.findMany({
    where: { type: "AGENCY", members: { some: { userId: session.user.id } } },
    select: { id: true, name: true }
  });
  return NextResponse.json({ ok: true, agencies });
}


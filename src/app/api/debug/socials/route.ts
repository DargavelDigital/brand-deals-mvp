import { NextResponse } from "next/server";
import { socials } from "@/config/socials";

export async function GET() {
  return NextResponse.json({
    ok: true,
    enabled: socials.listEnabled(),
    instagramOnly: socials.isInstagramOnly(),
    ts: new Date().toISOString(),
  });
}

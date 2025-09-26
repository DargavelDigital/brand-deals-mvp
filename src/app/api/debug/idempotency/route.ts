import { NextResponse } from "next/server";
import { promises as fs } from 'fs';
import { join } from 'path';

export async function GET(req: Request) {
  let allowlist = [];
  try {
    const allowlistPath = join(process.cwd(), 'config', 'idempotency-allowlist.json');
    const allowlistContent = await fs.readFile(allowlistPath, 'utf-8');
    allowlist = JSON.parse(allowlistContent);
  } catch (error) {
    // If file doesn't exist or can't be read, use empty array
    allowlist = [];
  }

  return NextResponse.json({
    ok: true,
    mode: process.env.FEATURE_IDEMPOTENCY_GATE ?? "unset",
    allowlist,
    ts: new Date().toISOString(),
  });
}

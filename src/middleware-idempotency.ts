import { NextResponse } from "next/server";
import micromatch from "micromatch";

// Static import for Edge Runtime compatibility
const allowlist = {
  globs: [
    "/api/auth/**",
    "/api/invite/**",
    "/api/audit/**",
    "/api/match/**"
  ]
};

// Read mode at runtime for testing compatibility
function getMode(): "off"|"warn"|"enforce" {
  return (process.env.FEATURE_IDEMPOTENCY_GATE as any) ?? "warn";
}

export function idempotencyGate(req: Request) {
  const url = new URL(req.url);
  const method = req.method.toUpperCase();
  const pathname = url.pathname;
  const mode = getMode();

  // Log for debugging
  console.log(`[idempotency] ${method} ${pathname} mode=${mode}`);

  // Only gate unsafe methods
  if (!["POST","PUT","PATCH","DELETE"].includes(method)) {
    return NextResponse.next();
  }

  // Remove optional locale prefix like /en/ or /en-GB/
  const normalizedPath = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?\//, "/");

  // Match against allowlist (case-insensitive)
  const isAllowlisted = micromatch.isMatch(normalizedPath, allowlist.globs, { nocase: true });
  if (isAllowlisted) {
    console.log(`[idempotency] allowlisted: ${normalizedPath}`);
    return NextResponse.next();
  }

  // Check for idempotency key (case-insensitive)
  const key = req.headers.get('idempotency-key') || req.headers.get('Idempotency-Key');

  if (!key) {
    if (mode === "enforce") {
      const res = NextResponse.json({
        ok: false,
        code: "IDEMPOTENCY_KEY_REQUIRED",
        path: normalizedPath,
        method,
        mode,
        hasKey: false,
        matchedAllowlist: false
      }, { status: 428 });
      res.headers.set("X-Idempotency-Warning", "missing-key");
      return res;
    }
    // warn mode: pass through but signal
    const res = NextResponse.next();
    res.headers.set("X-Idempotency-Warning", "missing-key");
    return res;
  }

  return NextResponse.next();
}

// IMPORTANT: scope the middleware to API routes only
export const config = { matcher: ["/api/:path*"] };

import { NextResponse } from "next/server";
import micromatch from "micromatch";

const SAFE_DEFAULT_MODE: "off"|"warn"|"enforce" =
  (process.env.FEATURE_IDEMPOTENCY_GATE as any) ?? "warn"; // default to warn if unset at build

// Hardcoded allowlist for Edge Runtime compatibility
const ALLOWLIST = [
  "/api/auth/**"
];

export function idempotencyGate(req: Request) {
  const url = new URL(req.url);
  const method = req.method.toUpperCase();

  // Only gate unsafe methods
  if (!["POST","PUT","PATCH","DELETE"].includes(method)) {
    return NextResponse.next();
  }

  // Remove optional locale prefix like /en/ or /en-GB/
  const normalizedPath = url.pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?\//, "/");

  // Match against allowlist (case-insensitive)
  const isAllowlisted = micromatch.isMatch(normalizedPath, ALLOWLIST, { nocase: true });
  if (isAllowlisted) return NextResponse.next();

  const hasKey = req.headers.has("Idempotency-Key");
  const mode = SAFE_DEFAULT_MODE;

  if (!hasKey) {
    if (mode === "enforce") {
      const res = NextResponse.json({
        ok: false,
        code: "IDEMPOTENCY_KEY_REQUIRED",
        path: normalizedPath,
        method,
        mode,
        hasKey,
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

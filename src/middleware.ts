import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PREFIXES = [
  "/auth",
  "/api/auth",
  "/api/health",
  "/api/debug/flags",
  "/_next", "/assets", "/icons",
  "/favicon.ico", "/manifest.webmanifest", "/sw.js"
];

function isPublic(pathname: string) {
  return PUBLIC_PREFIXES.some(p => pathname === p || pathname.startsWith(p));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Allow root - it redirects to /<locale>/dashboard in app/page.tsx
  if (pathname === "/") return NextResponse.next();
  
  // Allow public paths
  if (isPublic(pathname)) return NextResponse.next();

  // Protect everything else - including all /[locale]/* routes
  const token = await getToken({ req });
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/signin";
    url.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on everything except static assets to keep it simple
    "/((?!_next|favicon.ico|assets|icons|manifest.webmanifest|sw.js).*)",
  ],
};

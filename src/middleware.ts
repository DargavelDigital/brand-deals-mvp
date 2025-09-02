import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { env } from "@/lib/env";

const PUBLIC_PREFIXES = [
  "/auth",
  "/api/auth",
  "/api/health",
  "/api/debug/flags",
  "/api/debug/diag",
  "/api/placeholder",
  "/api/media-pack",
  "/api/brand-run",
  "/media-pack",
  "/brand-run", // Allow brand-run page for demo users
  "/_next", "/assets", "/icons",
  "/favicon.ico", "/manifest.webmanifest", "/sw.js"
];

function isPublic(pathname: string) {
  // Check direct matches and prefixes
  if (PUBLIC_PREFIXES.some(p => pathname === p || pathname.startsWith(p))) {
    return true;
  }
  
  // Check locale-prefixed paths (e.g., /en/brand-run)
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, '');
  return PUBLIC_PREFIXES.some(p => pathWithoutLocale === p || pathWithoutLocale.startsWith(p));
}

function getLocale(pathname: string) {
  const seg = pathname.split('/').filter(Boolean)[0];
  // assume locale is 2-letter or common locales like 'en'
  return seg && seg.length <= 5 ? `/${seg}` : '/en';
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Allow root - it redirects to /<locale>/dashboard in app/page.tsx
  if (pathname === "/") return NextResponse.next();
  
  // Allow public paths
  if (isPublic(pathname)) return NextResponse.next();

  // Protect everything else - including all /[locale]/* routes
  const token = await getToken({ req, secret: env.NEXTAUTH_SECRET });
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/signin";
    url.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

  // Derive role from token
  const role = (token as any)?.role ?? (token as any)?.user?.role ?? 'creator';
  
  // Build locale prefix
  const localePrefix = getLocale(req.nextUrl.pathname);
  
  // Enforce role-based restrictions
  if (pathname.startsWith(`${localePrefix}/admin`) && role !== 'superuser') {
    const url = req.nextUrl.clone();
    url.pathname = `${localePrefix}/dashboard`;
    return NextResponse.redirect(url);
  }
  
  if (pathname.startsWith(`${localePrefix}/settings`) && role === 'agency') {
    const url = req.nextUrl.clone();
    url.pathname = `${localePrefix}/dashboard`;
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

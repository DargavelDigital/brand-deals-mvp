import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { env } from "@/lib/env";

const PUBLIC_PREFIXES = [
  "/auth",
  "/api/auth",
  "/api/health",
  "/api/invite/verify",
  "/api/debug/flags",
  "/api/debug/diag",
  "/api/contacts/diag", // Allow diagnostic endpoint for debugging
  "/api/placeholder",
  "/api/media-pack",
  "/api/brand-run",
  "/api/demo/toggle", // Allow demo toggle for enabling demo mode
  "/api/contacts", // Allow contacts API to handle its own auth
  "/api/agency", // Allow agency API to handle its own auth
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
  // Check if the first segment is a valid locale
  if (seg && ['en', 'es', 'fr'].includes(seg)) {
    return `/${seg}`;
  }
  // Default to 'en' if no valid locale found
  return '/en';
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Allow root - it redirects to /<locale>/dashboard in app/page.tsx
  if (pathname === "/") return NextResponse.next();
  
  // Fix double locale issue (e.g., /en/en/dashboard -> /en/dashboard)
  const doubleLocaleMatch = pathname.match(/^\/([a-z]{2})\/([a-z]{2})\/(.*)$/);
  if (doubleLocaleMatch) {
    const [, locale1, locale2, rest] = doubleLocaleMatch;
    if (locale1 === locale2 && ['en', 'es', 'fr'].includes(locale1)) {
      const url = req.nextUrl.clone();
      url.pathname = `/${locale1}/${rest}`;
      return NextResponse.redirect(url);
    }
  }
  
  // Allow public paths
  if (isPublic(pathname)) return NextResponse.next();

  // Check if this is a staging environment
  const isStaging = process.env.NEXT_PUBLIC_APP_ENV === 'staging' || 
                   req.nextUrl.host.includes('-staging') ||
                   req.nextUrl.host.includes('staging');

  // For staging environments, check invite cookie
  if (isStaging) {
    const inviteCookie = req.cookies.get('invite_ok');
    if (!inviteCookie || inviteCookie.value !== '1') {
      const url = req.nextUrl.clone();
      url.pathname = "/auth/signin";
      url.searchParams.set("reason", "invite");
      return NextResponse.redirect(url);
    }
  }

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

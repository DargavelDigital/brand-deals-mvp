import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { serverEnv } from "@/lib/env";

const PUBLIC_PREFIXES = [
  "/auth",
  "/api/auth",
  "/api/auth/demo", // Allow demo login endpoint
  "/api/health",
  "/api/debug",
  "/api/debug/flags",
  "/api/debug/diag",
  "/api/debug/staging", // Allow staging diagnostic endpoint
  "/api/debug/prisma-env", // Allow Prisma environment diagnostic endpoint
  "/api/debug/env-check", // Allow environment variable check endpoint
  "/api/debug/tiktok", // Allow TikTok debug endpoint
  "/api/debug/tiktok-env", // Allow TikTok environment debug endpoint
  "/api/debug/prisma", // Allow Prisma debug endpoint
  "/api/debug/loader-test", // Allow loader test endpoint
  "/api/auth/selftest", // Allow NextAuth selftest endpoint
  "/api/invite/verify",
  "/api/contacts/diag", // Allow diagnostic endpoint for debugging
  "/api/prisma/diag", // Allow Prisma diagnostic endpoint for debugging
  "/api/admin/bootstrap", // Allow admin bootstrap endpoint (protected by token)
  "/api/placeholder",
  "/api/media-pack",
  "/api/media-pack/file", // proxy route for PDFs
  "/api/media-pack/share", // share and mint endpoints
  "/api/media-pack/print-diag", // Allow print diagnostics endpoint
  "/api/brand-run",
  "/api/demo/toggle", // Allow demo toggle for enabling demo mode
  "/api/contacts", // Allow contacts API to handle its own auth
  "/api/agency", // Allow agency API to handle its own auth
  "/api/tiktok", // Allow all TikTok API endpoints
  "/api/instagram", // Allow Instagram API endpoints
  "/api/audit", // Allow audit API to handle its own auth
  "/api/_pdf-smoke", // Allow PDF smoke test endpoint
  "/media-pack",
  "/media-pack/print", // Allow public print page for PDF generation (no app shell)
  "/media-pack/share", // Allow share route for public PDF access
  "/brand-run", // Allow brand-run page for demo users
  "/.netlify", // Allow Netlify blob storage URLs
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
  
  // Log all requests for debugging
  console.info('[mw]', pathname);
  
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
  if (isPublic(pathname)) {
    console.info('[mw] public path allowed:', pathname);
    return NextResponse.next();
  }

  // Check if this is a staging environment
  const isStaging = process.env.NEXT_PUBLIC_APP_ENV === 'staging' || 
                   req.nextUrl.host.includes('-staging') ||
                   req.nextUrl.host.includes('staging');

  // For staging environments, check invite cookie
  if (isStaging) {
    console.info('[mw] staging environment detected');
    const inviteCookie = req.cookies.get('invite_ok');
    console.info('[mw] invite cookie:', inviteCookie?.value || 'not found');
    if (!inviteCookie || inviteCookie.value !== '1') {
      console.info('[mw] redirecting to signin due to missing invite cookie');
      const url = req.nextUrl.clone();
      url.pathname = "/auth/signin";
      url.searchParams.set("reason", "invite");
      return NextResponse.redirect(url);
    }
  }

  // Protect everything else - including all /[locale]/* routes
  console.info('[mw] checking auth token for:', pathname);
  const token = await getToken({ req, secret: serverEnv.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET });
  console.info('[mw] token found:', !!token, token ? 'user:' + (token as any)?.email : 'no token');
  
  if (!token) {
    console.info('[mw] no token, redirecting to signin');
    const url = req.nextUrl.clone();
    url.pathname = "/auth/signin";
    url.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

  // Derive role from token
  const role = (token as any)?.role ?? (token as any)?.user?.role ?? 'creator';
  console.info('[mw] user role:', role);
  
  // Build locale prefix
  const localePrefix = getLocale(req.nextUrl.pathname);
  
  // Enforce role-based restrictions
  if (pathname.startsWith(`${localePrefix}/admin`) && role !== 'superuser') {
    console.info('[mw] admin access denied for role:', role);
    const url = req.nextUrl.clone();
    url.pathname = `${localePrefix}/dashboard`;
    return NextResponse.redirect(url);
  }
  
  if (pathname.startsWith(`${localePrefix}/settings`) && role === 'agency') {
    console.info('[mw] settings access denied for agency role');
    const url = req.nextUrl.clone();
    url.pathname = `${localePrefix}/dashboard`;
    return NextResponse.redirect(url);
  }
  
  console.info('[mw] access granted for:', pathname);
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on everything except static assets to keep it simple
    "/((?!_next|favicon.ico|assets|icons|manifest.webmanifest|sw.js).*)",
  ],
};

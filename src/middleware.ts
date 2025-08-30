import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from '@/i18n/config'

export default createMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'as-needed', // Keep / for default locale
  localeDetection: true // Enable locale detection
})

export const config = {
  // protect app routes & public pages
  matcher: ['/((?!_next|api|assets|favicon.ico|admin|manifest.webmanifest|sw.js|icons).*)']
}

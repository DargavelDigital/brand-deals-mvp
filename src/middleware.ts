import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from '@/i18n/config'

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // Keep / for default locale
  localeDetection: true, // Enable locale detection
  defaultLocale: 'en' // Explicitly set default locale
})

export const config = {
  // protect app routes & public pages
  matcher: ['/((?!_next|api|assets|favicon.ico).*)']
}

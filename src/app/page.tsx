import { redirect } from 'next/navigation'
import { defaultLocale } from '@/i18n/config'

export default function Root() {
  // For the default locale (en), redirect to /dashboard
  // For other locales, they'll be handled by the [locale] routes
  redirect(`/${defaultLocale}/dashboard`)
}

import { redirect } from 'next/navigation'
import { defaultLocale } from '@/i18n/config'

export default function Dashboard() {
  // Redirect to the locale-specific dashboard
  // The middleware will handle locale detection and set the appropriate locale
  redirect(`/${defaultLocale}/dashboard`)
}

import { redirect } from 'next/navigation'
import { defaultLocale } from '@/i18n/config'

export default function Dashboard() {
  // For the root /dashboard route, redirect to the default locale dashboard
  // This prevents circular redirects when coming from /en -> /dashboard
  redirect(`/${defaultLocale}/dashboard`)
}

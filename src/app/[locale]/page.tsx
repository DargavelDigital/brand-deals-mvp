import { redirect } from 'next/navigation'

export default function LocaleIndex({ params }: { params: { locale: string } }) {
  // This page handles /en, /es, /fr routes
  // For default locale (en), redirect to /dashboard
  // For other locales, redirect to /{locale}/dashboard
  if (params.locale === 'en') {
    redirect('/dashboard')
  } else {
    redirect(`/${params.locale}/dashboard`)
  }
}

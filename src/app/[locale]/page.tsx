import { redirect } from 'next/navigation'

export default async function LocaleIndex({ params }: { params: Promise<{ locale: string }> }) {
  // This page handles /en, /es, /fr routes
  // With always-prefix routing, redirect to /{locale}/dashboard for all locales
  const { locale } = await params
  redirect(`/${locale}/dashboard`)
}

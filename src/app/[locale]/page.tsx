import { redirect } from 'next/navigation'

export default function LocaleIndex() {
  // This page handles /en, /es, /fr routes
  // It will redirect to the dashboard for that locale
  redirect('/dashboard')
}

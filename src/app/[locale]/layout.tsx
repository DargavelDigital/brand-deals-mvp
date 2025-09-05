import { NextIntlClientProvider } from 'next-intl'
import { notFound } from 'next/navigation'
import { getMessages } from '@/i18n/getMessages'
import { locales, type Locale } from '@/i18n/config'
import type { Metadata } from 'next'
import AppShell from "@/components/shell/AppShell"
import LocaleProvider from "@/components/i18n/LocaleProvider"
import ErrorBoundary from "@/components/common/ErrorBoundary"
import SiteFooter from '@/components/layout/SiteFooter'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    alternates: {
      languages: {
        en: '/en',
        es: '/es',
        fr: '/fr'
      }
    }
  }
}

export default async function LocaleLayout({
  children, params
}: { children: React.ReactNode; params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  if (!locales.includes(locale)) notFound()
  const messages = await getMessages(locale)
  
  return (
    <ErrorBoundary fallback={<div className="text-[var(--muted-fg)] p-4">Something didn't load. Please check settings.</div>}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <LocaleProvider />
        <AppShell>{children}</AppShell>
        <SiteFooter />
      </NextIntlClientProvider>
    </ErrorBoundary>
  )
}

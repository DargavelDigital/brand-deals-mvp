import { NextIntlClientProvider } from 'next-intl'
import { notFound } from 'next/navigation'
import { getMessages } from '@/i18n/getMessages'
import { locales, type Locale } from '@/i18n/config'
import type { Metadata } from 'next'
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher"

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

export default async function PublicLayout({
  children, params
}: { children: React.ReactNode; params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  if (!locales.includes(locale)) notFound()
  const messages = await getMessages(locale)
  
  return (
    <html suppressHydrationWarning>
      <body suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="min-h-screen bg-[var(--bg)]">
            <div className="border-b border-[var(--border)] bg-[var(--card)]">
              <div className="container-page flex items-center justify-between py-3">
                <div className="text-sm font-medium text-[var(--muted-fg)]">
                  Hyper
                </div>
                <LanguageSwitcher />
              </div>
            </div>
            <main className="container-page py-12">
              {children}
            </main>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

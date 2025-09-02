'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { locales } from '@/i18n/config'

export default function LanguageSwitcher() {
  const locale = useLocale()
  const t = useTranslations()
  const pathname = usePathname()
  const router = useRouter()

  function switchTo(next: string) {
    const segs = pathname.split('/')
    segs[1] = next // replace locale segment
    const nextPath = segs.join('/')
    // persist via cookie; middleware will honor it
    document.cookie = `NEXT_LOCALE=${next}; Path=/; Max-Age=31536000; SameSite=Lax`
    router.push(nextPath)
  }

  // Filter out French locale from the UI while keeping translations intact
  const visibleLocales = locales.filter(l => l !== 'fr')

  return (
    <div className="inline-flex gap-2" role="group" aria-label="Language">
      {visibleLocales.map(l => (
        <button
          key={l}
          onClick={() => switchTo(l)}
          aria-pressed={locale === l}
          className={`h-8 px-2.5 rounded-md border border-[var(--border)] bg-[var(--surface)] text-sm ${locale===l?'font-medium':'opacity-70 hover:opacity-100'}`}
        >
          {l==='en'?t('lang.english'):l==='es'?t('lang.spanish'):t('lang.french')}
        </button>
      ))}
    </div>
  )
}

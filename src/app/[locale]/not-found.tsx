import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'

export default function NotFound() {
  const t = useTranslations()
  const locale = useLocale()
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-[var(--muted)]">404</h1>
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">
          Page Not Found
        </h2>
        <p className="text-[var(--muted-foreground)] max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link 
          href={`/${locale}/dashboard`}
          className="inline-flex items-center px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-md hover:bg-[var(--primary)]/90 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}

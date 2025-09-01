'use client'
import Link from 'next/link'
import { Mail, CheckCircle2, Sparkles } from 'lucide-react'
import { useLocale } from 'next-intl'

export function QuickActions() {
  const locale = useLocale()
  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 md:hidden">
      <div className="mx-auto max-w-md px-4">
        <div className="flex items-center justify-between rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-md px-4 py-3">
          <Link href={`/${locale}/tools/outreach`} className="flex flex-col items-center text-sm">
            <Mail className="w-5 h-5 mb-1" /> Follow-up
          </Link>
          <Link href={`/${locale}/tools/matches`} className="flex flex-col items-center text-sm">
            <CheckCircle2 className="w-5 h-5 mb-1" /> Approve
          </Link>
          <Link href={`/${locale}/brand-run?oneTouch=1`} className="flex flex-col items-center text-sm">
            <Sparkles className="w-5 h-5 mb-1" /> One-Touch
          </Link>
        </div>
      </div>
    </div>
  )
}

import Link from 'next/link'
import { SITE } from '@/lib/site'

export default function SiteFooter() {
  return (
    <footer className="border-t bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-muted-foreground flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="leading-none">
          © {new Date().getFullYear()} {SITE.COMPANY_LEGAL_NAME}
        </p>
        <nav className="flex gap-5">
          <Link href="/terms" className="hover:text-foreground underline-offset-4 hover:underline">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:text-foreground underline-offset-4 hover:underline">
            Privacy Policy
          </Link>
        </nav>
      </div>
    </footer>
  )
}

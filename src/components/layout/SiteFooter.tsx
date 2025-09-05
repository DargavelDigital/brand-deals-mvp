import Link from 'next/link'
import { useLocale } from 'next-intl'

export default function SiteFooter() {
  const locale = useLocale()

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--card)] mt-auto">
      <div className="container-page py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand section */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Hyper by Hype & Swagger</h3>
            <p className="text-[var(--muted-fg)] text-sm mb-4">
              The ultimate platform for brand deals and creator partnerships. 
              Connect with brands, manage deals, and grow your business.
            </p>
          </div>

          {/* Legal links */}
          <div>
            <h4 className="font-medium mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href={`/${locale}/terms`}
                  className="text-[var(--muted-fg)] hover:text-[var(--text)] text-sm transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link 
                  href={`/${locale}/privacy`}
                  className="text-[var(--muted-fg)] hover:text-[var(--text)] text-sm transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h4 className="font-medium mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href={`/${locale}/dashboard`}
                  className="text-[var(--muted-fg)] hover:text-[var(--text)] text-sm transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link 
                  href={`/${locale}/settings`}
                  className="text-[var(--muted-fg)] hover:text-[var(--text)] text-sm transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-[var(--border)] mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[var(--muted-fg)] text-sm">
              © {new Date().getFullYear()} Hyper by Hype & Swagger. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-[var(--muted-fg)]">
              <span>Made with ❤️ for creators</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

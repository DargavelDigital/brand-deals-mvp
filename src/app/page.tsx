import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-8 max-w-2xl mx-auto px-6">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-[var(--text)]">
            Hyper
          </h1>
          <p className="text-xl text-[var(--muted)]">
            The ultimate platform for creators to discover brand partnerships and grow their business.
          </p>
        </div>
        <p className="text-[var(--muted)]">
          AI-powered brand discovery, automated outreach, and professional media packs.
        </p>
        <div className="flex gap-4 justify-center">
          <Link 
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md font-medium transition-standard focus-visible:outline-2 focus-visible:outline-[var(--accent)] disabled:opacity-60 disabled:cursor-not-allowed h-11 px-5 text-base bg-[color:var(--accent)] text-white hover:brightness-95"
          >
            Get Started
          </Link>
          <Link 
            href="/tools"
            className="inline-flex items-center justify-center rounded-md font-medium transition-standard focus-visible:outline-2 focus-visible:outline-[var(--accent)] disabled:opacity-60 disabled:cursor-not-allowed h-11 px-5 text-base bg-surface text-[var(--text)] border border-[var(--border)] hover:bg-[color:var(--muted)]/10"
          >
            Explore Tools
          </Link>
        </div>
      </div>
    </div>
  )
}

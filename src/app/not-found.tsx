import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-semibold text-[var(--text)]">
          Page not found
        </h2>
        <p className="text-[var(--muted-fg)] max-w-md">
          Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="px-4 py-2 bg-[var(--accent)] text-white rounded-md hover:brightness-95 transition-all"
          >
            Go home
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-md hover:bg-[var(--muted)]/10 transition-all"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

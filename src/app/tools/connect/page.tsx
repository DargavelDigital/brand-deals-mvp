export const runtime = 'nodejs' // Prisma-safe if used
import ConnectGrid from '@/components/connect/ConnectGrid'

export const metadata = {
  title: 'Connect Accounts',
  description: 'Connect your social profiles to power audits, matching, and outreach.',
}

export default function ConnectToolPage() {
  return (
    <div className="space-y-4">
      <div className="card p-5 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Connect Accounts</h1>
            <p className="mt-1 text-sm text-[var(--muted-fg)]">
              Link your social profiles. We'll keep connections healthy and notify you before they expire.
            </p>
          </div>
        </div>
      </div>

      <ConnectGrid />
    </div>
  )
}

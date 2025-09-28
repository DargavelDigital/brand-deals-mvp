export const runtime = 'nodejs' // Prisma-safe if used
import ConnectGrid from '@/components/connect/ConnectGrid'
import { isToolEnabled } from '@/lib/launch'
import { ComingSoon } from '@/components/ComingSoon'
import PageShell from '@/components/PageShell'

export const metadata = {
  title: 'Connect Accounts',
  description: 'Connect your social profiles to power audits, matching, and outreach.',
}

export default function ConnectToolPage() {
  const enabled = isToolEnabled("connect")
  
  return (
    <PageShell title="Connect Accounts" subtitle="Link your social profiles to power audits, matching, and outreach.">
      {enabled ? (
        <ConnectGrid />
      ) : (
        <div className="mx-auto max-w-md">
          <ComingSoon
            title="Connect Accounts"
            subtitle="This tool will be enabled soon. The page is visible so you can navigate and preview the UI."
          />
        </div>
      )}
    </PageShell>
  )
}

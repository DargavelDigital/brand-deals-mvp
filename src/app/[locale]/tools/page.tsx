'use client'

import Link from 'next/link'

export default function ToolsIndexPage() {
  const tools = [
    { name: 'Connect Accounts', href: '/tools/connect', description: 'Link your social media accounts for data sync' },
    { name: 'Run AI Audit', href: '/tools/audit', description: 'Analyze brand compatibility and performance' },
    { name: 'Generate Matches', href: '/tools/matches', description: 'Find optimal brand-creator partnerships' },
    { name: 'Approve Brands', href: '/tools/approve', description: 'Review and approve brand partnerships' },
    { name: 'Build Media Pack', href: '/tools/pack', description: 'Create professional media kits' },
    { name: 'Discover Contacts', href: '/tools/contacts', description: 'Manage your contact database' },
    { name: 'Start Outreach', href: '/tools/outreach', description: 'Launch targeted outreach campaigns' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tools</h1>
        <p className="text-[var(--muted-fg)]">
          Access all the tools you need to run your brand partnerships from start to finish.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href} className="card p-4 hover:shadow-md transition-shadow">
            <h3 className="font-medium">{tool.name}</h3>
            <p className="mt-1 text-sm text-[var(--muted-fg)]">{tool.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

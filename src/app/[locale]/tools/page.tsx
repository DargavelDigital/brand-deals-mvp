'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { useLocale } from 'next-intl'

export default function ToolsIndexPage() {
  const locale = useLocale();
  const tools = [
    { 
      name: 'Connect Accounts', 
      href: `/${locale}/tools/connect`, 
      description: 'Link your social media accounts for data sync',
      category: 'Setup'
    },
    { 
      name: 'Run AI Audit', 
      href: `/${locale}/tools/audit`, 
      description: 'Analyze brand compatibility and performance',
      category: 'Analysis'
    },
    { 
      name: 'Generate Matches', 
      href: `/${locale}/tools/matches`, 
      description: 'Find optimal brand-creator partnerships',
      category: 'Discovery'
    },
    { 
      name: 'Approve Brands', 
      href: `/${locale}/tools/approve`, 
      description: 'Review and approve brand partnerships',
      category: 'Management'
    },
    { 
      name: 'Build Media Pack', 
      href: `/${locale}/tools/pack`, 
      description: 'Create professional media kits',
      category: 'Content'
    },
    { 
      name: 'Discover Contacts', 
      href: `/${locale}/tools/contacts`, 
      description: 'Manage your contact database',
      category: 'Management'
    },
    { 
      name: 'Start Outreach', 
      href: `/${locale}/tools/outreach`, 
      description: 'Launch targeted outreach campaigns',
      category: 'Outreach'
    },
  ]

  const categories = ['Setup', 'Analysis', 'Discovery', 'Management', 'Content', 'Outreach']

  return (
    <div className="space-y-6">
      <Card className="p-6 border-[var(--border)] bg-gradient-to-r from-[var(--card)] to-[var(--muted)]/20">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Tools Hub</h1>
            <p className="text-[var(--muted-fg)] max-w-2xl">
              Access all the tools you need to run your brand partnerships from start to finish. 
              From AI-powered audits to outreach automation.
            </p>
          </div>
          
          <div className="flex gap-2">
            <Link href={`/${locale}/tools/connect`}>
              <button className="px-4 py-2 text-sm border border-[var(--border)] rounded-md hover:bg-[var(--muted)] transition-colors">
                Connect
              </button>
            </Link>
            <Link href={`/${locale}/tools/matches`}>
              <button className="px-2 py-2 text-sm border border-[var(--border)] rounded-md hover:bg-[var(--muted)] transition-colors">
                Matches
              </button>
            </Link>
            <Link href={`/${locale}/tools/outreach`}>
              <button className="px-4 py-2 text-sm border border-[var(--border)] rounded-md hover:bg-[var(--muted)] transition-colors">
                Outreach
              </button>
            </Link>
          </div>
        </div>
      </Card>

      {categories.map(category => (
        <div key={category} className="space-y-3">
          <h2 className="text-lg font-medium text-[var(--fg)] border-b border-[var(--border)] pb-2">
            {category}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools
              .filter(tool => tool.category === category)
              .map((tool) => (
                <Link key={tool.href} href={tool.href}>
                  <Card className="p-4 hover:shadow-md transition-shadow border-[var(--border)]">
                    <h3 className="font-medium">{tool.name}</h3>
                    <p className="mt-1 text-sm text-[var(--muted-fg)]">{tool.description}</p>
                  </Card>
                </Link>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}

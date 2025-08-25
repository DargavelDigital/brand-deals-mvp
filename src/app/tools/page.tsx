import Link from 'next/link'
import { Wrench, Gauge, BadgeCheck, CheckSquare, Images, Users, Send } from 'lucide-react'

export default function ToolsPage() {
  const items = [
    { href: '/tools/connect', label: 'Connect Accounts', icon: Wrench, desc: 'Link socials for data sync' },
    { href: '/tools/audit', label: 'Run AI Audit', icon: Gauge, desc: 'Analyze audience & content' },
    { href: '/tools/matches', label: 'Generate Matches', icon: BadgeCheck, desc: 'Find aligned brands' },
    { href: '/tools/approve', label: 'Approve Brands', icon: CheckSquare, desc: 'Pick targets' },
    { href: '/tools/pack', label: 'Build Media Pack', icon: Images, desc: 'Generate a tailored pack' },
    { href: '/tools/contacts', label: 'Discover Contacts', icon: Users, desc: 'Find decision makers' },
    { href: '/tools/outreach', label: 'Start Outreach', icon: Send, desc: 'Kick off sequences' },
  ]

  return (
    <div className="container-max">
      <h1 className="text-3xl font-bold mb-1">Tools</h1>
      <p className="text-[var(--muted-fg)] mb-6">Run any step on its own. Results flow into your Brand Run.</p>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(({ href, label, icon: Icon, desc }) => (
          <Link key={href} href={href} className="card p-4 hover:bg-[var(--muted)] transition-colors">
            <div className="flex items-center gap-3">
              <div className="size-8 grid place-items-center rounded-lg bg-[var(--muted)] text-[var(--brand-600)]">
                <Icon className="size-4" />
              </div>
              <div>
                <div className="font-medium">{label}</div>
                <div className="text-xs text-[var(--muted-fg)]">{desc}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

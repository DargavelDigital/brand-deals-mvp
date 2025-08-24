import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BrandIcons } from './BrandIcons'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: BrandIcons.Home },
  { href: '/brand-run', label: 'Brand Run', icon: BrandIcons.Waypoints },
  { href: '/tools/connect', label: 'Connect Accounts', icon: BrandIcons.Users },
  { href: '/tools/audit', label: 'AI Audit', icon: BrandIcons.CheckCircle2 },
  { href: '/tools/matches', label: 'Brand Matches', icon: BrandIcons.PlayCircle },
  { href: '/tools/approve', label: 'Approve Brands', icon: BrandIcons.CheckCircle2 },
  { href: '/tools/pack', label: 'Generate Media Pack', icon: BrandIcons.PlayCircle },
  { href: '/tools/contacts', label: 'Discover Contacts', icon: BrandIcons.Users },
  { href: '/tools/outreach', label: 'Outreach', icon: BrandIcons.PlayCircle },
  { href: '/tools/workflow', label: 'Workflow', icon: BrandIcons.Waypoints },
  { href: '/crm', label: 'CRM', icon: BrandIcons.Users },
  { href: '/outreach', label: 'Outreach', icon: BrandIcons.PlayCircle },
  { href: '/swipe', label: 'Swipe', icon: BrandIcons.PlayCircle },
  { href: '/settings', label: 'Settings', icon: BrandIcons.Settings },
]

export default function SidebarNav() {
  const pathname = usePathname()
  return (
    <nav className="px-3 py-2 space-y-1">
      {NAV.map((i)=> {
        const Active = pathname.startsWith(i.href)
        const Icon = i.icon
        return (
          <Link key={i.href} href={i.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl ${Active ? 'bg-muted font-medium' : 'hover:bg-muted'}`}>
            <Icon className="size-4" aria-hidden /> <span>{i.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

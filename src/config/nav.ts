export type NavItem = { href: string; label: string; icon: string }
export const NAV: NavItem[] = [
  { href: '/dashboard',   label: 'Dashboard',        icon: 'Home' },
  { href: '/brand-run',   label: 'Brand Run',        icon: 'Workflow' },
  { href: '/tools/connect', label: 'Connect Accounts', icon: 'Users' },
  { href: '/tools/audit',   label: 'AI Audit',         icon: 'Gauge' },
  { href: '/tools/matches', label: 'Brand Matches',    icon: 'BadgeCheck' },
  { href: '/tools/approve', label: 'Approve Brands',   icon: 'CheckSquare' },
  { href: '/tools/pack',    label: 'Generate Media Pack', icon: 'Images' },
  { href: '/tools/contacts',label: 'Discover Contacts', icon: 'AddressBook' },
  { href: '/outreach',    label: 'Outreach',          icon: 'Send' },
  { href: '/workflow',    label: 'Workflow',          icon: 'Waypoints' },
  { href: '/crm',         label: 'CRM',               icon: 'Kanban' },
  { href: '/settings',    label: 'Settings',          icon: 'Settings' }
]

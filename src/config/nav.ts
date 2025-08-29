export type NavItem = { href: string; label: string; icon: string }
export type NavGroup = { 
  title: string; 
  items: NavItem[];
  collapsible?: boolean;
}

export const NAV: NavGroup[] = [
  {
    title: '',
    items: [
      { href: '/dashboard', label: 'nav.dashboard', icon: 'Home' },
      { href: '/brand-run', label: 'nav.brandRun', icon: 'Waypoints' },
      { href: '/contacts',  label: 'Contacts',  icon: 'Users' },
      { href: '/crm',       label: 'CRM',       icon: 'Kanban' },
      { href: '/settings',  label: 'Settings',  icon: 'Settings' },
    ]
  },
  {
    title: 'Tools',
    items: [
      { href: '/tools/connect',  label: 'tools.connect', icon: 'Wrench' },
      { href: '/tools/audit',    label: 'tools.audit',    icon: 'Gauge' },
      { href: '/tools/matches',  label: 'tools.matches', icon: 'BadgeCheck' },
      { href: '/tools/approve',  label: 'tools.approve', icon: 'CheckSquare' },
      { href: '/tools/pack',     label: 'tools.pack', icon: 'Images' },
      { href: '/tools/contacts', label: 'tools.contacts', icon: 'Users' },
      { href: '/tools/outreach', label: 'tools.outreach',   icon: 'Send' },
      { href: '/outreach/inbox', label: 'Outreach Inbox',   icon: 'Inbox' },
      { href: '/tools/import', label: 'Import Data',       icon: 'Upload' },
    ]
  }
]

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
      { href: '/dashboard', label: 'Dashboard', icon: 'Home' },
      { href: '/brand-run', label: 'Brand Run', icon: 'Waypoints' },
      { href: '/contacts',  label: 'Contacts',  icon: 'Users' },
      { href: '/crm',       label: 'CRM',       icon: 'Kanban' },
      { href: '/settings',  label: 'Settings',  icon: 'Settings' },
    ]
  },
  {
    title: 'Tools',
    items: [
      { href: '/tools/connect',  label: 'Connect Accounts', icon: 'Wrench' },
      { href: '/tools/audit',    label: 'Run AI Audit',    icon: 'Gauge' },
      { href: '/tools/matches',  label: 'Generate Matches', icon: 'BadgeCheck' },
      { href: '/tools/approve',  label: 'Approve Brands',  icon: 'CheckSquare' },
      { href: '/tools/pack',     label: 'Build Media Pack', icon: 'Images' },
      { href: '/tools/contacts', label: 'Discover Contacts', icon: 'Users' },
      { href: '/tools/outreach', label: 'Start Outreach',   icon: 'Send' },
    ],
    collapsible: true
  }
]

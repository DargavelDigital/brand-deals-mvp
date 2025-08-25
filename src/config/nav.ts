export type NavGroup = { title: string; items: { href: string; label: string; icon: string }[] }

export const NAV: NavGroup[] = [
  { 
    title: '', 
    items: [ 
      { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' } 
    ] 
  },
  { 
    title: 'CRM', 
    items: [
      { href: '/contacts', label: 'Contacts', icon: 'Users' },
      { href: '/crm', label: 'Leads/Deals', icon: 'BadgeDollarSign' },
      { href: '/outreach', label: 'Brand Outreach', icon: 'Send' },
      { href: '/brand-run', label: 'Brand Run', icon: 'Workflow' },
    ]
  },
  { 
    title: 'Automation', 
    items: [
      { href: '/tools/workflow', label: 'Workflows', icon: 'Workflow' },
      { href: '/tools/audit', label: 'Audit Tools', icon: 'Gauge' },
      { href: '/tools/matches', label: 'Brand Matching', icon: 'Zap' },
      { href: '/tools/approve', label: 'Approvals', icon: 'CheckSquare' },
    ]
  },
  { 
    title: 'Content & Media', 
    items: [
      { href: '/tools/pack', label: 'Media Packs', icon: 'Images' },
      { href: '/tools/connect', label: 'Platform Connect', icon: 'Plug' },
      { href: '/tools/contacts', label: 'Contact Discovery', icon: 'Users' },
      { href: '/tools/outreach', label: 'Outreach Tools', icon: 'Send' },
    ]
  },
  { 
    title: 'Settings', 
    items: [ 
      { href: '/settings', label: 'Settings', icon: 'Settings' } 
    ] 
  },
]

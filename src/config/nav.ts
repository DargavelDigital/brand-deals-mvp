import type { AppRole } from '@/lib/auth/hasRole';

export type NavItem = { href: string; label: string; icon: string; allowedRoles?: Array<'creator'|'agency'|'superuser'>; badge?: number; indent?: boolean }
export type NavGroup = { 
  title: string; 
  items: NavItem[];
  collapsible?: boolean;
}

export const NAV: NavGroup[] = [
  {
    title: '',
    items: [
      { href: '/dashboard', label: 'nav.dashboard', icon: 'Home', allowedRoles: ['creator', 'agency', 'superuser'] },
    ]
  },
  {
    title: 'Workflow',
    items: [
      { href: '/tools/connect',  label: 'tools.connect', icon: 'Wrench', allowedRoles: ['creator', 'agency', 'superuser'] },
      { href: '/tools/audit',    label: 'tools.audit',    icon: 'Gauge', allowedRoles: ['creator', 'agency', 'superuser'] },
      { href: '/tools/matches',  label: 'tools.matches', icon: 'BadgeCheck', allowedRoles: ['creator', 'agency', 'superuser'] },
      { href: '/tools/contacts', label: 'tools.contacts', icon: 'Users', allowedRoles: ['creator', 'agency', 'superuser'] },
      { href: '/tools/pack',     label: 'tools.pack', icon: 'Images', allowedRoles: ['creator', 'agency', 'superuser'] },
      { href: '/tools/outreach', label: 'tools.outreach',   icon: 'Send', allowedRoles: ['creator', 'agency', 'superuser'] },
      { href: '/outreach/inbox', label: 'Outreach Inbox',   icon: 'Inbox', allowedRoles: ['creator', 'agency', 'superuser'], indent: true },
    ]
  },
  {
    title: 'Business',
    items: [
      { href: '/crm',       label: 'CRM',       icon: 'Kanban', allowedRoles: ['creator', 'agency', 'superuser'] },
      { href: '/tools/deal-desk', label: 'Deal Desk', icon: 'DollarSign', allowedRoles: ['creator', 'agency', 'superuser'] },
    ]
  },
  {
    title: 'Admin',
    items: [
      { href: '/admin', label: 'Admin Console', icon: 'Shield', allowedRoles: ['superuser'] },
    ]
  },
  {
    title: 'Settings',
    items: [
      { href: '/settings',  label: 'Settings',  icon: 'Settings', allowedRoles: ['creator', 'superuser'] },
      { href: '/tools/import', label: 'Import Data',       icon: 'Upload', allowedRoles: ['creator', 'agency', 'superuser'] },
    ]
  }
]

export function filterNavForRole(items: NavItem[], role: AppRole) {
  return items.filter((it) => {
    if (!it.allowedRoles) return role !== 'agency' || ( // agency gets restricted set
      it.href === '/dashboard' ||
      it.href === '/crm' ||
      it.href === '/tools/connect' ||
      it.href === '/tools/audit' ||
      it.href === '/tools/matches' ||
      it.href === '/tools/pack' ||
      it.href === '/tools/contacts' ||
      it.href === '/tools/outreach' ||
      it.href === '/outreach/inbox' ||
      it.href === '/tools/import' ||
      it.href === '/tools/deal-desk'
    );
    return it.allowedRoles.includes(role);
  });
}

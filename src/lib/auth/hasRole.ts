export type AppRole = 'creator' | 'agency' | 'superuser';

export function getRole(session: any): AppRole {
  // Be defensive: some apps put role on session.user, others on session
  const role = session?.user?.role ?? session?.role ?? 'creator';
  if (role === 'agency' || role === 'superuser') return role;
  return 'creator';
}

export function hasRole(session: any, allowed: AppRole[] = ['creator']): boolean {
  const role = getRole(session);
  return allowed.includes(role);
}

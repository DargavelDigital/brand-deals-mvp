export type AppRole = 'creator' | 'agency' | 'superuser';

export function getRole(session: any): AppRole {
  // PRIORITY 1: Check if user is admin (from Admin table)
  if (session?.user?.isAdmin) {
    return 'superuser';
  }
  
  // PRIORITY 2: Check explicit role field
  const role = session?.user?.role ?? session?.role;
  if (role === 'agency' || role === 'superuser') return role;
  
  // PRIORITY 3: Default to creator
  return 'creator';
}

export function hasRole(session: any, allowed: AppRole[] = ['creator']): boolean {
  const role = getRole(session);
  return allowed.includes(role);
}

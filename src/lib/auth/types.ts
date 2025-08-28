export type AppRole = 'owner' | 'admin' | 'member' | 'viewer';

export const RoleOrder: Record<AppRole, number> = {
  owner: 4,
  admin: 3,
  member: 2,
  viewer: 1,
};

export function roleAtLeast(userRole: AppRole, need: AppRole) {
  return RoleOrder[userRole] >= RoleOrder[need];
}

export interface SessionUser {
  id: string;
  email: string;
  role?: AppRole;
  workspaceId?: string;
}

export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
};

export type UserWorkspaceRole = 'OWNER' | 'MANAGER' | 'MEMBER' | 'VIEWER';

export type AuthContext = {
  user: SessionUser;
  workspaceId: string;
  role: UserWorkspaceRole;
  isDemo: boolean;
};

// Legacy types for backward compatibility
export type AppRole = 'owner' | 'manager' | 'member' | 'viewer';

export const RoleOrder: Record<AppRole, number> = {
  owner: 4,
  manager: 3,
  member: 2,
  viewer: 1
};

export function roleAtLeast(have: AppRole, need: AppRole): boolean {
  return RoleOrder[have] >= RoleOrder[need];
}

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

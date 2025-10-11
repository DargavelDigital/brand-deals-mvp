import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      workspaceId?: string;
      isAdmin?: boolean;
      adminRole?: 'SUPER' | 'SUPPORT';
    } & DefaultSession["user"]
  }
  
  interface JWT {
    userId?: string;
    workspaceId?: string;
    isAdmin?: boolean;
    adminRole?: 'SUPER' | 'SUPPORT';
  }
}

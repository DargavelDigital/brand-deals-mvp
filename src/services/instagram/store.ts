import { prisma } from '@/lib/prisma'

/** Instagram connection data from database */
export type IgConn = {
  workspaceId: string
  userAccessToken: string       // long-lived token
  igUserId: string              // Instagram user ID (externalId)
  username?: string
  expiresAt?: string            // ISO (optional)
}

export async function saveIgConnection(conn: IgConn) {
  // Store in database via socialAccount table
  await prisma().socialAccount.upsert({
    where: {
      workspaceId_platform: {
        workspaceId: conn.workspaceId,
        platform: 'instagram'
      }
    },
    update: {
      externalId: conn.igUserId,
      username: conn.username || '',
      accessToken: conn.userAccessToken,
      tokenExpiresAt: conn.expiresAt ? new Date(conn.expiresAt) : null,
    },
    create: {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      workspaceId: conn.workspaceId,
      platform: 'instagram',
      externalId: conn.igUserId,
      username: conn.username || '',
      accessToken: conn.userAccessToken,
      tokenExpiresAt: conn.expiresAt ? new Date(conn.expiresAt) : null,
    }
  })
}

export async function loadIgConnection(workspaceId: string): Promise<IgConn | null> {
  // Load from database
  const account = await prisma().socialAccount.findFirst({
    where: {
      workspaceId,
      platform: 'instagram'
    }
  })

  if (!account || !account.accessToken || !account.externalId) {
    return null
  }

  return {
    workspaceId: account.workspaceId,
    userAccessToken: account.accessToken,
    igUserId: account.externalId,
    username: account.username || undefined,
    expiresAt: account.tokenExpiresAt?.toISOString() || undefined
  }
}

export async function deleteIgConnection(workspaceId: string) {
  // Delete from database
  await prisma().socialAccount.deleteMany({
    where: {
      workspaceId,
      platform: 'instagram'
    }
  })
}

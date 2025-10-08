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
  console.error('🔴 loadIgConnection: Loading Instagram account for workspaceId:', workspaceId)
  
  // Load from database
  const account = await prisma().socialAccount.findFirst({
    where: {
      workspaceId,
      platform: 'instagram'
    }
  })

  console.error('🔴 loadIgConnection: Account found:', !!account)
  console.error('🔴 loadIgConnection: Has accessToken:', !!account?.accessToken)
  console.error('🔴 loadIgConnection: Has externalId:', !!account?.externalId)
  console.error('🔴 loadIgConnection: Full accessToken being used:', account?.accessToken)
  console.error('🔴 loadIgConnection: Token length:', account?.accessToken?.length)
  console.error('🔴 loadIgConnection: Token first 50 chars:', account?.accessToken?.substring(0, 50))

  if (!account || !account.accessToken || !account.externalId) {
    console.error('🔴 loadIgConnection: RETURNING NULL - missing account, accessToken, or externalId')
    return null
  }

  const result = {
    workspaceId: account.workspaceId,
    userAccessToken: account.accessToken,
    igUserId: account.externalId,
    username: account.username || undefined,
    expiresAt: account.tokenExpiresAt?.toISOString() || undefined
  }
  
  console.error('🔴 loadIgConnection: Returning connection data:', {
    workspaceId: result.workspaceId,
    igUserId: result.igUserId,
    username: result.username,
    hasUserAccessToken: !!result.userAccessToken,
    userAccessTokenLength: result.userAccessToken?.length
  })

  return result
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

import { prisma } from '@/lib/prisma'
import { encrypt, decrypt } from '@/lib/crypto/secretBox'

export async function setSecret(workspaceId: string | null, key: string, value: string) {
  const { enc, iv, tag } = encrypt(value)
  return prisma().encryptedSecret.upsert({
    where: { workspaceId_key: { workspaceId: workspaceId ?? null, key } },
    update: { enc, iv, tag },
    create: { workspaceId, key, enc, iv, tag },
  })
}

export async function getSecret(workspaceId: string | null, key: string) {
  const row = await prisma().encryptedSecret.findUnique({ where: { workspaceId_key: { workspaceId: workspaceId ?? null, key } } })
  if (!row) return null
  const buf = decrypt(row.enc, row.iv, row.tag)
  return buf.toString('utf8')
}

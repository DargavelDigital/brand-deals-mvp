import { PrismaClient } from '@prisma/client'
import { env } from '../env'

let prisma: PrismaClient | null = null

function makePrisma() {
  if (!env.DATABASE_URL) {
    if (env.NODE_ENV !== 'production') {
      console.warn('❗ DATABASE_URL not set — prisma disabled, API should fail-soft.')
    }
    return null
  }
  return new PrismaClient()
}

export function getPrisma() {
  if (!prisma) prisma = makePrisma()
  return prisma
}

// Export prisma instance for backward compatibility
export { prisma }

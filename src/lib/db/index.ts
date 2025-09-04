import { prisma } from '@/lib/prisma'

export function getPrisma() {
  return prisma
}

// Export prisma instance for backward compatibility
export { prisma }

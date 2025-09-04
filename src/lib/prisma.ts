import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: ['error'] });
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Runtime check to ensure Prisma is properly connected
export async function ensurePrismaConnection() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required for database operations');
  }
  
  try {
    await prisma.$connect();
    return true;
  } catch (error) {
    throw new Error('Database connection failed');
  }
}

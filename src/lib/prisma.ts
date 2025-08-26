import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Create Prisma client with error handling for missing DATABASE_URL
function createPrismaClient(): PrismaClient {
  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  } catch (error) {
    console.warn('⚠️  Prisma client creation failed:', error);
    console.warn('💡 This may happen during build time when DATABASE_URL is not available');
    
    // Return a mock client for build time
    return {
      $connect: async () => {},
      $disconnect: async () => {},
      $queryRaw: async () => [],
      $executeRaw: async () => 0,
      $transaction: async (fn: any) => fn(),
      // Add other commonly used methods as needed
    } as any;
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

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
    console.error('❌ Failed to connect to database:', error);
    throw new Error('Database connection failed');
  }
}

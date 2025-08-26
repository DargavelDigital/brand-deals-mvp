import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Create Prisma client with error handling for missing DATABASE_URL
function createPrismaClient(): PrismaClient {
  // Check if DATABASE_URL is available
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.error('💡 This is required for database operations');
    console.error('🌐 Please set DATABASE_URL in your environment variables');
    
    // Return a mock client that provides clear error messages
    return {
      $connect: async () => {
        throw new Error('DATABASE_URL environment variable is not set. Please configure your database connection.');
      },
      $disconnect: async () => {},
      $queryRaw: async () => {
        throw new Error('DATABASE_URL environment variable is not set. Please configure your database connection.');
      },
      $executeRaw: async () => {
        throw new Error('DATABASE_URL environment variable is not set. Please configure your database connection.');
      },
      $transaction: async (fn: any) => {
        throw new Error('DATABASE_URL environment variable is not set. Please configure your database connection.');
      },
      // Add other commonly used methods as needed
      workspace: {
        findUnique: async () => {
          throw new Error('DATABASE_URL environment variable is not set. Please configure your database connection.');
        },
        findMany: async () => {
          throw new Error('DATABASE_URL environment variable is not set. Please configure your database connection.');
        },
        create: async () => {
          throw new Error('DATABASE_URL environment variable is not set. Please configure your database connection.');
        },
        update: async () => {
          throw new Error('DATABASE_URL environment variable is not set. Please configure your database connection.');
        },
        delete: async () => {
          throw new Error('DATABASE_URL environment variable is not set. Please configure your database connection.');
        }
      },
      contact: {
        findUnique: async () => {
          throw new Error('DATABASE_URL environment variable is not set. Please configure your database connection.');
        },
        findMany: async () => {
          throw new Error('DATABASE_URL environment variable is not set. Please configure your database connection.');
        },
        create: async () => {
          throw new Error('DATABASE_URL environment variable is not set. Please configure your database connection.');
        },
        update: async () => {
          throw new Error('DATABASE_URL environment variable is not set. Please configure your database connection.');
        },
        delete: async () => {
          throw new Error('DATABASE_URL environment variable is not set. Please configure your database connection.');
        }
      }
    } as any;
  }
  
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

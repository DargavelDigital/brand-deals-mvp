// ✅ DO use the normal client
import { PrismaClient } from '@prisma/client'

// ❌ DO NOT use edge or accelerate anywhere
// import { PrismaClient } from '@prisma/client/edge'
// import { withAccelerate } from '@prisma/extension-accelerate'

// Optional: tiny runtime log for verification
const prisma = globalThis.__prisma ?? new PrismaClient();
if (!globalThis.__prisma) {
  console.info(
    '[prisma] init engine=binary urlPrefix=%s',
    process.env.DATABASE_URL?.split(':')[0] ?? 'missing'
  );
  (globalThis as any).__prisma = prisma;
}

// Export both named and default for compatibility
export { prisma };
export default prisma;

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

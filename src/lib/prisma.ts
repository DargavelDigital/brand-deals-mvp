import { PrismaClient } from '@prisma/client';

// @ts-ignore
const g = globalThis as any;

let _prisma: PrismaClient | null = null;

export function prisma(): PrismaClient {
  if (!_prisma) {
    _prisma = g.__prisma ?? new PrismaClient();
    
    if (!g.__prisma) {
      const prefix = process.env.DATABASE_URL?.split(':')[0] ?? 'missing';
      const engine = process.env.PRISMA_QUERY_ENGINE_TYPE ?? 'unset';
      console.info('[prisma:init] engine=binary expected=true urlPrefix=%s envEngine=%s', prefix, engine);
      g.__prisma = _prisma;
    }
  }
  
  return _prisma;
}

// Export both named and default for compatibility
export { prisma as default };

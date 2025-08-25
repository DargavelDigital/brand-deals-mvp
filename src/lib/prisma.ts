// Mock Prisma client for static export
const mockPrisma = {
  brandRun: {
    findFirst: () => null,
    create: () => ({}),
    update: () => ({}),
    findMany: () => [],
  },
  audit: {
    findFirst: () => null,
    create: () => ({}),
    findMany: () => [],
  },
  brand: {
    findMany: () => [],
    findFirst: () => null,
  },
  contact: {
    findMany: () => [],
    create: () => ({}),
  },
  sequence: {
    create: () => ({}),
    findFirst: () => null,
  },
  mediaPack: {
    create: () => ({}),
    findFirst: () => null,
  },
  $connect: () => Promise.resolve(),
  $disconnect: () => Promise.resolve(),
};

// Use mock client for static export, real client for development
export const prisma = process.env.NODE_ENV === 'production' && process.env.STATIC_EXPORT 
  ? mockPrisma 
  : (() => {
      try {
        const { PrismaClient } = require('@prisma/client');
        return new PrismaClient();
      } catch {
        return mockPrisma;
      }
    })();

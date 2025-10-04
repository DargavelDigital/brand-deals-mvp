import { PrismaClient } from "@prisma/client";
const globalForPrisma = global as any;
const prismaInstance = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prismaInstance;

// Export prisma as a function that returns the instance
export const prisma = () => prismaInstance;
export { prismaInstance };
export function db() { return prismaInstance; }
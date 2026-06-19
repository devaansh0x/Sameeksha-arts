/**
 * Prisma Client Singleton
 *
 * Prevents multiple PrismaClient instances in development due to hot-reloading.
 * In production a single instance is created and reused.
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

export default prisma;

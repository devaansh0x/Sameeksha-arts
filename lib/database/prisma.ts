/**
 * Prisma Client Singleton
 *
 * Returns null when DATABASE_URL is not set so pages can fall back to
 * mock data gracefully instead of crashing.
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient | null };

function createPrismaClient(): PrismaClient | null {
    if (!process.env.DATABASE_URL) {
        // No database configured — pages will use mock data
        return null;
    }
    try {
        return new PrismaClient();
    } catch {
        return null;
    }
}

export const prisma: PrismaClient | null =
    globalForPrisma.prisma !== undefined
        ? globalForPrisma.prisma
        : createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

export default prisma;

/**
 * Collection Management API Endpoint
 * POST /api/admin/collection
 *
 * Handles collection creation with validation and unique slug generation.
 *
 * Requirements: 12.1, 12.2
 * Task: 8.1
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/database/prisma';

// ============================================================================
// Input Schema
// ============================================================================

/**
 * Schema for creating a collection via POST.
 * Slug is auto-generated from the name, so it is not accepted as input.
 */
const createCollectionSchema = z.object({
    name: z
        .string()
        .min(1, 'Collection name is required')
        .max(100, 'Collection name must not exceed 100 characters'),
    description: z
        .string()
        .min(10, 'Description must be at least 10 characters')
        .max(2000, 'Description must not exceed 2000 characters'),
});

// ============================================================================
// Slug Helpers
// ============================================================================

/**
 * Generate a URL-safe slug from a collection name.
 * Converts to lowercase, replaces spaces with hyphens, strips special characters.
 */
export function generateBaseSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')         // spaces → hyphens
        .replace(/[^a-z0-9-]/g, '')   // strip anything not a-z, 0-9, or hyphen
        .replace(/-+/g, '-')          // collapse consecutive hyphens
        .replace(/^-|-$/g, '');       // trim leading/trailing hyphens
}

/**
 * Ensure the slug is unique within the Collection table.
 * If the base slug already exists, appends -2, -3, etc. until a free one is found.
 */
async function ensureUniqueSlug(baseSlug: string): Promise<string> {
    let candidate = baseSlug;
    let counter = 2;

    while (true) {
        const existing = await prisma.collection.findUnique({
            where: { slug: candidate },
            select: { id: true },
        });

        if (!existing) {
            return candidate;
        }

        candidate = `${baseSlug}-${counter}`;
        counter += 1;
    }
}

// ============================================================================
// POST /api/admin/collection
// ============================================================================

/**
 * Create a new collection.
 *
 * Body: { name: string; description: string }
 * Returns 201 with the created collection on success.
 */
export async function POST(request: NextRequest) {
    try {
        // --- Authentication ---
        const session = await getSession();
        if (!session || !session.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized. Please log in to manage collections.' },
                { status: 401 }
            );
        }

        // --- Parse & Validate ---
        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON body.' },
                { status: 400 }
            );
        }

        const parsed = createCollectionSchema.safeParse(body);
        if (!parsed.success) {
            const errors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
            return NextResponse.json(
                { success: false, errors },
                { status: 400 }
            );
        }

        const { name, description } = parsed.data;

        // --- Slug Generation ---
        const baseSlug = generateBaseSlug(name);
        const slug = await ensureUniqueSlug(baseSlug);

        // --- Database Insertion ---
        let collection;
        try {
            collection = await prisma.collection.create({
                data: { name, slug, description },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    description: true,
                    createdAt: true,
                    updatedAt: true,
                    _count: { select: { artworks: true } },
                },
            });
        } catch (dbError: unknown) {
            // Prisma unique constraint violation code
            const isPrismaUniqueError =
                typeof dbError === 'object' &&
                dbError !== null &&
                'code' in dbError &&
                (dbError as { code: string }).code === 'P2002';

            if (isPrismaUniqueError) {
                return NextResponse.json(
                    {
                        success: false,
                        error: `A collection named "${name}" already exists. Please choose a different name.`,
                    },
                    { status: 409 }
                );
            }

            throw dbError; // Let the outer catch produce a 500
        }

        return NextResponse.json(
            { success: true, collection },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error in POST /api/admin/collection:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error
                    ? `Failed to create collection: ${error.message}`
                    : 'An unexpected error occurred. Please try again.',
            },
            { status: 500 }
        );
    }
}

// ============================================================================
// All other methods → 405
// ============================================================================

export async function GET() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use POST to create a collection.' },
        { status: 405 }
    );
}

export async function PUT() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use POST to create a collection.' },
        { status: 405 }
    );
}

export async function DELETE() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use POST to create a collection.' },
        { status: 405 }
    );
}

/**
 * Collection Management API Endpoint
 * PUT /api/admin/collection/[id]
 *
 * Handles updating an existing collection with validation, optional slug
 * regeneration when the name changes, and cache revalidation.
 *
 * Requirements: 12.4, 12.5
 * Task: 8.2
 */

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/database/prisma';
import { generateBaseSlug } from '@/lib/utils/slugify'

// ============================================================================
// Input Schema
// ============================================================================

/**
 * Schema for updating a collection via PUT.
 * Both name and description are required; slug is auto-regenerated if name changes.
 */
const updateCollectionSchema = z.object({
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
// Slug Helper (update-aware)
// ============================================================================

/**
 * Ensure the slug is unique within the Collection table,
 * excluding the collection being updated (by its current slug).
 *
 * If the base slug already exists (and it's not the current collection),
 * appends -2, -3, … until a free candidate is found.
 */
async function ensureUniqueSlugForUpdate(
    baseSlug: string,
    excludeSlug: string
): Promise<string> {
    let candidate = baseSlug;
    let counter = 2;

    while (true) {
        // The current collection owns its own slug, so skip it
        if (candidate === excludeSlug) {
            return candidate;
        }

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
// PUT /api/admin/collection/[id]
// ============================================================================

/**
 * Update an existing collection.
 *
 * Body: { name: string; description: string }
 * Returns 200 with the updated collection on success.
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // --- Authentication ---
        const session = await getSession();
        if (!session || !session.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized. Please log in to manage collections.' },
                { status: 401 }
            );
        }

        const { id } = params;

        // --- Parse & Validate Body ---
        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON body.' },
                { status: 400 }
            );
        }

        const parsed = updateCollectionSchema.safeParse(body);
        if (!parsed.success) {
            const errors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
            return NextResponse.json(
                { success: false, errors },
                { status: 400 }
            );
        }

        const { name, description } = parsed.data;

        // --- Check collection exists ---
        const existing = await prisma.collection.findUnique({
            where: { id },
            select: { id: true, name: true, slug: true },
        });

        if (!existing) {
            return NextResponse.json(
                { success: false, error: 'Collection not found.' },
                { status: 404 }
            );
        }

        // --- Slug regeneration ---
        // Only regenerate the slug if the name has actually changed.
        let newSlug = existing.slug;
        if (name !== existing.name) {
            const baseSlug = generateBaseSlug(name);
            newSlug = await ensureUniqueSlugForUpdate(baseSlug, existing.slug);
        }

        // --- Database Update ---
        let collection;
        try {
            collection = await prisma.collection.update({
                where: { id },
                data: { name, slug: newSlug, description },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    description: true,
                    updatedAt: true,
                    _count: { select: { artworks: true } },
                },
            });
        } catch (dbError: unknown) {
            // Prisma unique constraint violation
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

        // --- Cache revalidation ---
        try {
            revalidatePath('/work');
        } catch {
            // Non-fatal: revalidation failure should not prevent a successful response
        }

        return NextResponse.json(
            { success: true, collection },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in PUT /api/admin/collection/[id]:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error
                    ? `Failed to update collection: ${error.message}`
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
        { success: false, error: 'Method not allowed. Use PUT to update a collection.' },
        { status: 405 }
    );
}

export async function POST() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use PUT to update a collection.' },
        { status: 405 }
    );
}

export async function DELETE() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use PUT to update a collection.' },
        { status: 405 }
    );
}

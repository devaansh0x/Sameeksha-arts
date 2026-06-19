/**
 * Artwork Update API Endpoint
 * PUT /api/admin/artwork/[id]
 *
 * Handles artwork updates with Zod validation, image reordering/replacement,
 * timestamp updates, and SSG revalidation.
 *
 * Requirements: 10.4, 10.5, 10.7, 11.6, 11.7
 * Task: 7.2
 */

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/database/prisma';
import { artworkSchema } from '@/lib/validation/validationSchemas';

/**
 * PUT /api/admin/artwork/[id]
 * Update an existing artwork record with image associations.
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // 1. Authentication check
        const session = await getSession();
        if (!session || !session.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized. Please log in to manage artwork.' },
                { status: 401 }
            );
        }

        // 2. Extract the artwork ID from route params
        const { id } = params;

        // 3. Parse JSON body
        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON body.' },
                { status: 400 }
            );
        }

        // 4. Validate with Zod artworkSchema
        const parseResult = artworkSchema.safeParse(body);
        if (!parseResult.success) {
            const errors: Record<string, string[]> = {};
            for (const issue of parseResult.error.issues) {
                const field = issue.path.join('.') || 'general';
                if (!errors[field]) {
                    errors[field] = [];
                }
                errors[field].push(issue.message);
            }
            return NextResponse.json(
                { success: false, errors },
                { status: 400 }
            );
        }

        const data = parseResult.data;

        // 5. Check that the artwork exists
        const existing = await prisma.artwork.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json(
                { success: false, error: 'Artwork not found.' },
                { status: 404 }
            );
        }

        // 6. Perform update in a transaction:
        //    - Update the Artwork record
        //    - Delete all existing ArtworkImage records
        //    - Re-create ArtworkImage records from the new imageIds array
        const artwork = await prisma.$transaction(async (tx) => {
            // Update the artwork record
            const updated = await tx.artwork.update({
                where: { id },
                data: {
                    title: data.title,
                    slug: data.slug,
                    description: data.description,
                    story: data.story ?? '',
                    medium: data.medium,
                    dimensions: data.dimensions,
                    year: data.year,
                    availabilityStatus: data.availabilityStatus,
                    published: data.published,
                    collectionId: data.collectionId ?? null,
                },
            });

            // Delete all existing image associations
            await tx.artworkImage.deleteMany({
                where: { artworkId: id },
            });

            // Re-create image associations; first image (index 0) is primary
            if (data.imageIds.length > 0) {
                await tx.artworkImage.createMany({
                    data: data.imageIds.map((mediaAssetId, index) => ({
                        artworkId: updated.id,
                        mediaAssetId,
                        order: index,
                        isPrimary: index === 0,
                    })),
                });
            }

            // Return the updated artwork with all relations
            return tx.artwork.findUniqueOrThrow({
                where: { id: updated.id },
                include: {
                    collection: {
                        select: { id: true, name: true, slug: true },
                    },
                    images: {
                        orderBy: { order: 'asc' },
                        select: {
                            id: true,
                            mediaAssetId: true,
                            order: true,
                            isPrimary: true,
                            mediaAsset: {
                                select: {
                                    thumbnailUrl: true,
                                    mediumUrl: true,
                                    originalUrl: true,
                                },
                            },
                        },
                    },
                },
            });
        });

        // 7. Trigger SSG revalidation (wrapped in try/catch to avoid breaking the response)
        try {
            revalidatePath('/');
            revalidatePath('/work');
            revalidatePath(`/work/${artwork.slug}`);
        } catch (revalidateError) {
            console.warn('Revalidation failed (non-fatal):', revalidateError);
        }

        // 8. Return 200 with the updated artwork
        return NextResponse.json(
            {
                success: true,
                artwork: {
                    id: artwork.id,
                    title: artwork.title,
                    slug: artwork.slug,
                    description: artwork.description,
                    story: artwork.story,
                    medium: artwork.medium,
                    dimensions: artwork.dimensions,
                    year: artwork.year,
                    availabilityStatus: artwork.availabilityStatus,
                    published: artwork.published,
                    collection: artwork.collection ?? undefined,
                    images: artwork.images,
                    createdAt: artwork.createdAt.toISOString(),
                    updatedAt: artwork.updatedAt.toISOString(),
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in PUT /api/admin/artwork/[id]:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'An unexpected error occurred. Please try again.',
            },
            { status: 500 }
        );
    }
}

/**
 * Handle all non-PUT methods with 405.
 */
export async function GET() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use PUT to update artwork.' },
        { status: 405 }
    );
}

export async function POST() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use PUT to update artwork.' },
        { status: 405 }
    );
}

export async function DELETE() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use PUT to update artwork.' },
        { status: 405 }
    );
}

/**
 * Artwork Management API Endpoint
 * POST /api/admin/artwork
 *
 * Handles artwork creation with Zod validation, image associations,
 * draft/publish logic, and full response with relations.
 *
 * Requirements: 10.1, 10.2, 10.7, 10.8
 * Task: 7.1
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/database/prisma';
import { artworkSchema } from '@/lib/validation/validationSchemas';

/**
 * Generate a URL-safe slug from a title string.
 * Lowercases, replaces spaces with hyphens, removes non-alphanumeric chars.
 */
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

/**
 * POST /api/admin/artwork
 * Create a new artwork record with image associations.
 */
export async function POST(request: NextRequest) {
    try {
        // Authentication check
        const session = await getSession();
        if (!session || !session.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized. Please log in to manage artwork.' },
                { status: 401 }
            );
        }

        // Parse JSON body
        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON body.' },
                { status: 400 }
            );
        }

        // If no slug provided, auto-generate from title before validation
        if (
            body !== null &&
            typeof body === 'object' &&
            !Array.isArray(body)
        ) {
            const bodyObj = body as Record<string, unknown>;
            if (!bodyObj.slug && typeof bodyObj.title === 'string' && bodyObj.title.length > 0) {
                bodyObj.slug = generateSlug(bodyObj.title);
            }
        }

        // Validate with Zod artworkSchema
        const parseResult = artworkSchema.safeParse(body);
        if (!parseResult.success) {
            // Build field-specific errors map
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

        // Create Artwork record and ArtworkImage join records in a transaction
        const artwork = await prisma.$transaction(async (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => {
            // Create the artwork
            const created = await tx.artwork.create({
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

            // Create ArtworkImage join records
            // First image (index 0) is primary
            if (data.imageIds.length > 0) {
                await tx.artworkImage.createMany({
                    data: data.imageIds.map((mediaAssetId, index) => ({
                        artworkId: created.id,
                        mediaAssetId,
                        order: index,
                        isPrimary: index === 0,
                    })),
                });
            }

            // Return the artwork with all relations
            return tx.artwork.findUniqueOrThrow({
                where: { id: created.id },
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

        // Build and return the response
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
            { status: 201 }
        );
    } catch (error) {
        console.error('Error in POST /api/admin/artwork:', error);

        // Handle unique constraint violations (e.g. duplicate slug)
        if (
            error instanceof Error &&
            error.message.includes('Unique constraint failed') &&
            error.message.includes('slug')
        ) {
            return NextResponse.json(
                {
                    success: false,
                    errors: { slug: ['A slug with this value already exists. Please use a different slug.'] },
                },
                { status: 400 }
            );
        }

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
 * Handle all non-POST methods with 405.
 */
export async function GET() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use POST to create artwork.' },
        { status: 405 }
    );
}

export async function PUT() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use POST to create artwork.' },
        { status: 405 }
    );
}

export async function DELETE() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use POST to create artwork.' },
        { status: 405 }
    );
}

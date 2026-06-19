/**
 * Public Artwork API Endpoint
 * GET /api/artwork/[slug]
 *
 * Returns a single published artwork by slug, including collection
 * and ordered image data. No authentication required.
 *
 * Requirements: 2.1-2.9
 * Task: 7.4
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';

interface RouteParams {
    params: { slug: string };
}

/**
 * GET /api/artwork/[slug]
 * Fetch a single published artwork by its slug.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { slug } = params;

        if (!slug || typeof slug !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Invalid slug parameter.' },
                { status: 400 }
            );
        }

        const artwork = await prisma.artwork.findFirst({
            where: {
                slug,
                published: true,
            },
            include: {
                collection: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                images: {
                    orderBy: { order: 'asc' },
                    include: {
                        mediaAsset: {
                            select: {
                                id: true,
                                originalUrl: true,
                                thumbnailUrl: true,
                                mediumUrl: true,
                                width: true,
                                height: true,
                            },
                        },
                    },
                },
            },
        });

        if (!artwork) {
            return NextResponse.json(
                { success: false, error: 'Artwork not found.' },
                { status: 404 }
            );
        }

        // Shape the response per design spec
        const response = {
            id: artwork.id,
            title: artwork.title,
            slug: artwork.slug,
            description: artwork.description,
            story: artwork.story,
            medium: artwork.medium,
            dimensions: artwork.dimensions,
            year: artwork.year,
            availabilityStatus: artwork.availabilityStatus,
            collection: artwork.collection ?? undefined,
            images: artwork.images.map((img) => ({
                id: img.id,
                url: img.mediaAsset.originalUrl,
                alt: artwork.title,
                width: img.mediaAsset.width,
                height: img.mediaAsset.height,
                thumbnailUrl: img.mediaAsset.thumbnailUrl,
                mediumUrl: img.mediaAsset.mediumUrl,
            })),
            createdAt: artwork.createdAt.toISOString(),
            updatedAt: artwork.updatedAt.toISOString(),
        };

        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        console.error('Error in GET /api/artwork/[slug]:', error);
        return NextResponse.json(
            { success: false, error: 'An unexpected error occurred. Please try again.' },
            { status: 500 }
        );
    }
}

/**
 * Handle all non-GET methods with 405.
 */
export async function POST() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed.' },
        { status: 405 }
    );
}

export async function PUT() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed.' },
        { status: 405 }
    );
}

export async function DELETE() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed.' },
        { status: 405 }
    );
}

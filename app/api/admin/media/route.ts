/**
 * Media Library API Endpoint
 * GET /api/admin/media
 *
 * Returns paginated media assets with support for search by filename
 * and filtering by upload date.
 *
 * Requirements: 18.1, 18.2, 18.6, 18.7
 * Task: 14.1
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/database/prisma';

/**
 * GET /api/admin/media
 *
 * Query parameters:
 *   search  - case-insensitive filename contains filter
 *   from    - ISO date string, lower bound for uploadedAt (inclusive)
 *   to      - ISO date string, upper bound for uploadedAt (inclusive)
 *   page    - page number (default: 1)
 *   limit   - items per page (default: 20, max: 100)
 */
export async function GET(request: NextRequest) {
    try {
        // Authentication check
        const session = await getSession();
        if (!session || !session.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized. Please log in to access the media library.' },
                { status: 401 }
            );
        }

        const { searchParams } = request.nextUrl;

        // Parse and validate query parameters
        const search = searchParams.get('search') ?? undefined;
        const fromParam = searchParams.get('from') ?? undefined;
        const toParam = searchParams.get('to') ?? undefined;

        const rawPage = parseInt(searchParams.get('page') ?? '1', 10);
        const rawLimit = parseInt(searchParams.get('limit') ?? '20', 10);

        const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
        const limit = isNaN(rawLimit) || rawLimit < 1 ? 20 : Math.min(rawLimit, 100);
        const skip = (page - 1) * limit;

        // Build Prisma where clause
        const where: {
            filename?: { contains: string; mode: 'insensitive' };
            uploadedAt?: { gte?: Date; lte?: Date };
        } = {};

        if (search) {
            where.filename = { contains: search, mode: 'insensitive' };
        }

        if (fromParam || toParam) {
            where.uploadedAt = {};
            if (fromParam) {
                const fromDate = new Date(fromParam);
                if (!isNaN(fromDate.getTime())) {
                    where.uploadedAt.gte = fromDate;
                }
            }
            if (toParam) {
                const toDate = new Date(toParam);
                if (!isNaN(toDate.getTime())) {
                    where.uploadedAt.lte = toDate;
                }
            }
        }

        // Execute count and find in parallel for efficiency
        const [total, assets] = await Promise.all([
            prisma.mediaAsset.count({ where }),
            prisma.mediaAsset.findMany({
                where,
                orderBy: { uploadedAt: 'desc' },
                skip,
                take: limit,
                select: {
                    id: true,
                    filename: true,
                    thumbnailUrl: true,
                    originalUrl: true,
                    smallUrl: true,
                    mediumUrl: true,
                    largeUrl: true,
                    width: true,
                    height: true,
                    size: true,
                    mimeType: true,
                    uploadedAt: true,
                },
            }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            success: true,
            media: assets.map((asset) => ({
                id: asset.id,
                filename: asset.filename,
                thumbnailUrl: asset.thumbnailUrl,
                originalUrl: asset.originalUrl,
                smallUrl: asset.smallUrl,
                mediumUrl: asset.mediumUrl,
                largeUrl: asset.largeUrl,
                width: asset.width,
                height: asset.height,
                size: asset.size,
                mimeType: asset.mimeType,
                uploadedAt: asset.uploadedAt.toISOString(),
            })),
            pagination: {
                total,
                page,
                limit,
                totalPages,
            },
        });
    } catch (error) {
        console.error('Error in GET /api/admin/media:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error
                    ? `Failed to retrieve media: ${error.message}`
                    : 'An unexpected error occurred while retrieving media.',
            },
            { status: 500 }
        );
    }
}

/**
 * Catch-all for non-GET methods on this route
 */
export async function POST() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use POST /api/admin/media/upload to upload media.' },
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
        { success: false, error: 'Method not allowed. Use DELETE /api/admin/media/[id] to delete a specific asset.' },
        { status: 405 }
    );
}

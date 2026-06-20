/**
 * Media Asset Delete API Endpoint
 * DELETE /api/admin/media/[id]
 *
 * Deletes a media asset by ID. If the asset is in use by one or more artworks,
 * returns a warning instead of deleting. The client must call again with
 * ?force=true to confirm deletion of an in-use asset.
 *
 * Requirements: 18.4, 18.5, 11.8
 * Task: 14.2
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/database/prisma';
import { deleteImage } from '@/lib/cloudinary';

/**
 * DELETE /api/admin/media/[id]
 *
 * Query parameters:
 *   force  - set to "true" to delete even if the asset is in use by artworks
 *
 * Behaviour:
 *   1. Requires authentication → 401 if not authenticated
 *   2. Checks asset exists → 404 if not found
 *   3. Counts artwork usages:
 *      - If in use AND force !== "true": returns 200 with success:false and a warning
 *      - If not in use OR force === "true": proceeds with deletion
 *   4. Deletes the DB record (cascades to ArtworkImage rows)
 *   5. Attempts to delete all Cloudinary images (non-fatal if CDN fails)
 *   6. Returns 200 { success: true }
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // 1. Authentication check
        const session = await getSession();
        if (!session || !session.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized. Please log in to manage media.' },
                { status: 401 }
            );
        }

        const { id } = params;
        const force = request.nextUrl.searchParams.get('force') === 'true';

        // 2. Check asset exists
        const asset = await prisma.mediaAsset.findUnique({
            where: { id },
        });

        if (!asset) {
            return NextResponse.json(
                { success: false, error: 'Media asset not found.' },
                { status: 404 }
            );
        }

        // 3. Count artworks using this asset
        const artworkCount = await prisma.artworkImage.count({
            where: { mediaAssetId: id },
        });

        if (artworkCount > 0 && !force) {
            // Return warning — do NOT delete yet
            return NextResponse.json(
                {
                    success: false,
                    warning: `This image is used in ${artworkCount} artwork(s). Delete anyway?`,
                    inUse: true,
                    artworkCount,
                },
                { status: 200 }
            );
        }

        // 4. Delete the MediaAsset DB record (cascades to ArtworkImage rows via schema onDelete: Cascade)
        await prisma.mediaAsset.delete({
            where: { id },
        });

        // 5. Attempt to delete all image files from Cloudinary
        // CDN errors are non-fatal — the DB record is already gone
        const cloudinaryUrls = [
            asset.originalUrl,
            asset.thumbnailUrl,
            asset.smallUrl,
            asset.mediumUrl,
            asset.largeUrl,
        ].filter(Boolean);

        await Promise.allSettled(
            cloudinaryUrls.map((url) => {
                // Extract the public_id from the Cloudinary URL.
                // Cloudinary URLs follow: .../upload/[transformations/]<public_id>.<ext>
                // We need everything after /upload/ (and optional transformation segments)
                // up to (but not including) the file extension.
                try {
                    const publicId = extractCloudinaryPublicId(url);
                    if (publicId) {
                        return deleteImage(publicId);
                    }
                } catch {
                    // ignore extraction errors
                }
                return Promise.resolve();
            })
        );

        // 6. Return success
        return NextResponse.json(
            { success: true, message: 'Media deleted successfully.' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in DELETE /api/admin/media/[id]:', error);
        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? `Failed to delete media: ${error.message}`
                        : 'An unexpected error occurred. Please try again.',
            },
            { status: 500 }
        );
    }
}

/**
 * Extract the Cloudinary public_id from a full Cloudinary URL.
 * Moved here from route file — Next.js route files cannot export non-handler functions.
 */
function extractCloudinaryPublicId(url: string): string | null {
    if (!url) return null;

    try {
        // Find "/upload/" in the URL
        const uploadIndex = url.indexOf('/upload/');
        if (uploadIndex === -1) return null;

        // Take everything after "/upload/"
        let path = url.slice(uploadIndex + '/upload/'.length);

        // Strip a leading version segment like "v1234567890/"
        path = path.replace(/^v\d+\//, '');

        // Strip Cloudinary transformation segments (contain commas or known prefixes)
        // Transformation segments don't contain '/' as the first char and contain
        // known transformation identifiers like w_, h_, f_, q_, e_, c_
        const parts = path.split('/');
        const firstNonTransform = parts.findIndex(
            (part) => !/^[a-z_]+_/.test(part) && !part.includes(',')
        );
        if (firstNonTransform > 0) {
            path = parts.slice(firstNonTransform).join('/');
        }

        // Remove file extension
        const dotIndex = path.lastIndexOf('.');
        if (dotIndex !== -1) {
            path = path.slice(0, dotIndex);
        }

        return path || null;
    } catch {
        return null;
    }
}

// ---------------------------------------------------------------------------
// Method-not-allowed handlers
// ---------------------------------------------------------------------------

export async function GET() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed.' },
        { status: 405 }
    );
}

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

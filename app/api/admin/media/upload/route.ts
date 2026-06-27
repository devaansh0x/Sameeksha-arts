/**
 * Media Upload API Endpoint
 * POST /api/admin/media/upload
 * 
 * Handles image upload with Sharp processing and Cloudinary storage.
 * Includes validation, error handling, and session authentication.
 * 
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.8
 * Task: 4.3
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { processAndUploadImage } from '@/lib/media/imageUploadHelper';
import { validateImageFile } from '@/lib/cloudinary';
import prisma from '@/lib/database/prisma';

/**
 * POST /api/admin/media/upload
 * Upload an image file with processing and validation
 */
export async function POST(request: NextRequest) {
    try {
        // Authentication check - ensure user is logged in
        const session = await getSession();
        if (!session || !session.user) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Unauthorized. Please log in to upload media.',
                },
                { status: 401 }
            );
        }

        // Parse multipart form data
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        // Validate that file was provided
        if (!file) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'No file provided. Please select an image to upload.',
                },
                { status: 400 }
            );
        }

        // Validate file type and size using the cloudinary validation
        const validation = validateImageFile(file);
        if (!validation.isValid) {
            return NextResponse.json(
                {
                    success: false,
                    error: validation.error,
                },
                { status: 400 }
            );
        }

        // Convert File to Buffer for processing
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Process and upload image with Sharp and Cloudinary
        // This generates all responsive sizes (thumbnail, small, medium, large, original)
        // and both WebP and JPEG formats
        const uploadResult = await processAndUploadImage(
            buffer,
            file.type,
            {
                folder: 'sameeksha-arts/artwork',
                publicId: `media_${Date.now()}`,
            }
        );

        if (!uploadResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: uploadResult.error || 'Image processing failed. Please try again.',
                },
                { status: 500 }
            );
        }

        // Ensure we have all required data from upload
        if (!uploadResult.urls || !uploadResult.metadata || !uploadResult.publicIds) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Upload completed but missing required data. Please try again.',
                },
                { status: 500 }
            );
        }

        // Attempt to create MediaAsset record in database.
        // If the DB is unavailable we still return the uploaded media info so the
        // caller can surface the URLs, but we log the error and omit the DB-generated id.
        let mediaAsset: {
            id: string;
            filename: string;
            originalUrl: string;
            thumbnailUrl: string;
            smallUrl: string;
            mediumUrl: string;
            largeUrl: string;
            width: number;
            height: number;
            size: number;
            mimeType: string;
            uploadedAt: Date;
        } | null = null;

        try {
            if (prisma) {
                mediaAsset = await prisma.mediaAsset.create({
                    data: {
                        filename: file.name,
                        originalUrl: uploadResult.urls.jpeg.original,
                        thumbnailUrl: uploadResult.urls.jpeg.thumbnail,
                        smallUrl: uploadResult.urls.jpeg.small,
                        mediumUrl: uploadResult.urls.jpeg.medium,
                        largeUrl: uploadResult.urls.jpeg.large,
                        width: uploadResult.metadata.width,
                        height: uploadResult.metadata.height,
                        size: file.size,
                        mimeType: file.type,
                    },
                });
            }
        } catch (dbError) {
            // Log DB error but continue — the file is already uploaded to Cloudinary
            console.error('Failed to save MediaAsset to database (DB may be unavailable):', dbError);
        }

        // Build the response media object, using DB record if available, otherwise
        // fall back to the upload result data so the caller still gets all URLs.
        const mediaResponse = mediaAsset
            ? {
                id: mediaAsset.id,
                filename: mediaAsset.filename,
                url: mediaAsset.originalUrl,
                thumbnailUrl: mediaAsset.thumbnailUrl,
                smallUrl: mediaAsset.smallUrl,
                mediumUrl: mediaAsset.mediumUrl,
                largeUrl: mediaAsset.largeUrl,
                width: mediaAsset.width,
                height: mediaAsset.height,
                size: mediaAsset.size,
                mimeType: mediaAsset.mimeType,
                uploadedAt: mediaAsset.uploadedAt.toISOString(),
                urls: {
                    jpeg: uploadResult.urls.jpeg,
                    webp: uploadResult.urls.webp,
                    blurPlaceholder: uploadResult.urls.blurPlaceholder,
                },
                publicIds: uploadResult.publicIds,
            }
            : {
                id: null,
                filename: file.name,
                url: uploadResult.urls.jpeg.original,
                thumbnailUrl: uploadResult.urls.jpeg.thumbnail,
                smallUrl: uploadResult.urls.jpeg.small,
                mediumUrl: uploadResult.urls.jpeg.medium,
                largeUrl: uploadResult.urls.jpeg.large,
                width: uploadResult.metadata.width,
                height: uploadResult.metadata.height,
                size: file.size,
                mimeType: file.type,
                uploadedAt: new Date().toISOString(),
                urls: {
                    jpeg: uploadResult.urls.jpeg,
                    webp: uploadResult.urls.webp,
                    blurPlaceholder: uploadResult.urls.blurPlaceholder,
                },
                publicIds: uploadResult.publicIds,
            };

        // Return success response with media asset information
        return NextResponse.json(
            {
                success: true,
                media: mediaResponse,
                ...(mediaAsset === null && {
                    warning: 'File uploaded successfully but could not be saved to database.',
                }),
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error in media upload endpoint:', error);

        // Return user-friendly error message
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error
                    ? `Upload failed: ${error.message}`
                    : 'An unexpected error occurred during upload. Please try again.',
            },
            { status: 500 }
        );
    } finally {
        // Ensure Prisma client connection is released
        // (singleton manages its own lifecycle — no manual disconnect needed)
    }
}

/**
 * GET /api/admin/media/upload
 * Return method not allowed for GET requests
 */
export async function GET() {
    return NextResponse.json(
        {
            success: false,
            error: 'Method not allowed. Use POST to upload media.',
        },
        { status: 405 }
    );
}

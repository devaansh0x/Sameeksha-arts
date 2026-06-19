/**
 * Image Upload Helper
 * 
 * Integrates the Sharp image processing service with Cloudinary upload.
 * Provides high-level functions for complete image upload workflows.
 */

import cloudinary, { CLOUDINARY_FOLDERS } from './cloudinary';
import {
    processImageForUpload,
    type ProcessedImage,
    type ImageMetadata,
} from './imageProcessing';

/**
 * Result of uploading a single processed image to Cloudinary
 */
export interface CloudinaryUploadResult {
    publicId: string;
    secureUrl: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
}

/**
 * Complete upload result with all sizes
 */
export interface CompleteUploadResult {
    success: boolean;
    error?: string;
    metadata?: ImageMetadata;
    urls?: {
        jpeg: {
            thumbnail: string;
            small: string;
            medium: string;
            large: string;
            original: string;
        };
        webp: {
            thumbnail: string;
            small: string;
            medium: string;
            large: string;
            original: string;
        };
        blurPlaceholder: string;
    };
    publicIds?: {
        jpeg: {
            thumbnail: string;
            small: string;
            medium: string;
            large: string;
            original: string;
        };
        webp: {
            thumbnail: string;
            small: string;
            medium: string;
            large: string;
            original: string;
        };
        blurPlaceholder: string;
    };
}

/**
 * Upload a processed image buffer to Cloudinary
 * 
 * @param buffer - Processed image buffer
 * @param folder - Cloudinary folder path
 * @param publicId - Custom public ID (optional)
 * @param suffix - Suffix to add to public ID (e.g., '_thumbnail', '_small')
 * @returns Promise resolving to upload result
 */
async function uploadToCloudinary(
    buffer: Buffer,
    folder: string,
    publicId?: string,
    suffix?: string
): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                public_id: publicId ? `${publicId}${suffix || ''}` : undefined,
                resource_type: 'image',
                overwrite: false,
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else if (result) {
                    resolve({
                        publicId: result.public_id,
                        secureUrl: result.secure_url,
                        width: result.width,
                        height: result.height,
                        format: result.format,
                        bytes: result.bytes,
                    });
                } else {
                    reject(new Error('Upload failed with no result'));
                }
            }
        );

        uploadStream.end(buffer);
    });
}

/**
 * Process and upload an image with all responsive sizes
 * 
 * This is the main function to use for artwork image uploads.
 * It processes the image with Sharp and uploads all sizes to Cloudinary.
 * 
 * @param buffer - Source image buffer
 * @param mimeType - MIME type of the source image
 * @param options - Upload options
 * @returns Promise resolving to complete upload result
 */
export async function processAndUploadImage(
    buffer: Buffer,
    mimeType: string,
    options: {
        folder?: string;
        publicId?: string;
    } = {}
): Promise<CompleteUploadResult> {
    const folder = options.folder || CLOUDINARY_FOLDERS.artwork;
    const basePublicId = options.publicId || `artwork_${Date.now()}`;

    try {
        // Step 1: Process image with Sharp
        const processed = await processImageForUpload(buffer, mimeType);

        if (!processed.isValid) {
            return {
                success: false,
                error: processed.error,
            };
        }

        if (!processed.jpeg || !processed.webp || !processed.blurPlaceholder) {
            return {
                success: false,
                error: 'Image processing failed to generate all required formats',
            };
        }

        // Step 2: Upload all sizes to Cloudinary in parallel
        const uploadPromises = [
            // JPEG versions
            uploadToCloudinary(processed.jpeg.thumbnail.buffer, folder, basePublicId, '_jpeg_thumbnail'),
            uploadToCloudinary(processed.jpeg.small.buffer, folder, basePublicId, '_jpeg_small'),
            uploadToCloudinary(processed.jpeg.medium.buffer, folder, basePublicId, '_jpeg_medium'),
            uploadToCloudinary(processed.jpeg.large.buffer, folder, basePublicId, '_jpeg_large'),
            uploadToCloudinary(processed.jpeg.original.buffer, folder, basePublicId, '_jpeg_original'),

            // WebP versions
            uploadToCloudinary(processed.webp.thumbnail.buffer, folder, basePublicId, '_webp_thumbnail'),
            uploadToCloudinary(processed.webp.small.buffer, folder, basePublicId, '_webp_small'),
            uploadToCloudinary(processed.webp.medium.buffer, folder, basePublicId, '_webp_medium'),
            uploadToCloudinary(processed.webp.large.buffer, folder, basePublicId, '_webp_large'),
            uploadToCloudinary(processed.webp.original.buffer, folder, basePublicId, '_webp_original'),

            // Blur placeholder
            uploadToCloudinary(processed.blurPlaceholder.buffer, folder, basePublicId, '_blur'),
        ];

        const uploadResults = await Promise.all(uploadPromises);

        // Step 3: Organize results
        return {
            success: true,
            metadata: processed.metadata,
            urls: {
                jpeg: {
                    thumbnail: uploadResults[0].secureUrl,
                    small: uploadResults[1].secureUrl,
                    medium: uploadResults[2].secureUrl,
                    large: uploadResults[3].secureUrl,
                    original: uploadResults[4].secureUrl,
                },
                webp: {
                    thumbnail: uploadResults[5].secureUrl,
                    small: uploadResults[6].secureUrl,
                    medium: uploadResults[7].secureUrl,
                    large: uploadResults[8].secureUrl,
                    original: uploadResults[9].secureUrl,
                },
                blurPlaceholder: uploadResults[10].secureUrl,
            },
            publicIds: {
                jpeg: {
                    thumbnail: uploadResults[0].publicId,
                    small: uploadResults[1].publicId,
                    medium: uploadResults[2].publicId,
                    large: uploadResults[3].publicId,
                    original: uploadResults[4].publicId,
                },
                webp: {
                    thumbnail: uploadResults[5].publicId,
                    small: uploadResults[6].publicId,
                    medium: uploadResults[7].publicId,
                    large: uploadResults[8].publicId,
                    original: uploadResults[9].publicId,
                },
                blurPlaceholder: uploadResults[10].publicId,
            },
        };
    } catch (error) {
        return {
            success: false,
            error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
    }
}

/**
 * Delete all sizes of an uploaded image from Cloudinary
 * 
 * @param basePublicId - Base public ID (without size suffixes)
 * @returns Promise resolving when all images are deleted
 */
export async function deleteAllImageSizes(basePublicId: string): Promise<void> {
    const suffixes = [
        '_jpeg_thumbnail',
        '_jpeg_small',
        '_jpeg_medium',
        '_jpeg_large',
        '_jpeg_original',
        '_webp_thumbnail',
        '_webp_small',
        '_webp_medium',
        '_webp_large',
        '_webp_original',
        '_blur',
    ];

    const deletePromises = suffixes.map(suffix =>
        cloudinary.uploader.destroy(`${basePublicId}${suffix}`).catch(error => {
            // Log error but don't fail if a single image doesn't exist
            console.warn(`Failed to delete ${basePublicId}${suffix}:`, error);
        })
    );

    await Promise.all(deletePromises);
}

/**
 * Example: Process and upload artwork image
 * 
 * ```typescript
 * const file = formData.get('file') as File;
 * const arrayBuffer = await file.arrayBuffer();
 * const buffer = Buffer.from(arrayBuffer);
 * 
 * const result = await processAndUploadImage(
 *     buffer,
 *     file.type,
 *     {
 *         folder: CLOUDINARY_FOLDERS.artwork,
 *         publicId: `artwork_${artworkId}`
 *     }
 * );
 * 
 * if (result.success) {
 *     console.log('Uploaded successfully:', result.urls);
 *     // Save URLs to database
 * } else {
 *     console.error('Upload failed:', result.error);
 * }
 * ```
 */


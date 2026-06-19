/**
 * Media Asset Type Definitions
 * 
 * Type definitions for media assets, images, and Cloudinary integration.
 */

/**
 * Cloudinary upload result
 */
export interface CloudinaryUploadResult {
    public_id: string;
    version: number;
    signature: string;
    width: number;
    height: number;
    format: string;
    resource_type: string;
    created_at: string;
    tags: string[];
    bytes: number;
    type: string;
    etag: string;
    placeholder: boolean;
    url: string;
    secure_url: string;
    folder: string;
    original_filename: string;
    [key: string]: any;
}

/**
 * Media asset stored in database
 * Matches the Prisma MediaAsset model
 */
export interface MediaAsset {
    id: string;
    filename: string;
    originalUrl: string;
    thumbnailUrl: string;
    smallUrl: string;
    mediumUrl: string;
    largeUrl: string;
    width: number;
    height: number;
    size: number; // bytes
    mimeType: string;
    uploadedAt: Date | string;
    publicId?: string; // Cloudinary public_id for deletion
}

/**
 * Responsive image URLs for different sizes
 */
export interface ResponsiveImageUrls {
    thumbnail: string;
    small: string;
    medium: string;
    large: string;
    original: string;
}

/**
 * WebP image with JPEG fallback
 */
export interface WebPWithFallback {
    webp: string;
    jpeg: string;
}

/**
 * Image metadata
 */
export interface ImageMetadata {
    width: number;
    height: number;
    format: string;
    size: number; // bytes
    aspectRatio: number;
}

/**
 * Image upload request body
 */
export interface ImageUploadRequest {
    file: File | string; // File object or data URL
    folder?: string;
    tags?: string[];
}

/**
 * Image upload response
 */
export interface ImageUploadResponse {
    success: boolean;
    media?: MediaAsset;
    error?: string;
}

/**
 * Image validation result
 */
export interface ImageValidationResult {
    isValid: boolean;
    error?: string;
}

/**
 * Allowed image MIME types
 */
export type AllowedImageMimeType = 'image/jpeg' | 'image/png' | 'image/webp';

/**
 * Cloudinary folder types
 */
export type CloudinaryFolder = 'artwork' | 'portraits' | 'general';

/**
 * Image size names
 */
export type ImageSize = 'thumbnail' | 'small' | 'medium' | 'large' | 'original';

/**
 * Image transformation options
 */
export interface ImageTransformOptions {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'limit' | 'scale' | 'pad';
    quality?: number | 'auto';
    format?: 'auto' | 'jpg' | 'png' | 'webp';
    gravity?: 'auto' | 'center' | 'north' | 'south' | 'east' | 'west';
    blur?: number;
}

/**
 * Media library filter options
 */
export interface MediaLibraryFilters {
    search?: string; // Search by filename
    startDate?: Date;
    endDate?: Date;
    sortBy?: 'uploadedAt' | 'filename' | 'size';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
}

/**
 * Media library response
 */
export interface MediaLibraryResponse {
    media: MediaAsset[];
    total: number;
    hasMore: boolean;
}

/**
 * Media usage information
 */
export interface MediaUsage {
    mediaAssetId: string;
    usedIn: Array<{
        type: 'artwork' | 'page_content';
        id: string;
        title: string;
    }>;
}

/**
 * Bulk delete request
 */
export interface BulkDeleteRequest {
    mediaAssetIds: string[];
}

/**
 * Bulk delete response
 */
export interface BulkDeleteResponse {
    success: boolean;
    deleted: number;
    failed: number;
    errors?: Array<{
        mediaAssetId: string;
        error: string;
    }>;
    warnings?: Array<{
        mediaAssetId: string;
        warning: string;
    }>;
}

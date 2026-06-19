/**
 * Cloudinary Configuration and Utilities
 * 
 * This module configures Cloudinary for media storage and CDN delivery.
 * It provides utilities for image uploads, transformations, and URL generation.
 */

import { v2 as cloudinary } from 'cloudinary';

// Validate required environment variables
const requiredEnvVars = {
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};

// Check if all required environment variables are set
const missingEnvVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

if (missingEnvVars.length > 0) {
    console.warn(
        `Warning: Missing Cloudinary environment variables: ${missingEnvVars.join(', ')}. ` +
        'Image upload functionality will not work until these are configured.'
    );
}

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true, // Use HTTPS for all URLs
});

/**
 * Image size configurations for responsive images
 * These match the design document specifications
 */
export const IMAGE_SIZES = {
    thumbnail: 150,
    small: 480,
    medium: 1024,
    large: 1920,
} as const;

/**
 * Cloudinary folder structure for organized storage
 */
export const CLOUDINARY_FOLDERS = {
    artwork: 'sameeksha-arts/artwork',
    portraits: 'sameeksha-arts/portraits',
    general: 'sameeksha-arts/general',
} as const;

/**
 * Upload options for Cloudinary
 */
export interface CloudinaryUploadOptions {
    folder?: string;
    publicId?: string;
    transformation?: any[];
    tags?: string[];
}

/**
 * Result from Cloudinary upload
 */
export interface CloudinaryUploadResult {
    public_id: string;
    secure_url: string;
    width: number;
    height: number;
    format: string;
    resource_type: string;
    created_at: string;
    bytes: number;
    url: string;
    [key: string]: any;
}

/**
 * Generate responsive image URLs for different sizes
 * 
 * @param publicId - The Cloudinary public ID of the image
 * @param sizes - Optional custom sizes (defaults to IMAGE_SIZES)
 * @returns Object containing URLs for each size
 */
export function getResponsiveImageUrls(
    publicId: string,
    sizes: Record<string, number> = IMAGE_SIZES
) {
    const baseUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;

    const urls: Record<string, string> = {};

    Object.entries(sizes).forEach(([sizeName, width]) => {
        // Generate URL with transformation for width and automatic format/quality
        urls[sizeName] = `${baseUrl}/w_${width},f_auto,q_auto/${publicId}`;
    });

    // Add original URL (no transformations except auto format/quality)
    urls.original = `${baseUrl}/f_auto,q_auto/${publicId}`;

    return urls;
}

/**
 * Generate a WebP URL with JPEG fallback
 * 
 * @param publicId - The Cloudinary public ID of the image
 * @param width - Desired width in pixels
 * @returns Object with webp and jpeg URLs
 */
export function getWebPWithFallback(publicId: string, width?: number) {
    const baseUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;
    const widthTransform = width ? `w_${width},` : '';

    return {
        webp: `${baseUrl}/${widthTransform}f_webp,q_auto/${publicId}`,
        jpeg: `${baseUrl}/${widthTransform}f_jpg,q_auto/${publicId}`,
    };
}

/**
 * Generate a blur placeholder URL for progressive image loading
 * 
 * @param publicId - The Cloudinary public ID of the image
 * @returns URL for blur placeholder (very small, blurred image)
 */
export function getBlurPlaceholder(publicId: string): string {
    const baseUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;
    // Generate a tiny 20px wide, heavily blurred, low quality placeholder
    return `${baseUrl}/w_20,e_blur:1000,q_1,f_auto/${publicId}`;
}

/**
 * Delete an image from Cloudinary
 * 
 * @param publicId - The Cloudinary public ID to delete
 * @returns Promise resolving to deletion result
 */
export async function deleteImage(publicId: string): Promise<any> {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        throw error;
    }
}

/**
 * Get image metadata from Cloudinary
 * 
 * @param publicId - The Cloudinary public ID
 * @returns Promise resolving to image metadata
 */
export async function getImageMetadata(publicId: string): Promise<any> {
    try {
        const result = await cloudinary.api.resource(publicId);
        return result;
    } catch (error) {
        console.error('Error fetching image metadata from Cloudinary:', error);
        throw error;
    }
}

/**
 * Validate file type for uploads
 * Only JPEG, PNG, and WebP are allowed per requirements
 */
export const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

/**
 * Validate uploaded file
 * 
 * @param file - File to validate
 * @returns Object with isValid flag and optional error message
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        return {
            isValid: false,
            error: 'Image must be smaller than 10MB. Please compress or choose a different image.',
        };
    }

    // Check file type
    if (!ALLOWED_MIME_TYPES.includes(file.type as any)) {
        return {
            isValid: false,
            error: 'Only JPEG, PNG, and WebP formats are supported. Please convert your image.',
        };
    }

    return { isValid: true };
}

export default cloudinary;

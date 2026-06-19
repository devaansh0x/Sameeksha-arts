/**
 * Image Processing Service using Sharp
 * 
 * This module handles image processing operations including:
 * - Resizing to multiple responsive sizes
 * - Format conversion (WebP generation with JPEG fallback)
 * - Image optimization for web display
 * - Metadata extraction
 * 
 * Follows the image processing pipeline from the design document:
 * Upload → Sharp processing → Generate sizes → WebP + JPEG → Upload to CDN
 */

import sharp from 'sharp';
import { IMAGE_SIZES, ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from './cloudinary';

/**
 * Supported image formats for processing
 */
export type SupportedFormat = 'jpeg' | 'png' | 'webp';

/**
 * Configuration for image size generation
 */
export interface ImageSizeConfig {
    width: number;
    height?: number;
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
    position?: string;
}

/**
 * Processed image result
 */
export interface ProcessedImage {
    buffer: Buffer;
    width: number;
    height: number;
    format: string;
    size: number; // File size in bytes
}

/**
 * Multiple size generation result
 */
export interface ProcessedImageSet {
    thumbnail: ProcessedImage;
    small: ProcessedImage;
    medium: ProcessedImage;
    large: ProcessedImage;
    original: ProcessedImage;
}

/**
 * Image metadata extracted from the file
 */
export interface ImageMetadata {
    width: number;
    height: number;
    format: string;
    size: number;
    hasAlpha: boolean;
    orientation?: number;
}

/**
 * Validation result for image files
 */
export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

/**
 * Validate image buffer
 * Checks file size and format constraints
 * 
 * @param buffer - Image buffer to validate
 * @param mimeType - MIME type of the image
 * @returns Validation result with isValid flag and optional error message
 */
export async function validateImageBuffer(
    buffer: Buffer,
    mimeType?: string
): Promise<ValidationResult> {
    // Check file size
    if (buffer.length > MAX_FILE_SIZE) {
        return {
            isValid: false,
            error: 'Image must be smaller than 10MB. Please compress or choose a different image.',
        };
    }

    // Validate MIME type if provided
    if (mimeType && !ALLOWED_MIME_TYPES.includes(mimeType as any)) {
        return {
            isValid: false,
            error: 'Only JPEG, PNG, and WebP formats are supported. Please convert your image.',
        };
    }

    // Use Sharp to validate the image format
    try {
        const metadata = await sharp(buffer).metadata();

        if (!metadata.format || !['jpeg', 'png', 'webp'].includes(metadata.format)) {
            return {
                isValid: false,
                error: 'Invalid image format. Only JPEG, PNG, and WebP are supported.',
            };
        }

        return { isValid: true };
    } catch (error) {
        return {
            isValid: false,
            error: 'Unable to process image. The file may be corrupted or in an unsupported format.',
        };
    }
}

/**
 * Extract metadata from an image buffer
 * 
 * @param buffer - Image buffer
 * @returns Promise resolving to image metadata
 */
export async function extractMetadata(buffer: Buffer): Promise<ImageMetadata> {
    const metadata = await sharp(buffer).metadata();

    if (!metadata.width || !metadata.height || !metadata.format) {
        throw new Error('Unable to extract image metadata. The file may be corrupted.');
    }

    return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: buffer.length,
        hasAlpha: metadata.hasAlpha || false,
        orientation: metadata.orientation,
    };
}

/**
 * Resize and optimize image to a specific width
 * Maintains aspect ratio and optimizes for web display
 * 
 * @param buffer - Source image buffer
 * @param width - Target width in pixels
 * @param format - Output format (defaults to original format)
 * @param quality - Quality setting (1-100, defaults to 80)
 * @returns Promise resolving to processed image
 */
export async function resizeImage(
    buffer: Buffer,
    width: number,
    format?: SupportedFormat,
    quality: number = 80
): Promise<ProcessedImage> {
    try {
        let pipeline = sharp(buffer)
            .resize(width, undefined, {
                fit: 'inside',
                withoutEnlargement: true, // Don't upscale images
            });

        // Apply format-specific optimizations
        if (format === 'webp') {
            pipeline = pipeline.webp({ quality, effort: 4 });
        } else if (format === 'jpeg') {
            pipeline = pipeline.jpeg({ quality, progressive: true, mozjpeg: true });
        } else if (format === 'png') {
            pipeline = pipeline.png({ quality, compressionLevel: 8 });
        }

        const outputBuffer = await pipeline.toBuffer({ resolveWithObject: true });

        return {
            buffer: outputBuffer.data,
            width: outputBuffer.info.width,
            height: outputBuffer.info.height,
            format: outputBuffer.info.format,
            size: outputBuffer.info.size,
        };
    } catch (error) {
        throw new Error(`Failed to resize image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Generate multiple responsive sizes from a source image
 * Creates thumbnail, small, medium, large, and original versions
 * 
 * @param buffer - Source image buffer
 * @param format - Output format (defaults to 'jpeg')
 * @returns Promise resolving to set of processed images
 */
export async function generateResponsiveSizes(
    buffer: Buffer,
    format: SupportedFormat = 'jpeg'
): Promise<ProcessedImageSet> {
    try {
        // Process all sizes in parallel for better performance
        const [thumbnail, small, medium, large, original] = await Promise.all([
            resizeImage(buffer, IMAGE_SIZES.thumbnail, format, 85),
            resizeImage(buffer, IMAGE_SIZES.small, format, 80),
            resizeImage(buffer, IMAGE_SIZES.medium, format, 80),
            resizeImage(buffer, IMAGE_SIZES.large, format, 75),
            resizeImage(buffer, 4000, format, 90), // Original with max width constraint
        ]);

        return {
            thumbnail,
            small,
            medium,
            large,
            original,
        };
    } catch (error) {
        throw new Error(`Failed to generate responsive sizes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Generate WebP version with JPEG fallback
 * Creates both WebP (for modern browsers) and JPEG (for compatibility)
 * 
 * @param buffer - Source image buffer
 * @param width - Target width (optional, maintains original if not specified)
 * @returns Promise resolving to both WebP and JPEG versions
 */
export async function generateWebPWithFallback(
    buffer: Buffer,
    width?: number
): Promise<{ webp: ProcessedImage; jpeg: ProcessedImage }> {
    try {
        // Process WebP and JPEG in parallel
        const [webp, jpeg] = await Promise.all([
            width
                ? resizeImage(buffer, width, 'webp', 80)
                : convertToFormat(buffer, 'webp', 80),
            width
                ? resizeImage(buffer, width, 'jpeg', 80)
                : convertToFormat(buffer, 'jpeg', 80),
        ]);

        return { webp, jpeg };
    } catch (error) {
        throw new Error(`Failed to generate WebP with fallback: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Convert image to a specific format without resizing
 * 
 * @param buffer - Source image buffer
 * @param format - Target format
 * @param quality - Quality setting (1-100)
 * @returns Promise resolving to converted image
 */
export async function convertToFormat(
    buffer: Buffer,
    format: SupportedFormat,
    quality: number = 80
): Promise<ProcessedImage> {
    try {
        let pipeline = sharp(buffer);

        if (format === 'webp') {
            pipeline = pipeline.webp({ quality, effort: 4 });
        } else if (format === 'jpeg') {
            pipeline = pipeline.jpeg({ quality, progressive: true, mozjpeg: true });
        } else if (format === 'png') {
            pipeline = pipeline.png({ quality, compressionLevel: 8 });
        }

        const outputBuffer = await pipeline.toBuffer({ resolveWithObject: true });

        return {
            buffer: outputBuffer.data,
            width: outputBuffer.info.width,
            height: outputBuffer.info.height,
            format: outputBuffer.info.format,
            size: outputBuffer.info.size,
        };
    } catch (error) {
        throw new Error(`Failed to convert format: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Optimize image without changing dimensions
 * Applies compression and optimization while maintaining original size
 * 
 * @param buffer - Source image buffer
 * @param format - Output format (optional, defaults to original format)
 * @param quality - Quality setting (1-100, defaults to 80)
 * @returns Promise resolving to optimized image
 */
export async function optimizeImage(
    buffer: Buffer,
    format?: SupportedFormat,
    quality: number = 80
): Promise<ProcessedImage> {
    try {
        const metadata = await sharp(buffer).metadata();

        let pipeline = sharp(buffer);

        // Use specified format or maintain original
        const targetFormat = format || (metadata.format as SupportedFormat);

        if (targetFormat === 'webp') {
            pipeline = pipeline.webp({ quality, effort: 4 });
        } else if (targetFormat === 'jpeg' || metadata.format === 'jpeg') {
            pipeline = pipeline.jpeg({ quality, progressive: true, mozjpeg: true });
        } else if (targetFormat === 'png') {
            pipeline = pipeline.png({ quality, compressionLevel: 8 });
        }

        const outputBuffer = await pipeline.toBuffer({ resolveWithObject: true });

        return {
            buffer: outputBuffer.data,
            width: outputBuffer.info.width,
            height: outputBuffer.info.height,
            format: outputBuffer.info.format,
            size: outputBuffer.info.size,
        };
    } catch (error) {
        throw new Error(`Failed to optimize image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Generate a blur placeholder for progressive loading
 * Creates a tiny, heavily blurred version for blur-up effect
 * 
 * @param buffer - Source image buffer
 * @returns Promise resolving to blur placeholder image
 */
export async function generateBlurPlaceholder(buffer: Buffer): Promise<ProcessedImage> {
    try {
        const outputBuffer = await sharp(buffer)
            .resize(20, undefined, { fit: 'inside' })
            .blur(10)
            .jpeg({ quality: 10 })
            .toBuffer({ resolveWithObject: true });

        return {
            buffer: outputBuffer.data,
            width: outputBuffer.info.width,
            height: outputBuffer.info.height,
            format: outputBuffer.info.format,
            size: outputBuffer.info.size,
        };
    } catch (error) {
        throw new Error(`Failed to generate blur placeholder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Process image for upload
 * Complete pipeline: validate → extract metadata → generate responsive sizes → optimize
 * 
 * @param buffer - Source image buffer
 * @param mimeType - MIME type of the source image
 * @returns Promise resolving to complete processed image set with metadata
 */
export async function processImageForUpload(
    buffer: Buffer,
    mimeType?: string
): Promise<{
    isValid: boolean;
    error?: string;
    metadata?: ImageMetadata;
    jpeg?: ProcessedImageSet;
    webp?: ProcessedImageSet;
    blurPlaceholder?: ProcessedImage;
}> {
    // Validate the image
    const validation = await validateImageBuffer(buffer, mimeType);
    if (!validation.isValid) {
        return { isValid: false, error: validation.error };
    }

    try {
        // Extract metadata
        const metadata = await extractMetadata(buffer);

        // Generate responsive sizes in both JPEG and WebP formats
        const [jpeg, webp, blurPlaceholder] = await Promise.all([
            generateResponsiveSizes(buffer, 'jpeg'),
            generateResponsiveSizes(buffer, 'webp'),
            generateBlurPlaceholder(buffer),
        ]);

        return {
            isValid: true,
            metadata,
            jpeg,
            webp,
            blurPlaceholder,
        };
    } catch (error) {
        return {
            isValid: false,
            error: `Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
    }
}

/**
 * Calculate optimal quality based on image dimensions
 * Larger images can use slightly lower quality without noticeable degradation
 * 
 * @param width - Image width in pixels
 * @param height - Image height in pixels
 * @returns Recommended quality value (1-100)
 */
export function calculateOptimalQuality(width: number, height: number): number {
    const pixels = width * height;

    if (pixels > 4000000) return 75; // Very large images (>4MP)
    if (pixels > 2000000) return 80; // Large images (>2MP)
    if (pixels > 500000) return 85; // Medium images (>0.5MP)
    return 90; // Small images
}

/**
 * Auto-rotate image based on EXIF orientation
 * Ensures images are displayed correctly regardless of device orientation
 * 
 * @param buffer - Source image buffer
 * @returns Promise resolving to rotated image buffer
 */
export async function autoRotate(buffer: Buffer): Promise<Buffer> {
    try {
        return await sharp(buffer)
            .rotate() // Automatically rotates based on EXIF orientation
            .toBuffer();
    } catch (error) {
        throw new Error(`Failed to auto-rotate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}


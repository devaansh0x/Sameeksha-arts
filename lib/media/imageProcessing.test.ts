/**
 * Unit Tests for Image Processing Service
 * 
 * Tests the image processing functionality including:
 * - Image validation
 * - Metadata extraction
 * - Resizing operations
 * - Format conversion
 * - Responsive size generation
 * - WebP generation with JPEG fallback
 * - Blur placeholder generation
 */

import { describe, it, expect } from '@jest/globals';
import sharp from 'sharp';
import {
    validateImageBuffer,
    extractMetadata,
    resizeImage,
    generateResponsiveSizes,
    generateWebPWithFallback,
    convertToFormat,
    optimizeImage,
    generateBlurPlaceholder,
    processImageForUpload,
    calculateOptimalQuality,
    autoRotate,
} from './imageProcessing';
import { IMAGE_SIZES, MAX_FILE_SIZE } from './cloudinary';

/**
 * Helper function to create a test image buffer
 */
async function createTestImage(
    width: number = 800,
    height: number = 600,
    format: 'jpeg' | 'png' | 'webp' = 'jpeg'
): Promise<Buffer> {
    return await sharp({
        create: {
            width,
            height,
            channels: 3,
            background: { r: 255, g: 100, b: 100 },
        },
    })
        .toFormat(format)
        .toBuffer();
}

describe('Image Processing Service', () => {
    describe('validateImageBuffer', () => {
        it('should validate a valid JPEG image', async () => {
            const buffer = await createTestImage(800, 600, 'jpeg');
            const result = await validateImageBuffer(buffer, 'image/jpeg');

            expect(result.isValid).toBe(true);
            expect(result.error).toBeUndefined();
        });

        it('should validate a valid PNG image', async () => {
            const buffer = await createTestImage(800, 600, 'png');
            const result = await validateImageBuffer(buffer, 'image/png');

            expect(result.isValid).toBe(true);
            expect(result.error).toBeUndefined();
        });

        it('should validate a valid WebP image', async () => {
            const buffer = await createTestImage(800, 600, 'webp');
            const result = await validateImageBuffer(buffer, 'image/webp');

            expect(result.isValid).toBe(true);
            expect(result.error).toBeUndefined();
        });

        it('should reject images larger than MAX_FILE_SIZE', async () => {
            // Create a buffer larger than MAX_FILE_SIZE
            const largeBuffer = Buffer.alloc(MAX_FILE_SIZE + 1);
            const result = await validateImageBuffer(largeBuffer, 'image/jpeg');

            expect(result.isValid).toBe(false);
            expect(result.error).toContain('10MB');
        });

        it('should reject unsupported MIME types', async () => {
            const buffer = await createTestImage(800, 600, 'jpeg');
            const result = await validateImageBuffer(buffer, 'image/gif');

            expect(result.isValid).toBe(false);
            expect(result.error).toContain('JPEG, PNG, and WebP');
        });

        it('should reject corrupted image data', async () => {
            const corruptedBuffer = Buffer.from('not an image');
            const result = await validateImageBuffer(corruptedBuffer, 'image/jpeg');

            expect(result.isValid).toBe(false);
            expect(result.error).toBeDefined();
        });
    });

    describe('extractMetadata', () => {
        it('should extract correct metadata from an image', async () => {
            const buffer = await createTestImage(800, 600, 'jpeg');
            const metadata = await extractMetadata(buffer);

            expect(metadata.width).toBe(800);
            expect(metadata.height).toBe(600);
            expect(metadata.format).toBe('jpeg');
            expect(metadata.size).toBeGreaterThan(0);
            expect(typeof metadata.hasAlpha).toBe('boolean');
        });

        it('should handle images with alpha channel', async () => {
            const buffer = await sharp({
                create: {
                    width: 100,
                    height: 100,
                    channels: 4,
                    background: { r: 255, g: 100, b: 100, alpha: 0.5 },
                },
            })
                .png()
                .toBuffer();

            const metadata = await extractMetadata(buffer);

            expect(metadata.hasAlpha).toBe(true);
        });

        it('should throw error for corrupted image data', async () => {
            const corruptedBuffer = Buffer.from('not an image');

            await expect(extractMetadata(corruptedBuffer)).rejects.toThrow();
        });
    });

    describe('resizeImage', () => {
        it('should resize image to specified width maintaining aspect ratio', async () => {
            const buffer = await createTestImage(800, 600, 'jpeg');
            const result = await resizeImage(buffer, 400, 'jpeg');

            expect(result.width).toBe(400);
            expect(result.height).toBe(300); // Maintains 4:3 aspect ratio
            expect(result.format).toBe('jpeg');
            expect(result.size).toBeGreaterThan(0);
        });

        it('should not upscale images when width is larger than original', async () => {
            const buffer = await createTestImage(400, 300, 'jpeg');
            const result = await resizeImage(buffer, 800, 'jpeg');

            expect(result.width).toBeLessThanOrEqual(400);
        });

        it('should convert to WebP format', async () => {
            const buffer = await createTestImage(800, 600, 'jpeg');
            const result = await resizeImage(buffer, 400, 'webp');

            expect(result.format).toBe('webp');
        });

        it('should convert to PNG format', async () => {
            const buffer = await createTestImage(800, 600, 'jpeg');
            const result = await resizeImage(buffer, 400, 'png');

            expect(result.format).toBe('png');
        });

        it('should respect quality parameter', async () => {
            const buffer = await createTestImage(800, 600, 'jpeg');
            const highQuality = await resizeImage(buffer, 400, 'jpeg', 95);
            const lowQuality = await resizeImage(buffer, 400, 'jpeg', 50);

            expect(highQuality.size).toBeGreaterThan(lowQuality.size);
        });
    });

    describe('generateResponsiveSizes', () => {
        it('should generate all required sizes', async () => {
            const buffer = await createTestImage(2000, 1500, 'jpeg');
            const result = await generateResponsiveSizes(buffer, 'jpeg');

            expect(result.thumbnail).toBeDefined();
            expect(result.small).toBeDefined();
            expect(result.medium).toBeDefined();
            expect(result.large).toBeDefined();
            expect(result.original).toBeDefined();
        });

        it('should generate thumbnail at correct size', async () => {
            const buffer = await createTestImage(2000, 1500, 'jpeg');
            const result = await generateResponsiveSizes(buffer, 'jpeg');

            expect(result.thumbnail.width).toBe(IMAGE_SIZES.thumbnail);
        });

        it('should generate small size at correct width', async () => {
            const buffer = await createTestImage(2000, 1500, 'jpeg');
            const result = await generateResponsiveSizes(buffer, 'jpeg');

            expect(result.small.width).toBe(IMAGE_SIZES.small);
        });

        it('should generate medium size at correct width', async () => {
            const buffer = await createTestImage(2000, 1500, 'jpeg');
            const result = await generateResponsiveSizes(buffer, 'jpeg');

            expect(result.medium.width).toBe(IMAGE_SIZES.medium);
        });

        it('should generate large size at correct width', async () => {
            const buffer = await createTestImage(2000, 1500, 'jpeg');
            const result = await generateResponsiveSizes(buffer, 'jpeg');

            expect(result.large.width).toBe(IMAGE_SIZES.large);
        });

        it('should maintain aspect ratio across all sizes', async () => {
            const buffer = await createTestImage(2000, 1500, 'jpeg'); // 4:3 aspect ratio
            const result = await generateResponsiveSizes(buffer, 'jpeg');

            // Check each size maintains approximately 4:3 ratio
            const checkRatio = (width: number, height: number) => {
                const ratio = width / height;
                expect(ratio).toBeCloseTo(4 / 3, 1);
            };

            checkRatio(result.thumbnail.width, result.thumbnail.height);
            checkRatio(result.small.width, result.small.height);
            checkRatio(result.medium.width, result.medium.height);
            checkRatio(result.large.width, result.large.height);
        });

        it('should generate WebP format when specified', async () => {
            const buffer = await createTestImage(2000, 1500, 'jpeg');
            const result = await generateResponsiveSizes(buffer, 'webp');

            expect(result.thumbnail.format).toBe('webp');
            expect(result.small.format).toBe('webp');
            expect(result.medium.format).toBe('webp');
            expect(result.large.format).toBe('webp');
        });
    });

    describe('generateWebPWithFallback', () => {
        it('should generate both WebP and JPEG versions', async () => {
            const buffer = await createTestImage(800, 600, 'jpeg');
            const result = await generateWebPWithFallback(buffer);

            expect(result.webp).toBeDefined();
            expect(result.jpeg).toBeDefined();
            expect(result.webp.format).toBe('webp');
            expect(result.jpeg.format).toBe('jpeg');
        });

        it('should generate both versions at specified width', async () => {
            const buffer = await createTestImage(800, 600, 'jpeg');
            const result = await generateWebPWithFallback(buffer, 400);

            expect(result.webp.width).toBe(400);
            expect(result.jpeg.width).toBe(400);
        });

        it('should maintain original dimensions when width not specified', async () => {
            const buffer = await createTestImage(800, 600, 'jpeg');
            const result = await generateWebPWithFallback(buffer);

            expect(result.webp.width).toBe(800);
            expect(result.jpeg.width).toBe(800);
        });
    });

    describe('convertToFormat', () => {
        it('should convert JPEG to WebP', async () => {
            const buffer = await createTestImage(800, 600, 'jpeg');
            const result = await convertToFormat(buffer, 'webp');

            expect(result.format).toBe('webp');
        });

        it('should convert PNG to JPEG', async () => {
            const buffer = await createTestImage(800, 600, 'png');
            const result = await convertToFormat(buffer, 'jpeg');

            expect(result.format).toBe('jpeg');
        });

        it('should maintain dimensions during conversion', async () => {
            const buffer = await createTestImage(800, 600, 'jpeg');
            const result = await convertToFormat(buffer, 'webp');

            expect(result.width).toBe(800);
            expect(result.height).toBe(600);
        });
    });

    describe('optimizeImage', () => {
        it('should optimize image without changing dimensions', async () => {
            const buffer = await createTestImage(800, 600, 'jpeg');
            const result = await optimizeImage(buffer);

            expect(result.width).toBe(800);
            expect(result.height).toBe(600);
        });

        it('should reduce file size when optimizing', async () => {
            const buffer = await createTestImage(800, 600, 'jpeg');
            const originalSize = buffer.length;
            const result = await optimizeImage(buffer, 'jpeg', 60);

            expect(result.size).toBeLessThan(originalSize);
        });

        it('should maintain format when not specified', async () => {
            const buffer = await createTestImage(800, 600, 'png');
            const result = await optimizeImage(buffer);

            expect(result.format).toBe('png');
        });
    });

    describe('generateBlurPlaceholder', () => {
        it('should generate a small blur placeholder', async () => {
            const buffer = await createTestImage(800, 600, 'jpeg');
            const result = await generateBlurPlaceholder(buffer);

            expect(result.width).toBeLessThanOrEqual(20);
            expect(result.format).toBe('jpeg');
        });

        it('should create a very small file size', async () => {
            const buffer = await createTestImage(800, 600, 'jpeg');
            const result = await generateBlurPlaceholder(buffer);

            expect(result.size).toBeLessThan(2000); // Should be under 2KB
        });
    });

    describe('processImageForUpload', () => {
        it('should process a valid image successfully', async () => {
            const buffer = await createTestImage(800, 600, 'jpeg');
            const result = await processImageForUpload(buffer, 'image/jpeg');

            expect(result.isValid).toBe(true);
            expect(result.metadata).toBeDefined();
            expect(result.jpeg).toBeDefined();
            expect(result.webp).toBeDefined();
            expect(result.blurPlaceholder).toBeDefined();
        });

        it('should return error for invalid image', async () => {
            const invalidBuffer = Buffer.from('not an image');
            const result = await processImageForUpload(invalidBuffer, 'image/jpeg');

            expect(result.isValid).toBe(false);
            expect(result.error).toBeDefined();
        });

        it('should generate all responsive sizes in both formats', async () => {
            const buffer = await createTestImage(2000, 1500, 'jpeg');
            const result = await processImageForUpload(buffer, 'image/jpeg');

            expect(result.isValid).toBe(true);
            expect(result.jpeg?.thumbnail).toBeDefined();
            expect(result.jpeg?.small).toBeDefined();
            expect(result.jpeg?.medium).toBeDefined();
            expect(result.jpeg?.large).toBeDefined();
            expect(result.jpeg?.original).toBeDefined();
            expect(result.webp?.thumbnail).toBeDefined();
            expect(result.webp?.small).toBeDefined();
            expect(result.webp?.medium).toBeDefined();
            expect(result.webp?.large).toBeDefined();
            expect(result.webp?.original).toBeDefined();
        });

        it('should extract correct metadata', async () => {
            const buffer = await createTestImage(800, 600, 'jpeg');
            const result = await processImageForUpload(buffer, 'image/jpeg');

            expect(result.metadata?.width).toBe(800);
            expect(result.metadata?.height).toBe(600);
            expect(result.metadata?.format).toBe('jpeg');
        });
    });

    describe('calculateOptimalQuality', () => {
        it('should return 75 for very large images (>4MP)', () => {
            const quality = calculateOptimalQuality(2500, 2000); // 5MP
            expect(quality).toBe(75);
        });

        it('should return 80 for large images (>2MP)', () => {
            const quality = calculateOptimalQuality(2000, 1500); // 3MP
            expect(quality).toBe(80);
        });

        it('should return 85 for medium images (>0.5MP)', () => {
            const quality = calculateOptimalQuality(1000, 800); // 0.8MP
            expect(quality).toBe(85);
        });

        it('should return 90 for small images', () => {
            const quality = calculateOptimalQuality(500, 400); // 0.2MP
            expect(quality).toBe(90);
        });
    });

    describe('autoRotate', () => {
        it('should return a buffer for a valid image', async () => {
            const buffer = await createTestImage(800, 600, 'jpeg');
            const result = await autoRotate(buffer);

            expect(Buffer.isBuffer(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);
        });

        it('should throw error for invalid image data', async () => {
            const invalidBuffer = Buffer.from('not an image');

            await expect(autoRotate(invalidBuffer)).rejects.toThrow();
        });
    });

    describe('Edge Cases', () => {
        it('should handle very small images', async () => {
            const buffer = await createTestImage(50, 50, 'jpeg');
            const result = await resizeImage(buffer, IMAGE_SIZES.thumbnail, 'jpeg');

            expect(result.width).toBeLessThanOrEqual(50);
        });

        it('should handle square images', async () => {
            const buffer = await createTestImage(800, 800, 'jpeg');
            const result = await resizeImage(buffer, 400, 'jpeg');

            expect(result.width).toBe(400);
            expect(result.height).toBe(400);
        });

        it('should handle portrait orientation images', async () => {
            const buffer = await createTestImage(600, 800, 'jpeg'); // Portrait
            const result = await resizeImage(buffer, 400, 'jpeg');

            const aspectRatio = result.width / result.height;
            expect(aspectRatio).toBeCloseTo(600 / 800, 1);
        });

        it('should handle very large images', async () => {
            const buffer = await createTestImage(4000, 3000, 'jpeg');
            const result = await generateResponsiveSizes(buffer, 'jpeg');

            expect(result.large.width).toBe(IMAGE_SIZES.large);
        });
    });
});


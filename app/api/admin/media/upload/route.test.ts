/**
 * Tests for Media Upload API Endpoint
 * POST /api/admin/media/upload
 * 
 * Tests authentication, validation, error handling, and successful upload
 */

import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { POST, GET } from './route';
import * as auth from '@/lib/auth';
import * as imageUploadHelper from '@/lib/media/imageUploadHelper';
import * as cloudinary from '@/lib/cloudinary';
import { PrismaClient } from '@prisma/client';

// Mock dependencies
jest.mock('@/lib/auth');
jest.mock('@/lib/imageUploadHelper');
jest.mock('@/lib/cloudinary');
jest.mock('@prisma/client', () => {
    const mockPrisma = {
        mediaAsset: {
            create: jest.fn(),
        },
        $disconnect: jest.fn(),
    };
    return {
        PrismaClient: jest.fn(() => mockPrisma),
    };
});

describe('POST /api/admin/media/upload', () => {
    let mockGetSession: jest.MockedFunction<typeof auth.getSession>;
    let mockProcessAndUploadImage: jest.MockedFunction<typeof imageUploadHelper.processAndUploadImage>;
    let mockValidateImageFile: jest.MockedFunction<typeof cloudinary.validateImageFile>;

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        mockGetSession = auth.getSession as jest.MockedFunction<typeof auth.getSession>;
        mockProcessAndUploadImage = imageUploadHelper.processAndUploadImage as jest.MockedFunction<typeof imageUploadHelper.processAndUploadImage>;
        mockValidateImageFile = cloudinary.validateImageFile as jest.MockedFunction<typeof cloudinary.validateImageFile>;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Authentication', () => {
        it('should return 401 if user is not authenticated', async () => {
            // Mock no session
            mockGetSession.mockResolvedValue(null);

            const formData = new FormData();
            const request = new NextRequest('http://localhost/api/admin/media/upload', {
                method: 'POST',
                body: formData,
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
            expect(data.error).toContain('Unauthorized');
        });

        it('should return 401 if session exists but no user', async () => {
            // Mock session without user
            mockGetSession.mockResolvedValue({ user: null } as any);

            const formData = new FormData();
            const request = new NextRequest('http://localhost/api/admin/media/upload', {
                method: 'POST',
                body: formData,
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
            expect(data.error).toContain('Unauthorized');
        });
    });

    describe('File Validation', () => {
        beforeEach(() => {
            // Mock authenticated session for validation tests
            mockGetSession.mockResolvedValue({
                user: {
                    id: 'user123',
                    email: 'test@example.com',
                    name: 'Test User',
                },
            } as any);
        });

        it('should return 400 if no file is provided', async () => {
            const formData = new FormData();
            const request = new NextRequest('http://localhost/api/admin/media/upload', {
                method: 'POST',
                body: formData,
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error).toContain('No file provided');
        });

        it('should return 400 if file size exceeds 10MB', async () => {
            // Mock file validation to fail for size
            mockValidateImageFile.mockReturnValue({
                isValid: false,
                error: 'Image must be smaller than 10MB. Please compress or choose a different image.',
            });

            // Create a mock file
            const mockFile = new File([''], 'large-image.jpg', { type: 'image/jpeg' });
            const formData = new FormData();
            formData.append('file', mockFile);

            const request = new NextRequest('http://localhost/api/admin/media/upload', {
                method: 'POST',
                body: formData,
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error).toContain('10MB');
        });

        it('should return 400 if file format is not supported', async () => {
            // Mock file validation to fail for format
            mockValidateImageFile.mockReturnValue({
                isValid: false,
                error: 'Only JPEG, PNG, and WebP formats are supported. Please convert your image.',
            });

            // Create a mock file with unsupported format
            const mockFile = new File([''], 'image.gif', { type: 'image/gif' });
            const formData = new FormData();
            formData.append('file', mockFile);

            const request = new NextRequest('http://localhost/api/admin/media/upload', {
                method: 'POST',
                body: formData,
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error).toContain('JPEG, PNG, and WebP');
        });
    });

    describe('Image Processing and Upload', () => {
        beforeEach(() => {
            // Mock authenticated session
            mockGetSession.mockResolvedValue({
                user: {
                    id: 'user123',
                    email: 'test@example.com',
                    name: 'Test User',
                },
            } as any);

            // Mock file validation to pass
            mockValidateImageFile.mockReturnValue({
                isValid: true,
            });
        });

        it('should return 500 if image processing fails', async () => {
            // Mock processing failure
            mockProcessAndUploadImage.mockResolvedValue({
                success: false,
                error: 'Failed to process image',
            });

            const mockFile = new File(['fake-image-data'], 'test.jpg', { type: 'image/jpeg' });
            const formData = new FormData();
            formData.append('file', mockFile);

            const request = new NextRequest('http://localhost/api/admin/media/upload', {
                method: 'POST',
                body: formData,
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.error).toBeTruthy();
        });

        it('should successfully upload and create MediaAsset record', async () => {
            // Mock successful processing and upload
            const mockUploadResult = {
                success: true,
                metadata: {
                    width: 1920,
                    height: 1080,
                    format: 'jpeg',
                    size: 500000,
                    hasAlpha: false,
                },
                urls: {
                    jpeg: {
                        thumbnail: 'https://cloudinary.com/thumbnail.jpg',
                        small: 'https://cloudinary.com/small.jpg',
                        medium: 'https://cloudinary.com/medium.jpg',
                        large: 'https://cloudinary.com/large.jpg',
                        original: 'https://cloudinary.com/original.jpg',
                    },
                    webp: {
                        thumbnail: 'https://cloudinary.com/thumbnail.webp',
                        small: 'https://cloudinary.com/small.webp',
                        medium: 'https://cloudinary.com/medium.webp',
                        large: 'https://cloudinary.com/large.webp',
                        original: 'https://cloudinary.com/original.webp',
                    },
                    blurPlaceholder: 'https://cloudinary.com/blur.jpg',
                },
                publicIds: {
                    jpeg: {
                        thumbnail: 'thumb_id',
                        small: 'small_id',
                        medium: 'medium_id',
                        large: 'large_id',
                        original: 'original_id',
                    },
                    webp: {
                        thumbnail: 'thumb_webp_id',
                        small: 'small_webp_id',
                        medium: 'medium_webp_id',
                        large: 'large_webp_id',
                        original: 'original_webp_id',
                    },
                    blurPlaceholder: 'blur_id',
                },
            };

            mockProcessAndUploadImage.mockResolvedValue(mockUploadResult);

            // Mock Prisma create
            const mockMediaAsset = {
                id: 'media123',
                filename: 'test.jpg',
                originalUrl: mockUploadResult.urls.jpeg.original,
                thumbnailUrl: mockUploadResult.urls.jpeg.thumbnail,
                smallUrl: mockUploadResult.urls.jpeg.small,
                mediumUrl: mockUploadResult.urls.jpeg.medium,
                largeUrl: mockUploadResult.urls.jpeg.large,
                width: 1920,
                height: 1080,
                size: 500000,
                mimeType: 'image/jpeg',
                uploadedAt: new Date('2024-01-01'),
            };

            const prisma = new PrismaClient();
            (prisma.mediaAsset.create as jest.MockedFunction<any>).mockResolvedValue(mockMediaAsset);

            const mockFile = new File(['fake-image-data'], 'test.jpg', { type: 'image/jpeg' });
            const formData = new FormData();
            formData.append('file', mockFile);

            const request = new NextRequest('http://localhost/api/admin/media/upload', {
                method: 'POST',
                body: formData,
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
            expect(data.media).toBeDefined();
            expect(data.media.id).toBe('media123');
            expect(data.media.filename).toBe('test.jpg');
            expect(data.media.width).toBe(1920);
            expect(data.media.height).toBe(1080);
            expect(data.media.urls).toBeDefined();
            expect(data.media.urls.jpeg).toBeDefined();
            expect(data.media.urls.webp).toBeDefined();
            expect(data.media.publicIds).toBeDefined();
        });

        it('should handle unexpected errors gracefully', async () => {
            // Mock an unexpected error during processing
            mockProcessAndUploadImage.mockRejectedValue(new Error('Unexpected error'));

            const mockFile = new File(['fake-image-data'], 'test.jpg', { type: 'image/jpeg' });
            const formData = new FormData();
            formData.append('file', mockFile);

            const request = new NextRequest('http://localhost/api/admin/media/upload', {
                method: 'POST',
                body: formData,
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.error).toBeTruthy();
        });
    });

    describe('Edge Cases', () => {
        beforeEach(() => {
            // Mock authenticated session
            mockGetSession.mockResolvedValue({
                user: {
                    id: 'user123',
                    email: 'test@example.com',
                    name: 'Test User',
                },
            } as any);

            mockValidateImageFile.mockReturnValue({
                isValid: true,
            });
        });

        it('should return 500 if upload result is missing required data', async () => {
            // Mock incomplete upload result
            mockProcessAndUploadImage.mockResolvedValue({
                success: true,
                metadata: undefined, // Missing metadata
                urls: undefined, // Missing URLs
                publicIds: undefined, // Missing public IDs
            });

            const mockFile = new File(['fake-image-data'], 'test.jpg', { type: 'image/jpeg' });
            const formData = new FormData();
            formData.append('file', mockFile);

            const request = new NextRequest('http://localhost/api/admin/media/upload', {
                method: 'POST',
                body: formData,
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.error).toContain('missing required data');
        });

        it('should return 201 with media URLs even when DB save fails', async () => {
            // Mock successful processing and upload
            const mockUploadResult = {
                success: true,
                metadata: {
                    width: 800,
                    height: 600,
                    format: 'jpeg',
                    size: 200000,
                    hasAlpha: false,
                },
                urls: {
                    jpeg: {
                        thumbnail: 'https://cloudinary.com/thumbnail.jpg',
                        small: 'https://cloudinary.com/small.jpg',
                        medium: 'https://cloudinary.com/medium.jpg',
                        large: 'https://cloudinary.com/large.jpg',
                        original: 'https://cloudinary.com/original.jpg',
                    },
                    webp: {
                        thumbnail: 'https://cloudinary.com/thumbnail.webp',
                        small: 'https://cloudinary.com/small.webp',
                        medium: 'https://cloudinary.com/medium.webp',
                        large: 'https://cloudinary.com/large.webp',
                        original: 'https://cloudinary.com/original.webp',
                    },
                    blurPlaceholder: 'https://cloudinary.com/blur.jpg',
                },
                publicIds: {
                    jpeg: {
                        thumbnail: 'thumb_id',
                        small: 'small_id',
                        medium: 'medium_id',
                        large: 'large_id',
                        original: 'original_id',
                    },
                    webp: {
                        thumbnail: 'thumb_webp_id',
                        small: 'small_webp_id',
                        medium: 'medium_webp_id',
                        large: 'large_webp_id',
                        original: 'original_webp_id',
                    },
                    blurPlaceholder: 'blur_id',
                },
            };

            mockProcessAndUploadImage.mockResolvedValue(mockUploadResult);

            // Mock Prisma create to throw a DB connection error
            const prisma = new PrismaClient();
            (prisma.mediaAsset.create as jest.MockedFunction<any>).mockRejectedValue(
                new Error('Connection refused')
            );

            const mockFile = new File(['fake-image-data'], 'fallback.jpg', { type: 'image/jpeg' });
            const formData = new FormData();
            formData.append('file', mockFile);

            const request = new NextRequest('http://localhost/api/admin/media/upload', {
                method: 'POST',
                body: formData,
            });

            const response = await POST(request);
            const data = await response.json();

            // Should still succeed — file is on Cloudinary
            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
            expect(data.media).toBeDefined();
            expect(data.media.url).toBe(mockUploadResult.urls.jpeg.original);
            expect(data.media.thumbnailUrl).toBe(mockUploadResult.urls.jpeg.thumbnail);
            expect(data.media.filename).toBe('fallback.jpg');
            expect(data.media.urls).toBeDefined();
            // id should be null when DB save failed
            expect(data.media.id).toBeNull();
            // A warning should be present
            expect(data.warning).toBeTruthy();
        });
    });
});

describe('GET /api/admin/media/upload', () => {
    it('should return 405 Method Not Allowed for GET requests', async () => {
        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(405);
        expect(data.success).toBe(false);
        expect(data.error).toContain('Method not allowed');
    });
});

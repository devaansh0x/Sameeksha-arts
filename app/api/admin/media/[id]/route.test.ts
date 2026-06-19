/**
 * Tests for Media Asset Delete API Endpoint
 * DELETE /api/admin/media/[id]
 *
 * Tests: authentication, 404 handling, in-use warning without force,
 * forced deletion, clean deletion, Cloudinary error handling, 405 responses.
 *
 * Requirements: 18.4, 18.5, 11.8
 * Task: 14.2
 */

import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { DELETE, GET, POST, PUT, extractCloudinaryPublicId } from './route';
import * as auth from '@/lib/auth';
import * as cloudinaryLib from '@/lib/cloudinary';
import prismaMock from '@/lib/database/prisma';

// ── Mock dependencies ─────────────────────────────────────────────────────────

jest.mock('@/lib/auth');

jest.mock('@/lib/prisma', () => ({
    __esModule: true,
    default: {
        mediaAsset: {
            findUnique: jest.fn(),
            delete: jest.fn(),
        },
        artworkImage: {
            count: jest.fn(),
        },
    },
}));

jest.mock('@/lib/cloudinary', () => ({
    __esModule: true,
    deleteImage: jest.fn(),
}));

// ── Typed mock references ─────────────────────────────────────────────────────

const mockGetSession = auth.getSession as jest.MockedFunction<typeof auth.getSession>;
const mockFindUnique = prismaMock.mediaAsset.findUnique as jest.MockedFunction<typeof prismaMock.mediaAsset.findUnique>;
const mockDelete = prismaMock.mediaAsset.delete as jest.MockedFunction<typeof prismaMock.mediaAsset.delete>;
const mockArtworkCount = prismaMock.artworkImage.count as jest.MockedFunction<typeof prismaMock.artworkImage.count>;
const mockDeleteImage = cloudinaryLib.deleteImage as jest.MockedFunction<typeof cloudinaryLib.deleteImage>;

// ── Helpers ───────────────────────────────────────────────────────────────────

const ASSET_ID = 'asset-abc-123';

function makeRequest(id: string, force?: boolean): [NextRequest, { params: { id: string } }] {
    const url = force
        ? `http://localhost/api/admin/media/${id}?force=true`
        : `http://localhost/api/admin/media/${id}`;
    const request = new NextRequest(url, { method: 'DELETE' });
    return [request, { params: { id } }];
}

const mockSession = {
    user: { id: 'user1', email: 'admin@example.com', name: 'Admin' },
};

/** Build a minimal MediaAsset row */
function makeAsset(overrides: Partial<{
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
}> = {}) {
    return {
        id: ASSET_ID,
        filename: 'photo.jpg',
        originalUrl: 'https://res.cloudinary.com/demo/image/upload/v1234/sameeksha-arts/artwork/photo.jpg',
        thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/w_150,f_auto/sameeksha-arts/artwork/photo.jpg',
        smallUrl: 'https://res.cloudinary.com/demo/image/upload/w_480,f_auto/sameeksha-arts/artwork/photo.jpg',
        mediumUrl: 'https://res.cloudinary.com/demo/image/upload/w_1024,f_auto/sameeksha-arts/artwork/photo.jpg',
        largeUrl: 'https://res.cloudinary.com/demo/image/upload/w_1920,f_auto/sameeksha-arts/artwork/photo.jpg',
        width: 1920,
        height: 1080,
        size: 512000,
        mimeType: 'image/jpeg',
        uploadedAt: new Date('2024-06-15T10:00:00Z'),
        ...overrides,
    };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('DELETE /api/admin/media/[id]', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // ── Authentication ────────────────────────────────────────────────────────

    describe('Authentication', () => {
        it('returns 401 when no session exists', async () => {
            mockGetSession.mockResolvedValue(null);

            const [req, ctx] = makeRequest(ASSET_ID);
            const response = await DELETE(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
            expect(data.error).toContain('Unauthorized');
        });

        it('returns 401 when session has no user', async () => {
            mockGetSession.mockResolvedValue({ user: null } as any);

            const [req, ctx] = makeRequest(ASSET_ID);
            const response = await DELETE(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
        });

        it('does not call prisma when unauthenticated', async () => {
            mockGetSession.mockResolvedValue(null);

            const [req, ctx] = makeRequest(ASSET_ID);
            await DELETE(req, ctx);

            expect(mockFindUnique).not.toHaveBeenCalled();
        });
    });

    // ── Not Found ─────────────────────────────────────────────────────────────

    describe('Not found', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue(mockSession as any);
        });

        it('returns 404 when asset does not exist', async () => {
            mockFindUnique.mockResolvedValue(null);

            const [req, ctx] = makeRequest(ASSET_ID);
            const response = await DELETE(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.success).toBe(false);
            expect(data.error).toContain('not found');
        });

        it('does not attempt deletion when asset is not found', async () => {
            mockFindUnique.mockResolvedValue(null);

            const [req, ctx] = makeRequest(ASSET_ID);
            await DELETE(req, ctx);

            expect(mockDelete).not.toHaveBeenCalled();
            expect(mockDeleteImage).not.toHaveBeenCalled();
        });
    });

    // ── In-use warning ────────────────────────────────────────────────────────

    describe('In-use warning (no force)', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue(mockSession as any);
            mockFindUnique.mockResolvedValue(makeAsset());
        });

        it('returns 200 with success:false and warning when asset is in use', async () => {
            mockArtworkCount.mockResolvedValue(3);

            const [req, ctx] = makeRequest(ASSET_ID);
            const response = await DELETE(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(false);
            expect(data.warning).toContain('3 artwork(s)');
            expect(data.inUse).toBe(true);
            expect(data.artworkCount).toBe(3);
        });

        it('includes singular artwork in warning message for count of 1', async () => {
            mockArtworkCount.mockResolvedValue(1);

            const [req, ctx] = makeRequest(ASSET_ID);
            const response = await DELETE(req, ctx);
            const data = await response.json();

            expect(data.warning).toContain('1 artwork(s)');
            expect(data.artworkCount).toBe(1);
        });

        it('does NOT delete the DB record when asset is in use and force is absent', async () => {
            mockArtworkCount.mockResolvedValue(2);

            const [req, ctx] = makeRequest(ASSET_ID);
            await DELETE(req, ctx);

            expect(mockDelete).not.toHaveBeenCalled();
        });

        it('does NOT call Cloudinary delete when returning in-use warning', async () => {
            mockArtworkCount.mockResolvedValue(2);

            const [req, ctx] = makeRequest(ASSET_ID);
            await DELETE(req, ctx);

            expect(mockDeleteImage).not.toHaveBeenCalled();
        });
    });

    // ── Forced deletion ───────────────────────────────────────────────────────

    describe('Forced deletion (?force=true)', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue(mockSession as any);
            mockFindUnique.mockResolvedValue(makeAsset());
            mockArtworkCount.mockResolvedValue(2);
            mockDelete.mockResolvedValue(makeAsset() as any);
            mockDeleteImage.mockResolvedValue({ result: 'ok' });
        });

        it('returns 200 with success:true when force=true even if in use', async () => {
            const [req, ctx] = makeRequest(ASSET_ID, true);
            const response = await DELETE(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.message).toContain('deleted successfully');
        });

        it('deletes the DB record when force=true', async () => {
            const [req, ctx] = makeRequest(ASSET_ID, true);
            await DELETE(req, ctx);

            expect(mockDelete).toHaveBeenCalledWith({ where: { id: ASSET_ID } });
        });

        it('calls Cloudinary delete for each image URL when force=true', async () => {
            const [req, ctx] = makeRequest(ASSET_ID, true);
            await DELETE(req, ctx);

            // 5 URLs: original, thumbnail, small, medium, large
            expect(mockDeleteImage).toHaveBeenCalledTimes(5);
        });
    });

    // ── Clean deletion (not in use) ───────────────────────────────────────────

    describe('Clean deletion (not in use)', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue(mockSession as any);
            mockFindUnique.mockResolvedValue(makeAsset());
            mockArtworkCount.mockResolvedValue(0);
            mockDelete.mockResolvedValue(makeAsset() as any);
            mockDeleteImage.mockResolvedValue({ result: 'ok' });
        });

        it('returns 200 with success:true when asset is not in use', async () => {
            const [req, ctx] = makeRequest(ASSET_ID);
            const response = await DELETE(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.message).toContain('deleted successfully');
        });

        it('calls prisma.mediaAsset.delete with correct id', async () => {
            const [req, ctx] = makeRequest(ASSET_ID);
            await DELETE(req, ctx);

            expect(mockDelete).toHaveBeenCalledWith({ where: { id: ASSET_ID } });
        });

        it('calls Cloudinary deleteImage for all 5 image URLs', async () => {
            const [req, ctx] = makeRequest(ASSET_ID);
            await DELETE(req, ctx);

            expect(mockDeleteImage).toHaveBeenCalledTimes(5);
        });
    });

    // ── Cloudinary error handling ─────────────────────────────────────────────

    describe('Cloudinary error handling', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue(mockSession as any);
            mockFindUnique.mockResolvedValue(makeAsset());
            mockArtworkCount.mockResolvedValue(0);
            mockDelete.mockResolvedValue(makeAsset() as any);
        });

        it('still returns success:true even when Cloudinary delete fails', async () => {
            mockDeleteImage.mockRejectedValue(new Error('Cloudinary API error'));

            const [req, ctx] = makeRequest(ASSET_ID);
            const response = await DELETE(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
        });

        it('DB record is deleted even when Cloudinary fails', async () => {
            mockDeleteImage.mockRejectedValue(new Error('CDN timeout'));

            const [req, ctx] = makeRequest(ASSET_ID);
            await DELETE(req, ctx);

            expect(mockDelete).toHaveBeenCalledWith({ where: { id: ASSET_ID } });
        });
    });

    // ── Database error handling ───────────────────────────────────────────────

    describe('Database error handling', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue(mockSession as any);
        });

        it('returns 500 when findUnique throws', async () => {
            mockFindUnique.mockRejectedValue(new Error('DB connection lost'));

            const [req, ctx] = makeRequest(ASSET_ID);
            const response = await DELETE(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
        });

        it('returns 500 when artworkImage.count throws', async () => {
            mockFindUnique.mockResolvedValue(makeAsset());
            mockArtworkCount.mockRejectedValue(new Error('Query failed'));

            const [req, ctx] = makeRequest(ASSET_ID);
            const response = await DELETE(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
        });

        it('returns 500 when mediaAsset.delete throws', async () => {
            mockFindUnique.mockResolvedValue(makeAsset());
            mockArtworkCount.mockResolvedValue(0);
            mockDelete.mockRejectedValue(new Error('Record in use'));

            const [req, ctx] = makeRequest(ASSET_ID);
            const response = await DELETE(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
        });
    });
});

// ── Method-not-allowed handlers ───────────────────────────────────────────────

describe('Non-DELETE methods on /api/admin/media/[id]', () => {
    it('GET returns 405', async () => {
        const response = await GET();
        const data = await response.json();
        expect(response.status).toBe(405);
        expect(data.success).toBe(false);
    });

    it('POST returns 405', async () => {
        const response = await POST();
        const data = await response.json();
        expect(response.status).toBe(405);
        expect(data.success).toBe(false);
    });

    it('PUT returns 405', async () => {
        const response = await PUT();
        const data = await response.json();
        expect(response.status).toBe(405);
        expect(data.success).toBe(false);
    });
});

// ── extractCloudinaryPublicId helper ─────────────────────────────────────────

describe('extractCloudinaryPublicId', () => {
    it('extracts public_id from a versioned URL', () => {
        const url = 'https://res.cloudinary.com/demo/image/upload/v1234567890/sameeksha-arts/artwork/photo.jpg';
        expect(extractCloudinaryPublicId(url)).toBe('sameeksha-arts/artwork/photo');
    });

    it('extracts public_id from a transformed URL with width', () => {
        const url = 'https://res.cloudinary.com/demo/image/upload/w_150,f_auto/sameeksha-arts/artwork/photo.jpg';
        expect(extractCloudinaryPublicId(url)).toBe('sameeksha-arts/artwork/photo');
    });

    it('extracts public_id from a URL without version or transformations', () => {
        const url = 'https://res.cloudinary.com/demo/image/upload/sameeksha-arts/artwork/photo.jpg';
        expect(extractCloudinaryPublicId(url)).toBe('sameeksha-arts/artwork/photo');
    });

    it('returns null for an empty string', () => {
        expect(extractCloudinaryPublicId('')).toBeNull();
    });

    it('returns null for a URL without /upload/', () => {
        expect(extractCloudinaryPublicId('https://example.com/image.jpg')).toBeNull();
    });
});

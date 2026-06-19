/**
 * Tests for Media Library API Endpoint
 * GET /api/admin/media
 *
 * Tests: authentication, search filtering, date filtering, pagination, empty results,
 * and method-not-allowed behaviour.
 *
 * Requirements: 18.1, 18.2, 18.6, 18.7
 */

import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET, POST, PUT, DELETE } from './route';
import * as auth from '@/lib/auth';
import prismaMock from '@/lib/database/prisma';

// ── Mock dependencies ─────────────────────────────────────────────────────────

jest.mock('@/lib/auth');

jest.mock('@/lib/prisma', () => ({
    __esModule: true,
    default: {
        mediaAsset: {
            findMany: jest.fn(),
            count: jest.fn(),
        },
    },
}));

// Typed references to the mock functions (resolved after jest.mock hoisting)
const mockFindMany = prismaMock.mediaAsset.findMany as jest.MockedFunction<typeof prismaMock.mediaAsset.findMany>;
const mockCount = prismaMock.mediaAsset.count as jest.MockedFunction<typeof prismaMock.mediaAsset.count>;

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRequest(url: string): NextRequest {
    return new NextRequest(url, { method: 'GET' });
}

const mockSession = {
    user: { id: 'user1', email: 'admin@example.com', name: 'Admin' },
};

/** Build a minimal MediaAsset row as Prisma would return it */
function makeAsset(overrides: Partial<{
    id: string;
    filename: string;
    thumbnailUrl: string;
    originalUrl: string;
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
        id: 'asset1',
        filename: 'photo.jpg',
        thumbnailUrl: 'https://cdn.example.com/photo_thumb.jpg',
        originalUrl: 'https://cdn.example.com/photo_orig.jpg',
        smallUrl: 'https://cdn.example.com/photo_small.jpg',
        mediumUrl: 'https://cdn.example.com/photo_medium.jpg',
        largeUrl: 'https://cdn.example.com/photo_large.jpg',
        width: 1920,
        height: 1080,
        size: 512000,
        mimeType: 'image/jpeg',
        uploadedAt: new Date('2024-06-15T10:00:00Z'),
        ...overrides,
    };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('GET /api/admin/media', () => {
    let mockGetSession: jest.MockedFunction<typeof auth.getSession>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetSession = auth.getSession as jest.MockedFunction<typeof auth.getSession>;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // ── Authentication ────────────────────────────────────────────────────────

    describe('Authentication', () => {
        it('returns 401 when no session exists', async () => {
            mockGetSession.mockResolvedValue(null);

            const response = await GET(makeRequest('http://localhost/api/admin/media'));
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
            expect(data.error).toContain('Unauthorized');
        });

        it('returns 401 when session has no user', async () => {
            mockGetSession.mockResolvedValue({ user: null } as any);

            const response = await GET(makeRequest('http://localhost/api/admin/media'));
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
        });

        it('proceeds when session is valid', async () => {
            mockGetSession.mockResolvedValue(mockSession as any);
            mockCount.mockResolvedValue(0);
            mockFindMany.mockResolvedValue([]);

            const response = await GET(makeRequest('http://localhost/api/admin/media'));

            expect(response.status).toBe(200);
        });
    });

    // ── Empty results ─────────────────────────────────────────────────────────

    describe('Empty results', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue(mockSession as any);
        });

        it('returns success with empty media array when no assets exist', async () => {
            mockCount.mockResolvedValue(0);
            mockFindMany.mockResolvedValue([]);

            const response = await GET(makeRequest('http://localhost/api/admin/media'));
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.media).toEqual([]);
            expect(data.pagination.total).toBe(0);
            expect(data.pagination.totalPages).toBe(0);
        });
    });

    // ── Response shape ────────────────────────────────────────────────────────

    describe('Response shape', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue(mockSession as any);
        });

        it('serialises each asset with required fields including ISO uploadedAt', async () => {
            const asset = makeAsset({ uploadedAt: new Date('2024-06-15T10:00:00Z') });
            mockCount.mockResolvedValue(1);
            mockFindMany.mockResolvedValue([asset]);

            const response = await GET(makeRequest('http://localhost/api/admin/media'));
            const data = await response.json();

            expect(data.success).toBe(true);
            expect(data.media).toHaveLength(1);

            const item = data.media[0];
            expect(item.id).toBe('asset1');
            expect(item.filename).toBe('photo.jpg');
            expect(item.thumbnailUrl).toBe(asset.thumbnailUrl);
            expect(item.originalUrl).toBe(asset.originalUrl);
            expect(item.smallUrl).toBe(asset.smallUrl);
            expect(item.mediumUrl).toBe(asset.mediumUrl);
            expect(item.largeUrl).toBe(asset.largeUrl);
            expect(item.width).toBe(1920);
            expect(item.height).toBe(1080);
            expect(item.size).toBe(512000);
            expect(item.mimeType).toBe('image/jpeg');
            expect(item.uploadedAt).toBe('2024-06-15T10:00:00.000Z');
        });
    });

    // ── Search filtering ──────────────────────────────────────────────────────

    describe('Search filtering', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue(mockSession as any);
        });

        it('passes case-insensitive contains filter when search param is provided', async () => {
            mockCount.mockResolvedValue(1);
            mockFindMany.mockResolvedValue([makeAsset({ filename: 'sunset.jpg' })]);

            const response = await GET(makeRequest('http://localhost/api/admin/media?search=sunset'));
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);

            // Verify Prisma was called with the correct where clause
            expect(mockFindMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        filename: { contains: 'sunset', mode: 'insensitive' },
                    }),
                })
            );
        });

        it('omits filename filter when search param is absent', async () => {
            mockCount.mockResolvedValue(2);
            mockFindMany.mockResolvedValue([makeAsset(), makeAsset({ id: 'asset2', filename: 'other.png' })]);

            await GET(makeRequest('http://localhost/api/admin/media'));

            const whereArg = (mockFindMany as jest.MockedFunction<any>).mock.calls[0][0].where;
            expect(whereArg.filename).toBeUndefined();
        });
    });

    // ── Date filtering ────────────────────────────────────────────────────────

    describe('Date filtering', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue(mockSession as any);
        });

        it('applies gte filter when only "from" is provided', async () => {
            mockCount.mockResolvedValue(1);
            mockFindMany.mockResolvedValue([makeAsset()]);

            await GET(makeRequest('http://localhost/api/admin/media?from=2024-01-01'));

            const whereArg = (mockFindMany as jest.MockedFunction<any>).mock.calls[0][0].where;
            expect(whereArg.uploadedAt?.gte).toEqual(new Date('2024-01-01'));
            expect(whereArg.uploadedAt?.lte).toBeUndefined();
        });

        it('applies lte filter when only "to" is provided', async () => {
            mockCount.mockResolvedValue(1);
            mockFindMany.mockResolvedValue([makeAsset()]);

            await GET(makeRequest('http://localhost/api/admin/media?to=2024-12-31'));

            const whereArg = (mockFindMany as jest.MockedFunction<any>).mock.calls[0][0].where;
            expect(whereArg.uploadedAt?.lte).toEqual(new Date('2024-12-31'));
            expect(whereArg.uploadedAt?.gte).toBeUndefined();
        });

        it('applies both gte and lte when both "from" and "to" are provided', async () => {
            mockCount.mockResolvedValue(1);
            mockFindMany.mockResolvedValue([makeAsset()]);

            await GET(makeRequest('http://localhost/api/admin/media?from=2024-01-01&to=2024-12-31'));

            const whereArg = (mockFindMany as jest.MockedFunction<any>).mock.calls[0][0].where;
            expect(whereArg.uploadedAt?.gte).toEqual(new Date('2024-01-01'));
            expect(whereArg.uploadedAt?.lte).toEqual(new Date('2024-12-31'));
        });

        it('omits uploadedAt filter when no date params are given', async () => {
            mockCount.mockResolvedValue(0);
            mockFindMany.mockResolvedValue([]);

            await GET(makeRequest('http://localhost/api/admin/media'));

            const whereArg = (mockFindMany as jest.MockedFunction<any>).mock.calls[0][0].where;
            expect(whereArg.uploadedAt).toBeUndefined();
        });

        it('ignores invalid date strings', async () => {
            mockCount.mockResolvedValue(0);
            mockFindMany.mockResolvedValue([]);

            await GET(makeRequest('http://localhost/api/admin/media?from=not-a-date&to=also-invalid'));

            // Should not throw and uploadedAt may be present but with empty object or no gte/lte
            const whereArg = (mockFindMany as jest.MockedFunction<any>).mock.calls[0][0].where;
            // The route initialises uploadedAt as {} when either param is provided,
            // but skips assigning gte/lte when the dates are invalid — either shape is acceptable.
            if (whereArg.uploadedAt) {
                expect(whereArg.uploadedAt.gte).toBeUndefined();
                expect(whereArg.uploadedAt.lte).toBeUndefined();
            }
        });
    });

    // ── Pagination ────────────────────────────────────────────────────────────

    describe('Pagination', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue(mockSession as any);
        });

        it('defaults to page 1, limit 20', async () => {
            mockCount.mockResolvedValue(0);
            mockFindMany.mockResolvedValue([]);

            await GET(makeRequest('http://localhost/api/admin/media'));

            expect(mockFindMany).toHaveBeenCalledWith(
                expect.objectContaining({ skip: 0, take: 20 })
            );
        });

        it('returns correct pagination metadata', async () => {
            mockCount.mockResolvedValue(55);
            mockFindMany.mockResolvedValue([makeAsset()]);

            const response = await GET(makeRequest('http://localhost/api/admin/media?page=2&limit=20'));
            const data = await response.json();

            expect(data.pagination.total).toBe(55);
            expect(data.pagination.page).toBe(2);
            expect(data.pagination.limit).toBe(20);
            expect(data.pagination.totalPages).toBe(3);
        });

        it('uses correct skip value for the requested page', async () => {
            mockCount.mockResolvedValue(100);
            mockFindMany.mockResolvedValue([]);

            await GET(makeRequest('http://localhost/api/admin/media?page=3&limit=10'));

            expect(mockFindMany).toHaveBeenCalledWith(
                expect.objectContaining({ skip: 20, take: 10 })
            );
        });

        it('caps limit at 100', async () => {
            mockCount.mockResolvedValue(0);
            mockFindMany.mockResolvedValue([]);

            await GET(makeRequest('http://localhost/api/admin/media?limit=999'));

            expect(mockFindMany).toHaveBeenCalledWith(
                expect.objectContaining({ take: 100 })
            );
        });

        it('defaults invalid page to 1', async () => {
            mockCount.mockResolvedValue(0);
            mockFindMany.mockResolvedValue([]);

            await GET(makeRequest('http://localhost/api/admin/media?page=abc'));

            expect(mockFindMany).toHaveBeenCalledWith(
                expect.objectContaining({ skip: 0 })
            );
        });

        it('orders results by uploadedAt descending', async () => {
            mockCount.mockResolvedValue(0);
            mockFindMany.mockResolvedValue([]);

            await GET(makeRequest('http://localhost/api/admin/media'));

            expect(mockFindMany).toHaveBeenCalledWith(
                expect.objectContaining({ orderBy: { uploadedAt: 'desc' } })
            );
        });
    });

    // ── Combined search + date filter ─────────────────────────────────────────

    describe('Combined filters', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue(mockSession as any);
        });

        it('combines search and date filters in one query', async () => {
            mockCount.mockResolvedValue(1);
            mockFindMany.mockResolvedValue([makeAsset()]);

            await GET(makeRequest(
                'http://localhost/api/admin/media?search=portrait&from=2024-01-01&to=2024-12-31'
            ));

            const whereArg = (mockFindMany as jest.MockedFunction<any>).mock.calls[0][0].where;
            expect(whereArg.filename).toEqual({ contains: 'portrait', mode: 'insensitive' });
            expect(whereArg.uploadedAt?.gte).toEqual(new Date('2024-01-01'));
            expect(whereArg.uploadedAt?.lte).toEqual(new Date('2024-12-31'));
        });
    });

    // ── Error handling ────────────────────────────────────────────────────────

    describe('Error handling', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue(mockSession as any);
        });

        it('returns 500 when Prisma throws an error', async () => {
            mockCount.mockRejectedValue(new Error('DB connection lost'));

            const response = await GET(makeRequest('http://localhost/api/admin/media'));
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.error).toBeTruthy();
        });
    });
});

// ── Method-not-allowed handlers ───────────────────────────────────────────────

describe('Non-GET methods on /api/admin/media', () => {
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

    it('DELETE returns 405', async () => {
        const response = await DELETE();
        const data = await response.json();
        expect(response.status).toBe(405);
        expect(data.success).toBe(false);
    });
});

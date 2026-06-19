/**
 * Tests for Artwork Update API Endpoint
 * PUT /api/admin/artwork/[id]
 *
 * Covers: authentication, artwork not found, validation errors,
 * successful update with image reordering, SSG revalidation, and 405s.
 *
 * Requirements: 10.4, 10.5, 10.7, 11.6, 11.7
 * Task: 7.2
 */

import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Prisma mock — factory must not reference outer-scope variables
// ---------------------------------------------------------------------------
const prismaMock = {
    $transaction: jest.fn(),
    artwork: {
        findUnique: jest.fn(),
    },
};

jest.mock('@/lib/prisma', () => ({
    __esModule: true,
    get default() {
        return prismaMock;
    },
}));

jest.mock('@/lib/auth');
jest.mock('next/cache', () => ({
    revalidatePath: jest.fn(),
}));

// Import AFTER mocks are set up
import { PUT, GET, POST, DELETE } from './route';
import * as auth from '@/lib/auth';
import * as nextCache from 'next/cache';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ARTWORK_ID = 'clh_artwork_id_001';

/** Build a minimal valid artwork payload */
function validPayload(overrides: Record<string, unknown> = {}) {
    return {
        title: 'Updated Artwork',
        slug: 'updated-artwork',
        description: 'An updated beautiful piece of art that tells a story.',
        story: 'This painting was updated during summer.',
        medium: 'Watercolour on paper',
        dimensions: '18 x 24 inches',
        year: 2024,
        availabilityStatus: 'AVAILABLE',
        published: true,
        imageIds: ['clh1234567890abcdefghijk', 'clh9876543210zyxwvutsrqp'],
        ...overrides,
    };
}

type Payload = ReturnType<typeof validPayload>;

/** Build a fake artwork DB result */
function fakeArtworkResult(payload: Payload, id = ARTWORK_ID) {
    return {
        id,
        title: payload.title as string,
        slug: payload.slug as string,
        description: payload.description as string,
        story: (payload.story as string) ?? '',
        medium: payload.medium as string,
        dimensions: payload.dimensions as string,
        year: payload.year as number,
        availabilityStatus: payload.availabilityStatus as string,
        published: payload.published as boolean,
        collectionId: (payload.collectionId as string | undefined) ?? null,
        collection: payload.collectionId
            ? {
                id: payload.collectionId as string,
                name: 'Test Collection',
                slug: 'test-collection',
            }
            : null,
        images: (payload.imageIds as string[]).map((mediaAssetId, index) => ({
            id: `img_${index}`,
            mediaAssetId,
            order: index,
            isPrimary: index === 0,
            mediaAsset: {
                thumbnailUrl: `https://cdn.example.com/thumb_${mediaAssetId}.jpg`,
                mediumUrl: `https://cdn.example.com/medium_${mediaAssetId}.jpg`,
                originalUrl: `https://cdn.example.com/original_${mediaAssetId}.jpg`,
            },
        })),
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-06-01T00:00:00.000Z'),
    };
}

/** Create a NextRequest with a JSON body */
function makeRequest(id: string, body: unknown) {
    return new NextRequest(`http://localhost/api/admin/artwork/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

/** Params context for a dynamic route */
function makeParams(id: string) {
    return { params: { id } };
}

/**
 * Set up the $transaction mock to run the callback with a fake Prisma `tx`.
 */
function setupSuccessTransaction(artworkResult: ReturnType<typeof fakeArtworkResult>) {
    const mockUpdate = jest.fn<() => Promise<{ id: string }>>().mockResolvedValue({ id: artworkResult.id });
    const mockDeleteMany = jest.fn<() => Promise<{ count: number }>>().mockResolvedValue({ count: 2 });
    const mockCreateMany = jest.fn<() => Promise<{ count: number }>>().mockResolvedValue({ count: artworkResult.images.length });
    const mockFindUnique = jest.fn<() => Promise<typeof artworkResult>>().mockResolvedValue(artworkResult);

    (prismaMock.$transaction as jest.Mock).mockImplementation(
        async (callback: (tx: any) => Promise<any>) => {
            const tx = {
                artwork: { update: mockUpdate, findUniqueOrThrow: mockFindUnique },
                artworkImage: { deleteMany: mockDeleteMany, createMany: mockCreateMany },
            };
            return callback(tx);
        }
    );

    return { mockUpdate, mockDeleteMany, mockCreateMany, mockFindUnique };
}

// ---------------------------------------------------------------------------
// Test suites
// ---------------------------------------------------------------------------

describe('PUT /api/admin/artwork/[id]', () => {
    let mockGetSession: jest.MockedFunction<typeof auth.getSession>;
    let mockRevalidatePath: jest.MockedFunction<typeof nextCache.revalidatePath>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetSession = auth.getSession as jest.MockedFunction<typeof auth.getSession>;
        mockRevalidatePath = nextCache.revalidatePath as jest.MockedFunction<typeof nextCache.revalidatePath>;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // -------------------------------------------------------------------------
    // Authentication
    // -------------------------------------------------------------------------
    describe('Authentication', () => {
        it('returns 401 when no session exists', async () => {
            mockGetSession.mockResolvedValue(null);

            const response = await PUT(makeRequest(ARTWORK_ID, validPayload()), makeParams(ARTWORK_ID));
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
            expect(data.error).toContain('Unauthorized');
        });

        it('returns 401 when session has no user', async () => {
            mockGetSession.mockResolvedValue({ user: null } as any);

            const response = await PUT(makeRequest(ARTWORK_ID, validPayload()), makeParams(ARTWORK_ID));
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
            expect(data.error).toContain('Unauthorized');
        });
    });

    // -------------------------------------------------------------------------
    // Artwork not found (404)
    // -------------------------------------------------------------------------
    describe('Artwork not found', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue({
                user: { id: 'u1', email: 'admin@example.com', name: 'Admin' },
            } as any);
        });

        it('returns 404 when the artwork does not exist', async () => {
            (prismaMock.artwork.findUnique as jest.Mock).mockResolvedValue(null);

            const response = await PUT(
                makeRequest('nonexistent-id', validPayload()),
                makeParams('nonexistent-id')
            );
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.success).toBe(false);
            expect(data.error).toContain('not found');
        });
    });

    // -------------------------------------------------------------------------
    // Validation errors
    // -------------------------------------------------------------------------
    describe('Validation errors', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue({
                user: { id: 'u1', email: 'admin@example.com', name: 'Admin' },
            } as any);
        });

        it('returns 400 when title is empty', async () => {
            const response = await PUT(
                makeRequest(ARTWORK_ID, validPayload({ title: '' })),
                makeParams(ARTWORK_ID)
            );
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toBeDefined();
            expect(Array.isArray(data.errors.title)).toBe(true);
        });

        it('returns 400 when description is too short', async () => {
            const response = await PUT(
                makeRequest(ARTWORK_ID, validPayload({ description: 'Short' })),
                makeParams(ARTWORK_ID)
            );
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors.description).toBeDefined();
        });

        it('returns 400 when year is out of range', async () => {
            const response = await PUT(
                makeRequest(ARTWORK_ID, validPayload({ year: 1800 })),
                makeParams(ARTWORK_ID)
            );
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors.year).toBeDefined();
        });

        it('returns 400 when imageIds is empty', async () => {
            const response = await PUT(
                makeRequest(ARTWORK_ID, validPayload({ imageIds: [] })),
                makeParams(ARTWORK_ID)
            );
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors.imageIds).toBeDefined();
        });

        it('returns 400 when availabilityStatus is invalid', async () => {
            const response = await PUT(
                makeRequest(ARTWORK_ID, validPayload({ availabilityStatus: 'INVALID_STATUS' })),
                makeParams(ARTWORK_ID)
            );
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors.availabilityStatus).toBeDefined();
        });

        it('returns 400 when body is not valid JSON', async () => {
            mockGetSession.mockResolvedValue({
                user: { id: 'u1', email: 'admin@example.com', name: 'Admin' },
            } as any);

            const request = new NextRequest(`http://localhost/api/admin/artwork/${ARTWORK_ID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: 'not-json',
            });

            const response = await PUT(request, makeParams(ARTWORK_ID));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
        });
    });

    // -------------------------------------------------------------------------
    // Successful update with image reordering
    // -------------------------------------------------------------------------
    describe('Successful update', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue({
                user: { id: 'u1', email: 'admin@example.com', name: 'Admin' },
            } as any);
            // Default: artwork exists
            (prismaMock.artwork.findUnique as jest.Mock).mockResolvedValue({
                id: ARTWORK_ID,
                slug: 'old-slug',
            });
        });

        it('returns 200 with updated artwork and images', async () => {
            const payload = validPayload();
            setupSuccessTransaction(fakeArtworkResult(payload));

            const response = await PUT(makeRequest(ARTWORK_ID, payload), makeParams(ARTWORK_ID));
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.artwork).toBeDefined();
            expect(data.artwork.id).toBe(ARTWORK_ID);
            expect(data.artwork.title).toBe(payload.title);
            expect(data.artwork.slug).toBe(payload.slug);
            expect(Array.isArray(data.artwork.images)).toBe(true);
            expect(data.artwork.images).toHaveLength(2);
            expect(data.artwork.createdAt).toBeDefined();
            expect(data.artwork.updatedAt).toBeDefined();
        });

        it('deletes all existing images and recreates them from the new imageIds', async () => {
            const payload = validPayload();
            const { mockDeleteMany, mockCreateMany } = setupSuccessTransaction(fakeArtworkResult(payload));

            await PUT(makeRequest(ARTWORK_ID, payload), makeParams(ARTWORK_ID));

            expect(mockDeleteMany).toHaveBeenCalledWith({ where: { artworkId: ARTWORK_ID } });
            expect(mockCreateMany).toHaveBeenCalledWith({
                data: expect.arrayContaining([
                    expect.objectContaining({ order: 0, isPrimary: true }),
                    expect.objectContaining({ order: 1, isPrimary: false }),
                ]),
            });
        });

        it('handles image reordering — new order reflected in isPrimary and order fields', async () => {
            // Swap the images: second image becomes primary
            const imageA = 'clh1111111111111111111aa';
            const imageB = 'clh2222222222222222222bb';
            const reorderedPayload = validPayload({ imageIds: [imageB, imageA] });
            const { mockCreateMany } = setupSuccessTransaction(fakeArtworkResult(reorderedPayload));

            await PUT(makeRequest(ARTWORK_ID, reorderedPayload), makeParams(ARTWORK_ID));

            expect(mockCreateMany).toHaveBeenCalledWith({
                data: [
                    expect.objectContaining({ mediaAssetId: imageB, order: 0, isPrimary: true }),
                    expect.objectContaining({ mediaAssetId: imageA, order: 1, isPrimary: false }),
                ],
            });
        });

        it('triggers SSG revalidation for /, /work, and the artwork slug path', async () => {
            const payload = validPayload();
            setupSuccessTransaction(fakeArtworkResult(payload));

            await PUT(makeRequest(ARTWORK_ID, payload), makeParams(ARTWORK_ID));

            expect(mockRevalidatePath).toHaveBeenCalledWith('/');
            expect(mockRevalidatePath).toHaveBeenCalledWith('/work');
            expect(mockRevalidatePath).toHaveBeenCalledWith(`/work/${payload.slug}`);
        });

        it('includes collection relation in the response when collectionId is given', async () => {
            const collectionId = 'clhcollectionid12345678';
            const payload = validPayload({ collectionId });
            setupSuccessTransaction(fakeArtworkResult(payload));

            const response = await PUT(makeRequest(ARTWORK_ID, payload), makeParams(ARTWORK_ID));
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.artwork.collection).toBeDefined();
            expect(data.artwork.collection.id).toBe(collectionId);
        });

        it('response artwork images contain mediaAsset URLs', async () => {
            const payload = validPayload();
            setupSuccessTransaction(fakeArtworkResult(payload));

            const response = await PUT(makeRequest(ARTWORK_ID, payload), makeParams(ARTWORK_ID));
            const data = await response.json();

            const firstImage = data.artwork.images[0];
            expect(firstImage.mediaAsset).toBeDefined();
            expect(firstImage.mediaAsset.thumbnailUrl).toBeTruthy();
            expect(firstImage.mediaAsset.mediumUrl).toBeTruthy();
            expect(firstImage.mediaAsset.originalUrl).toBeTruthy();
        });
    });

    // -------------------------------------------------------------------------
    // Error handling
    // -------------------------------------------------------------------------
    describe('Error handling', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue({
                user: { id: 'u1', email: 'admin@example.com', name: 'Admin' },
            } as any);
            (prismaMock.artwork.findUnique as jest.Mock).mockResolvedValue({
                id: ARTWORK_ID,
                slug: 'some-slug',
            });
        });

        it('returns 500 for unexpected database errors', async () => {
            (prismaMock.$transaction as jest.Mock).mockRejectedValue(new Error('Unexpected DB error'));

            const response = await PUT(makeRequest(ARTWORK_ID, validPayload()), makeParams(ARTWORK_ID));
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.error).toBeTruthy();
        });
    });
});

// ---------------------------------------------------------------------------
// Non-PUT methods – all should return 405
// ---------------------------------------------------------------------------
describe('Non-PUT methods', () => {
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

    it('DELETE returns 405', async () => {
        const response = await DELETE();
        const data = await response.json();
        expect(response.status).toBe(405);
        expect(data.success).toBe(false);
    });
});

/**
 * Tests for Artwork API Endpoint
 * POST /api/admin/artwork
 *
 * Covers: authentication check, validation errors, successful creation
 * with images, and draft/publish logic.
 *
 * Requirements: 10.1, 10.2, 10.7, 10.8
 */

import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Prisma mock – the factory must not reference variables in outer scope
// (Jest hoists jest.mock() calls before variable declarations).
// We expose the mock object via a module-level object literal instead.
// ---------------------------------------------------------------------------
const prismaMock = {
    $transaction: jest.fn(),
    $disconnect: jest.fn(),
};

jest.mock('@/lib/prisma', () => ({
    __esModule: true,
    get default() {
        return prismaMock;
    },
}));

jest.mock('@/lib/auth');

// Import AFTER mocks are set up
import { POST, GET, PUT, DELETE } from './route';
import * as auth from '@/lib/auth';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal valid artwork payload */
function validPayload(overrides: Record<string, unknown> = {}) {
    return {
        title: 'Test Artwork',
        slug: 'test-artwork',
        description: 'A beautiful piece of art that tells a story.',
        story: 'This painting was created during summer.',
        medium: 'Oil on canvas',
        dimensions: '24 x 36 inches',
        year: 2023,
        availabilityStatus: 'AVAILABLE',
        published: true,
        imageIds: ['clh1234567890abcdefghijk', 'clh9876543210zyxwvutsrqp'],
        ...overrides,
    };
}

type Payload = ReturnType<typeof validPayload>;

/** Build a fake artwork DB result returned from the transaction */
function fakeArtworkResult(payload: Payload) {
    return {
        id: 'clh_artwork_id_001',
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
        images: (payload.imageIds as string[]).map((id, index) => ({
            id: `img_${index}`,
            mediaAssetId: id,
            order: index,
            isPrimary: index === 0,
            mediaAsset: {
                thumbnailUrl: `https://cdn.example.com/thumb_${id}.jpg`,
                mediumUrl: `https://cdn.example.com/medium_${id}.jpg`,
                originalUrl: `https://cdn.example.com/original_${id}.jpg`,
            },
        })),
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    };
}

/** Create a NextRequest with a JSON body */
function makeRequest(body: unknown) {
    return new NextRequest('http://localhost/api/admin/artwork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

/**
 * Set up the $transaction mock to run the callback with a fake Prisma `tx`
 * whose `artwork.create` and `artwork.findUniqueOrThrow` return the given result.
 */
function setupSuccessTransaction(artworkResult: ReturnType<typeof fakeArtworkResult>) {
    const mockCreate = jest.fn<() => Promise<{ id: string }>>().mockResolvedValue({ id: artworkResult.id });
    const mockFindUnique = jest.fn<() => Promise<typeof artworkResult>>().mockResolvedValue(artworkResult);
    const mockCreateMany = jest.fn<() => Promise<{ count: number }>>().mockResolvedValue({ count: artworkResult.images.length });

    (prismaMock.$transaction as jest.Mock).mockImplementation(
        async (callback: (tx: any) => Promise<any>) => {
            const tx = {
                artwork: { create: mockCreate, findUniqueOrThrow: mockFindUnique },
                artworkImage: { createMany: mockCreateMany },
            };
            return callback(tx);
        }
    );

    return { mockCreate, mockFindUnique, mockCreateMany };
}

// ---------------------------------------------------------------------------
// Test suites
// ---------------------------------------------------------------------------

describe('POST /api/admin/artwork', () => {
    let mockGetSession: jest.MockedFunction<typeof auth.getSession>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetSession = auth.getSession as jest.MockedFunction<typeof auth.getSession>;
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

            const response = await POST(makeRequest(validPayload()));
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
            expect(data.error).toContain('Unauthorized');
        });

        it('returns 401 when session has no user', async () => {
            mockGetSession.mockResolvedValue({ user: null } as any);

            const response = await POST(makeRequest(validPayload()));
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
            expect(data.error).toContain('Unauthorized');
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

        it('returns 400 with field errors when title is missing', async () => {
            const response = await POST(makeRequest(validPayload({ title: '' })));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toBeDefined();
            expect(Array.isArray(data.errors.title)).toBe(true);
        });

        it('returns 400 with field errors when description is too short', async () => {
            const response = await POST(makeRequest(validPayload({ description: 'Short' })));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors.description).toBeDefined();
        });

        it('returns 400 with field errors when year is invalid', async () => {
            const response = await POST(makeRequest(validPayload({ year: 1800 })));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors.year).toBeDefined();
        });

        it('returns 400 with field errors when imageIds is empty', async () => {
            const response = await POST(makeRequest(validPayload({ imageIds: [] })));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors.imageIds).toBeDefined();
        });

        it('returns 400 with field errors when availabilityStatus is invalid', async () => {
            const response = await POST(makeRequest(validPayload({ availabilityStatus: 'INVALID_STATUS' })));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors.availabilityStatus).toBeDefined();
        });

        it('returns 400 when body is not valid JSON', async () => {
            const request = new NextRequest('http://localhost/api/admin/artwork', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: 'not-json',
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
        });
    });

    // -------------------------------------------------------------------------
    // Successful creation with images
    // -------------------------------------------------------------------------
    describe('Successful creation', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue({
                user: { id: 'u1', email: 'admin@example.com', name: 'Admin' },
            } as any);
        });

        it('returns 201 with created artwork and images', async () => {
            const payload = validPayload();
            const { mockCreate } = setupSuccessTransaction(fakeArtworkResult(payload));

            const response = await POST(makeRequest(payload));
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
            expect(data.artwork).toBeDefined();
            expect(data.artwork.id).toBe('clh_artwork_id_001');
            expect(data.artwork.title).toBe(payload.title);
            expect(data.artwork.slug).toBe(payload.slug);
            expect(data.artwork.published).toBe(true);
            expect(Array.isArray(data.artwork.images)).toBe(true);
            expect(data.artwork.images).toHaveLength(2);
            expect(data.artwork.createdAt).toBeDefined();
            expect(data.artwork.updatedAt).toBeDefined();
        });

        it('sets first image as primary and assigns order by array index', async () => {
            const payload = validPayload();
            const { mockCreateMany } = setupSuccessTransaction(fakeArtworkResult(payload));

            await POST(makeRequest(payload));

            expect(mockCreateMany).toHaveBeenCalledWith({
                data: expect.arrayContaining([
                    expect.objectContaining({ order: 0, isPrimary: true }),
                    expect.objectContaining({ order: 1, isPrimary: false }),
                ]),
            });
        });

        it('includes collection relation in the response when collectionId is given', async () => {
            const collectionId = 'clhcollectionid12345678';
            const payload = validPayload({ collectionId });
            setupSuccessTransaction(fakeArtworkResult(payload));

            const response = await POST(makeRequest(payload));
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.artwork.collection).toBeDefined();
            expect(data.artwork.collection.id).toBe(collectionId);
        });

        it('response artwork contains mediaAsset URLs on each image', async () => {
            const payload = validPayload();
            setupSuccessTransaction(fakeArtworkResult(payload));

            const response = await POST(makeRequest(payload));
            const data = await response.json();

            const firstImage = data.artwork.images[0];
            expect(firstImage.mediaAsset).toBeDefined();
            expect(firstImage.mediaAsset.thumbnailUrl).toBeTruthy();
            expect(firstImage.mediaAsset.mediumUrl).toBeTruthy();
            expect(firstImage.mediaAsset.originalUrl).toBeTruthy();
        });
    });

    // -------------------------------------------------------------------------
    // Draft / Publish logic
    // -------------------------------------------------------------------------
    describe('Draft / Publish logic', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue({
                user: { id: 'u1', email: 'admin@example.com', name: 'Admin' },
            } as any);
        });

        it('persists published=false for draft artwork', async () => {
            const payload = validPayload({ published: false });
            const { mockCreate } = setupSuccessTransaction(fakeArtworkResult(payload));

            const response = await POST(makeRequest(payload));
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
            expect(mockCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ published: false }),
                })
            );
        });

        it('persists published=true for published artwork', async () => {
            const payload = validPayload({ published: true });
            const { mockCreate } = setupSuccessTransaction(fakeArtworkResult(payload));

            const response = await POST(makeRequest(payload));
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
            expect(mockCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ published: true }),
                })
            );
        });
    });

    // -------------------------------------------------------------------------
    // Slug auto-generation
    // -------------------------------------------------------------------------
    describe('Slug auto-generation', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue({
                user: { id: 'u1', email: 'admin@example.com', name: 'Admin' },
            } as any);
        });

        it('auto-generates slug from title when slug is omitted', async () => {
            const payloadWithoutSlug = {
                title: 'My Beautiful Painting',
                description: 'A beautiful piece of art that tells a story.',
                story: 'This painting was created during summer.',
                medium: 'Oil on canvas',
                dimensions: '24 x 36 inches',
                year: 2023,
                availabilityStatus: 'AVAILABLE',
                published: false,
                imageIds: ['clh1234567890abcdefghijk'],
            };

            const fakeResult = {
                id: 'clh_artwork_id_002',
                title: 'My Beautiful Painting',
                slug: 'my-beautiful-painting',
                description: payloadWithoutSlug.description,
                story: payloadWithoutSlug.story,
                medium: payloadWithoutSlug.medium,
                dimensions: payloadWithoutSlug.dimensions,
                year: payloadWithoutSlug.year,
                availabilityStatus: 'AVAILABLE',
                published: false,
                collectionId: null,
                collection: null,
                images: [
                    {
                        id: 'img_0',
                        mediaAssetId: 'clh1234567890abcdefghijk',
                        order: 0,
                        isPrimary: true,
                        mediaAsset: {
                            thumbnailUrl: 'https://cdn.example.com/thumb.jpg',
                            mediumUrl: 'https://cdn.example.com/medium.jpg',
                            originalUrl: 'https://cdn.example.com/original.jpg',
                        },
                    },
                ],
                createdAt: new Date('2024-01-01T00:00:00.000Z'),
                updatedAt: new Date('2024-01-01T00:00:00.000Z'),
            };

            const mockCreate = jest.fn<() => Promise<{ id: string }>>().mockResolvedValue({ id: fakeResult.id });
            const mockFindUnique = jest.fn<() => Promise<typeof fakeResult>>().mockResolvedValue(fakeResult);
            const mockCreateMany = jest.fn<() => Promise<{ count: number }>>().mockResolvedValue({ count: 1 });

            (prismaMock.$transaction as jest.Mock).mockImplementation(
                async (callback: (tx: any) => Promise<any>) => {
                    const tx = {
                        artwork: { create: mockCreate, findUniqueOrThrow: mockFindUnique },
                        artworkImage: { createMany: mockCreateMany },
                    };
                    return callback(tx);
                }
            );

            const response = await POST(makeRequest(payloadWithoutSlug));
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
            expect(mockCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ slug: 'my-beautiful-painting' }),
                })
            );
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
        });

        it('returns 500 for unexpected errors', async () => {
            (prismaMock.$transaction as jest.Mock).mockRejectedValue(new Error('Unexpected DB error'));

            const response = await POST(makeRequest(validPayload()));
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.error).toBeTruthy();
        });

        it('returns 400 with slug error on unique constraint violation', async () => {
            const slugError = new Error('Unique constraint failed on the fields: (`slug`)');
            (prismaMock.$transaction as jest.Mock).mockRejectedValue(slugError);

            const response = await POST(makeRequest(validPayload()));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors?.slug).toBeDefined();
        });
    });
});

// ---------------------------------------------------------------------------
// Non-POST methods – all should return 405
// ---------------------------------------------------------------------------
describe('Non-POST methods', () => {
    it('GET returns 405', async () => {
        const response = await GET();
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

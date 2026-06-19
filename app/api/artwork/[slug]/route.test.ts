/**
 * Tests for Public Artwork API Endpoint
 * GET /api/artwork/[slug]
 *
 * Covers: successful fetch of published artwork, 404 for unpublished/missing,
 * correct response shape, image and collection relations, and 405 for
 * non-GET methods.
 *
 * Requirements: 2.1-2.9
 * Task: 7.4
 */

import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Prisma mock
// ---------------------------------------------------------------------------
const prismaMock = {
    artwork: {
        findFirst: jest.fn(),
    },
    $disconnect: jest.fn(),
};

jest.mock('@/lib/prisma', () => ({
    __esModule: true,
    get default() {
        return prismaMock;
    },
}));

// Import AFTER mocks are set up
import { GET, POST, PUT, DELETE } from './route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Create a NextRequest for the given slug */
function makeRequest(slug: string) {
    return new NextRequest(`http://localhost/api/artwork/${slug}`, {
        method: 'GET',
    });
}

/** Minimal fake artwork returned by Prisma */
function fakeArtwork(overrides: Record<string, unknown> = {}) {
    return {
        id: 'art001',
        title: 'Serenity in Blue',
        slug: 'serenity-in-blue',
        description: 'A calming study of blue hues reflecting the ocean.',
        story: 'This piece was inspired by a sunrise walk along the Malabar coast.',
        medium: 'Watercolour on paper',
        dimensions: '18 x 24 inches',
        year: 2022,
        availabilityStatus: 'AVAILABLE',
        published: true,
        collectionId: 'col001',
        collection: {
            id: 'col001',
            name: 'Coastal Series',
            slug: 'coastal-series',
        },
        images: [
            {
                id: 'img001',
                artworkId: 'art001',
                mediaAssetId: 'ma001',
                order: 0,
                isPrimary: true,
                mediaAsset: {
                    id: 'ma001',
                    originalUrl: 'https://cdn.example.com/original/serenity.jpg',
                    thumbnailUrl: 'https://cdn.example.com/thumb/serenity.jpg',
                    mediumUrl: 'https://cdn.example.com/medium/serenity.jpg',
                    width: 1920,
                    height: 1440,
                },
            },
            {
                id: 'img002',
                artworkId: 'art001',
                mediaAssetId: 'ma002',
                order: 1,
                isPrimary: false,
                mediaAsset: {
                    id: 'ma002',
                    originalUrl: 'https://cdn.example.com/original/serenity2.jpg',
                    thumbnailUrl: 'https://cdn.example.com/thumb/serenity2.jpg',
                    mediumUrl: 'https://cdn.example.com/medium/serenity2.jpg',
                    width: 1920,
                    height: 1440,
                },
            },
        ],
        createdAt: new Date('2022-06-01T10:00:00.000Z'),
        updatedAt: new Date('2022-06-15T12:00:00.000Z'),
        ...overrides,
    };
}

const routeParams = (slug: string) => ({ params: { slug } });

// ---------------------------------------------------------------------------
// Test suites
// ---------------------------------------------------------------------------

describe('GET /api/artwork/[slug]', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // -------------------------------------------------------------------------
    // Successful response
    // -------------------------------------------------------------------------
    describe('Successful artwork retrieval', () => {
        it('returns 200 with full artwork data for a published artwork', async () => {
            const artwork = fakeArtwork();
            (prismaMock.artwork.findFirst as jest.Mock).mockResolvedValue(artwork);

            const response = await GET(makeRequest('serenity-in-blue'), routeParams('serenity-in-blue'));
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.id).toBe('art001');
            expect(data.title).toBe('Serenity in Blue');
            expect(data.slug).toBe('serenity-in-blue');
        });

        it('queries only published artworks by slug', async () => {
            (prismaMock.artwork.findFirst as jest.Mock).mockResolvedValue(fakeArtwork());

            await GET(makeRequest('serenity-in-blue'), routeParams('serenity-in-blue'));

            expect(prismaMock.artwork.findFirst).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { slug: 'serenity-in-blue', published: true },
                })
            );
        });

        it('includes collection data in the response (Requirement 2.8)', async () => {
            (prismaMock.artwork.findFirst as jest.Mock).mockResolvedValue(fakeArtwork());

            const response = await GET(makeRequest('serenity-in-blue'), routeParams('serenity-in-blue'));
            const data = await response.json();

            expect(data.collection).toBeDefined();
            expect(data.collection.id).toBe('col001');
            expect(data.collection.name).toBe('Coastal Series');
            expect(data.collection.slug).toBe('coastal-series');
        });

        it('returns collection as undefined when artwork has no collection', async () => {
            const artwork = fakeArtwork({ collectionId: null, collection: null });
            (prismaMock.artwork.findFirst as jest.Mock).mockResolvedValue(artwork);

            const response = await GET(makeRequest('serenity-in-blue'), routeParams('serenity-in-blue'));
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.collection).toBeUndefined();
        });

        it('returns images in ascending order with correct shape (Requirement 2.2)', async () => {
            (prismaMock.artwork.findFirst as jest.Mock).mockResolvedValue(fakeArtwork());

            const response = await GET(makeRequest('serenity-in-blue'), routeParams('serenity-in-blue'));
            const data = await response.json();

            expect(Array.isArray(data.images)).toBe(true);
            expect(data.images).toHaveLength(2);

            const firstImage = data.images[0];
            expect(firstImage.id).toBe('img001');
            expect(firstImage.url).toBe('https://cdn.example.com/original/serenity.jpg');
            expect(firstImage.alt).toBe('Serenity in Blue');
            expect(firstImage.width).toBe(1920);
            expect(firstImage.height).toBe(1440);
            expect(firstImage.thumbnailUrl).toBe('https://cdn.example.com/thumb/serenity.jpg');
            expect(firstImage.mediumUrl).toBe('https://cdn.example.com/medium/serenity.jpg');
        });

        it('maps originalUrl from mediaAsset to the url field on each image', async () => {
            (prismaMock.artwork.findFirst as jest.Mock).mockResolvedValue(fakeArtwork());

            const response = await GET(makeRequest('serenity-in-blue'), routeParams('serenity-in-blue'));
            const data = await response.json();

            for (const img of data.images) {
                expect(img.url).toBeTruthy();
                expect(img.url).toMatch(/^https:\/\//);
            }
        });

        it('uses artwork title as alt text for all images (Requirement 2.1)', async () => {
            (prismaMock.artwork.findFirst as jest.Mock).mockResolvedValue(fakeArtwork());

            const response = await GET(makeRequest('serenity-in-blue'), routeParams('serenity-in-blue'));
            const data = await response.json();

            for (const img of data.images) {
                expect(img.alt).toBe('Serenity in Blue');
            }
        });

        it('returns all required artwork fields (Requirements 2.1-2.9)', async () => {
            (prismaMock.artwork.findFirst as jest.Mock).mockResolvedValue(fakeArtwork());

            const response = await GET(makeRequest('serenity-in-blue'), routeParams('serenity-in-blue'));
            const data = await response.json();

            // Requirement 2.1 – title
            expect(data.title).toBeDefined();
            // Requirement 2.3 – description
            expect(data.description).toBeDefined();
            // Requirement 2.4 – story
            expect(data.story).toBeDefined();
            // Requirement 2.5 – medium
            expect(data.medium).toBeDefined();
            // Requirement 2.6 – dimensions
            expect(data.dimensions).toBeDefined();
            // Requirement 2.7 – year
            expect(data.year).toBeDefined();
            // Requirement 2.9 – availabilityStatus
            expect(data.availabilityStatus).toBeDefined();
            // Timestamps
            expect(data.createdAt).toBeDefined();
            expect(data.updatedAt).toBeDefined();
        });

        it('returns ISO string timestamps', async () => {
            (prismaMock.artwork.findFirst as jest.Mock).mockResolvedValue(fakeArtwork());

            const response = await GET(makeRequest('serenity-in-blue'), routeParams('serenity-in-blue'));
            const data = await response.json();

            expect(data.createdAt).toBe('2022-06-01T10:00:00.000Z');
            expect(data.updatedAt).toBe('2022-06-15T12:00:00.000Z');
        });

        it('requests images ordered by ascending order field', async () => {
            (prismaMock.artwork.findFirst as jest.Mock).mockResolvedValue(fakeArtwork());

            await GET(makeRequest('serenity-in-blue'), routeParams('serenity-in-blue'));

            expect(prismaMock.artwork.findFirst).toHaveBeenCalledWith(
                expect.objectContaining({
                    include: expect.objectContaining({
                        images: expect.objectContaining({
                            orderBy: { order: 'asc' },
                        }),
                    }),
                })
            );
        });
    });

    // -------------------------------------------------------------------------
    // Not found
    // -------------------------------------------------------------------------
    describe('Artwork not found', () => {
        it('returns 404 when no artwork matches the slug', async () => {
            (prismaMock.artwork.findFirst as jest.Mock).mockResolvedValue(null);

            const response = await GET(makeRequest('nonexistent-slug'), routeParams('nonexistent-slug'));
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.success).toBe(false);
            expect(data.error).toBeTruthy();
        });

        it('returns 404 for an unpublished artwork (not exposed to public)', async () => {
            // The query filters by published:true so Prisma returns null for unpublished
            (prismaMock.artwork.findFirst as jest.Mock).mockResolvedValue(null);

            const response = await GET(makeRequest('draft-artwork'), routeParams('draft-artwork'));
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.success).toBe(false);
        });
    });

    // -------------------------------------------------------------------------
    // Error handling
    // -------------------------------------------------------------------------
    describe('Error handling', () => {
        it('returns 500 when the database throws an unexpected error', async () => {
            (prismaMock.artwork.findFirst as jest.Mock).mockRejectedValue(
                new Error('Database connection failed')
            );

            const response = await GET(makeRequest('some-slug'), routeParams('some-slug'));
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.error).toBeTruthy();
        });
    });
});

// ---------------------------------------------------------------------------
// Non-GET methods — all should return 405
// ---------------------------------------------------------------------------
describe('Non-GET methods on /api/artwork/[slug]', () => {
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

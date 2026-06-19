/**
 * Tests for Collection API Endpoint
 * POST /api/admin/collection
 *
 * Tests: authentication, validation errors, successful creation,
 * duplicate name handling, slug auto-generation, and 405 for other methods.
 *
 * Requirements: 12.1, 12.2
 */

import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { POST, GET, generateBaseSlug } from './route';
import * as auth from '@/lib/auth';

// ============================================================================
// Mock Prisma
// ============================================================================

const mockCollectionCreate = jest.fn();
const mockCollectionFindUnique = jest.fn();
const mockDisconnect = jest.fn();

jest.mock('@/lib/prisma', () => ({
    __esModule: true,
    default: {
        collection: {
            create: (...args: unknown[]) => mockCollectionCreate(...args),
            findUnique: (...args: unknown[]) => mockCollectionFindUnique(...args),
        },
        $disconnect: () => mockDisconnect(),
    },
}));

// ============================================================================
// Mock Auth
// ============================================================================

jest.mock('@/lib/auth');

const mockGetSession = auth.getSession as jest.MockedFunction<typeof auth.getSession>;

// ============================================================================
// Helpers
// ============================================================================

function makePostRequest(body: unknown): NextRequest {
    return new NextRequest('http://localhost/api/admin/collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

const authenticatedSession = {
    user: { id: 'admin-1', email: 'admin@example.com', name: 'Admin' },
} as any;

const validBody = {
    name: 'Floral Dreams',
    description: 'A collection celebrating the beauty of flowers and nature.',
};

// ============================================================================
// Unit tests: generateBaseSlug
// ============================================================================

describe('generateBaseSlug', () => {
    it('lowercases the name', () => {
        expect(generateBaseSlug('Floral Dreams')).toBe('floral-dreams');
    });

    it('replaces spaces with hyphens', () => {
        expect(generateBaseSlug('my art collection')).toBe('my-art-collection');
    });

    it('strips special characters', () => {
        expect(generateBaseSlug('Art & Soul!')).toBe('art-soul');
    });

    it('collapses multiple hyphens', () => {
        expect(generateBaseSlug('a  b   c')).toBe('a-b-c');
    });

    it('trims leading and trailing hyphens', () => {
        expect(generateBaseSlug('  !hello!  ')).toBe('hello');
    });

    it('handles already-slug-like input', () => {
        expect(generateBaseSlug('abstract-works')).toBe('abstract-works');
    });
});

// ============================================================================
// POST /api/admin/collection
// ============================================================================

describe('POST /api/admin/collection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // -------------------------------------------------------------------------
    // Authentication
    // -------------------------------------------------------------------------

    describe('Authentication', () => {
        it('returns 401 when there is no session', async () => {
            mockGetSession.mockResolvedValue(null);

            const response = await POST(makePostRequest(validBody));
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
            expect(data.error).toContain('Unauthorized');
        });

        it('returns 401 when session has no user', async () => {
            mockGetSession.mockResolvedValue({ user: null } as any);

            const response = await POST(makePostRequest(validBody));
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
            expect(data.error).toContain('Unauthorized');
        });
    });

    // -------------------------------------------------------------------------
    // Validation
    // -------------------------------------------------------------------------

    describe('Validation', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue(authenticatedSession);
        });

        it('returns 400 when name is missing', async () => {
            const response = await POST(makePostRequest({ description: 'Valid description here' }));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toBeDefined();
            expect(data.errors.name).toBeDefined();
        });

        it('returns 400 when description is missing', async () => {
            const response = await POST(makePostRequest({ name: 'Valid Name' }));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toBeDefined();
            expect(data.errors.description).toBeDefined();
        });

        it('returns 400 when name exceeds 100 characters', async () => {
            const longName = 'a'.repeat(101);
            const response = await POST(makePostRequest({ name: longName, description: validBody.description }));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors.name).toBeDefined();
        });

        it('returns 400 when description is too short (< 10 chars)', async () => {
            const response = await POST(makePostRequest({ name: 'Valid Name', description: 'Short' }));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors.description).toBeDefined();
        });

        it('returns 400 when description exceeds 2000 characters', async () => {
            const longDesc = 'a'.repeat(2001);
            const response = await POST(makePostRequest({ name: 'Valid Name', description: longDesc }));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors.description).toBeDefined();
        });

        it('returns 400 for invalid JSON body', async () => {
            mockGetSession.mockResolvedValue(authenticatedSession);

            const request = new NextRequest('http://localhost/api/admin/collection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: 'not-valid-json{{{',
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
        });
    });

    // -------------------------------------------------------------------------
    // Slug generation
    // -------------------------------------------------------------------------

    describe('Slug auto-generation', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue(authenticatedSession);
        });

        it('generates a slug from the collection name', async () => {
            mockCollectionFindUnique.mockResolvedValue(null); // slug is free

            const createdCollection = {
                id: 'col-1',
                name: 'Floral Dreams',
                slug: 'floral-dreams',
                description: validBody.description,
                createdAt: new Date('2024-01-01'),
                updatedAt: new Date('2024-01-01'),
                _count: { artworks: 0 },
            };
            mockCollectionCreate.mockResolvedValue(createdCollection);

            const response = await POST(makePostRequest(validBody));
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.collection.slug).toBe('floral-dreams');
        });

        it('appends -2 when slug already exists', async () => {
            // First findUnique call → slug taken; second call → free
            mockCollectionFindUnique
                .mockResolvedValueOnce({ id: 'existing-col' })
                .mockResolvedValueOnce(null);

            const createdCollection = {
                id: 'col-2',
                name: 'Floral Dreams',
                slug: 'floral-dreams-2',
                description: validBody.description,
                createdAt: new Date('2024-01-01'),
                updatedAt: new Date('2024-01-01'),
                _count: { artworks: 0 },
            };
            mockCollectionCreate.mockResolvedValue(createdCollection);

            const response = await POST(makePostRequest(validBody));
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.collection.slug).toBe('floral-dreams-2');
        });

        it('appends -3 when both base slug and -2 are taken', async () => {
            mockCollectionFindUnique
                .mockResolvedValueOnce({ id: 'col-a' })  // base slug taken
                .mockResolvedValueOnce({ id: 'col-b' })  // -2 taken
                .mockResolvedValueOnce(null);             // -3 free

            const createdCollection = {
                id: 'col-3',
                name: 'Floral Dreams',
                slug: 'floral-dreams-3',
                description: validBody.description,
                createdAt: new Date('2024-01-01'),
                updatedAt: new Date('2024-01-01'),
                _count: { artworks: 0 },
            };
            mockCollectionCreate.mockResolvedValue(createdCollection);

            const response = await POST(makePostRequest(validBody));
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.collection.slug).toBe('floral-dreams-3');
        });
    });

    // -------------------------------------------------------------------------
    // Successful creation
    // -------------------------------------------------------------------------

    describe('Successful creation', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue(authenticatedSession);
            mockCollectionFindUnique.mockResolvedValue(null); // slug always free
        });

        it('returns 201 with the created collection', async () => {
            const createdCollection = {
                id: 'col-abc',
                name: 'Floral Dreams',
                slug: 'floral-dreams',
                description: validBody.description,
                createdAt: new Date('2024-06-01T10:00:00.000Z'),
                updatedAt: new Date('2024-06-01T10:00:00.000Z'),
                _count: { artworks: 0 },
            };
            mockCollectionCreate.mockResolvedValue(createdCollection);

            const response = await POST(makePostRequest(validBody));
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
            expect(data.collection).toBeDefined();
            expect(data.collection.id).toBe('col-abc');
            expect(data.collection.name).toBe('Floral Dreams');
            expect(data.collection.slug).toBe('floral-dreams');
            expect(data.collection.description).toBe(validBody.description);
            expect(data.collection._count.artworks).toBe(0);
        });

        it('passes correct data to Prisma create', async () => {
            const createdCollection = {
                id: 'col-xyz',
                name: 'Abstract Works',
                slug: 'abstract-works',
                description: 'A collection of abstract paintings and sculptures.',
                createdAt: new Date(),
                updatedAt: new Date(),
                _count: { artworks: 0 },
            };
            mockCollectionCreate.mockResolvedValue(createdCollection);

            await POST(makePostRequest({ name: 'Abstract Works', description: 'A collection of abstract paintings and sculptures.' }));

            expect(mockCollectionCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        name: 'Abstract Works',
                        slug: 'abstract-works',
                    }),
                })
            );
        });
    });

    // -------------------------------------------------------------------------
    // Duplicate name
    // -------------------------------------------------------------------------

    describe('Duplicate name handling', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue(authenticatedSession);
            mockCollectionFindUnique.mockResolvedValue(null); // slug uniqueness passes
        });

        it('returns 409 when Prisma reports a unique constraint violation', async () => {
            const prismaUniqueError = Object.assign(new Error('Unique constraint'), { code: 'P2002' });
            mockCollectionCreate.mockRejectedValue(prismaUniqueError);

            const response = await POST(makePostRequest(validBody));
            const data = await response.json();

            expect(response.status).toBe(409);
            expect(data.success).toBe(false);
            expect(data.error).toContain('already exists');
        });
    });

    // -------------------------------------------------------------------------
    // Unexpected errors
    // -------------------------------------------------------------------------

    describe('Unexpected errors', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue(authenticatedSession);
            mockCollectionFindUnique.mockResolvedValue(null);
        });

        it('returns 500 for unexpected database errors', async () => {
            mockCollectionCreate.mockRejectedValue(new Error('Connection refused'));

            const response = await POST(makePostRequest(validBody));
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.error).toBeTruthy();
        });
    });
});

// ============================================================================
// GET /api/admin/collection → 405
// ============================================================================

describe('GET /api/admin/collection', () => {
    it('returns 405 Method Not Allowed', async () => {
        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(405);
        expect(data.success).toBe(false);
        expect(data.error).toContain('Method not allowed');
    });
});

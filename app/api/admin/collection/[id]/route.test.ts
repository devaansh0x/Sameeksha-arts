/**
 * Tests for Collection Update API Endpoint
 * PUT /api/admin/collection/[id]
 *
 * Tests: authentication, validation, 404 when not found, slug regeneration,
 * successful update, duplicate name (409), revalidation, and 405 for other methods.
 *
 * Requirements: 12.4, 12.5
 * Task: 8.2
 */

import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { PUT, GET, POST, DELETE } from './route';
import * as auth from '@/lib/auth';
import * as nextCache from 'next/cache';

// ============================================================================
// Mocks
// ============================================================================

const mockCollectionFindUnique = jest.fn();
const mockCollectionUpdate = jest.fn();

jest.mock('@/lib/prisma', () => ({
    __esModule: true,
    default: {
        collection: {
            findUnique: (...args: unknown[]) => mockCollectionFindUnique(...args),
            update: (...args: unknown[]) => mockCollectionUpdate(...args),
        },
    },
}));

jest.mock('@/lib/auth');

jest.mock('next/cache', () => ({
    revalidatePath: jest.fn(),
}));

// ============================================================================
// Helpers
// ============================================================================

const mockGetSession = auth.getSession as jest.MockedFunction<typeof auth.getSession>;
const mockRevalidatePath = nextCache.revalidatePath as jest.MockedFunction<typeof nextCache.revalidatePath>;

const authenticatedSession = {
    user: { id: 'admin-1', email: 'admin@example.com', name: 'Admin' },
} as any;

const COLLECTION_ID = 'col-abc';

const existingCollection = {
    id: COLLECTION_ID,
    name: 'Floral Dreams',
    slug: 'floral-dreams',
};

const validBody = {
    name: 'Floral Dreams Updated',
    description: 'A refreshed collection celebrating the beauty of flowers and nature.',
};

function makePutRequest(id: string, body: unknown): [NextRequest, { params: { id: string } }] {
    const request = new NextRequest(`http://localhost/api/admin/collection/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return [request, { params: { id } }];
}

const updatedCollectionResult = {
    id: COLLECTION_ID,
    name: validBody.name,
    slug: 'floral-dreams-updated',
    description: validBody.description,
    updatedAt: new Date('2024-06-15T10:00:00.000Z'),
    _count: { artworks: 3 },
};

// ============================================================================
// PUT /api/admin/collection/[id]
// ============================================================================

describe('PUT /api/admin/collection/[id]', () => {
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

            const [req, ctx] = makePutRequest(COLLECTION_ID, validBody);
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
            expect(data.error).toContain('Unauthorized');
        });

        it('returns 401 when session has no user', async () => {
            mockGetSession.mockResolvedValue({ user: null } as any);

            const [req, ctx] = makePutRequest(COLLECTION_ID, validBody);
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
        });
    });

    // -------------------------------------------------------------------------
    // Validation
    // -------------------------------------------------------------------------

    describe('Validation', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue(authenticatedSession);
            // Collection exists — validation tests should reach body parsing
            mockCollectionFindUnique.mockResolvedValue(existingCollection);
        });

        it('returns 400 when name is missing', async () => {
            const [req, ctx] = makePutRequest(COLLECTION_ID, { description: 'A valid description here.' });
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors.name).toBeDefined();
        });

        it('returns 400 when description is missing', async () => {
            const [req, ctx] = makePutRequest(COLLECTION_ID, { name: 'Valid Name' });
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors.description).toBeDefined();
        });

        it('returns 400 when name exceeds 100 characters', async () => {
            const [req, ctx] = makePutRequest(COLLECTION_ID, {
                name: 'a'.repeat(101),
                description: validBody.description,
            });
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors.name).toBeDefined();
        });

        it('returns 400 when description is too short (< 10 chars)', async () => {
            const [req, ctx] = makePutRequest(COLLECTION_ID, {
                name: 'Valid Name',
                description: 'Short',
            });
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors.description).toBeDefined();
        });

        it('returns 400 when description exceeds 2000 characters', async () => {
            const [req, ctx] = makePutRequest(COLLECTION_ID, {
                name: 'Valid Name',
                description: 'a'.repeat(2001),
            });
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors.description).toBeDefined();
        });

        it('returns 400 for an invalid JSON body', async () => {
            mockGetSession.mockResolvedValue(authenticatedSession);
            const request = new NextRequest(`http://localhost/api/admin/collection/${COLLECTION_ID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: 'not-valid-json{{{',
            });

            const response = await PUT(request, { params: { id: COLLECTION_ID } });
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
        });
    });

    // -------------------------------------------------------------------------
    // Not Found
    // -------------------------------------------------------------------------

    describe('Collection not found', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue(authenticatedSession);
        });

        it('returns 404 when the collection does not exist', async () => {
            mockCollectionFindUnique.mockResolvedValue(null);

            const [req, ctx] = makePutRequest('nonexistent-id', validBody);
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.success).toBe(false);
            expect(data.error).toContain('not found');
        });
    });

    // -------------------------------------------------------------------------
    // Slug regeneration
    // -------------------------------------------------------------------------

    describe('Slug regeneration', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue(authenticatedSession);
        });

        it('keeps existing slug when name has not changed', async () => {
            mockCollectionFindUnique.mockResolvedValueOnce(existingCollection); // existence check

            const sameNameBody = {
                name: existingCollection.name, // same name
                description: 'An updated description for the collection.',
            };
            const sameSlugResult = {
                ...updatedCollectionResult,
                name: existingCollection.name,
                slug: existingCollection.slug,
            };
            mockCollectionUpdate.mockResolvedValue(sameSlugResult);

            const [req, ctx] = makePutRequest(COLLECTION_ID, sameNameBody);
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(200);
            // Should NOT have called findUnique for slug uniqueness (only the existence check)
            expect(mockCollectionFindUnique).toHaveBeenCalledTimes(1);
            expect(data.collection.slug).toBe(existingCollection.slug);
        });

        it('regenerates slug when name changes and base slug is free', async () => {
            mockCollectionFindUnique
                .mockResolvedValueOnce(existingCollection) // existence check
                .mockResolvedValueOnce(null);              // slug uniqueness: free

            mockCollectionUpdate.mockResolvedValue(updatedCollectionResult);

            const [req, ctx] = makePutRequest(COLLECTION_ID, validBody);
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.collection.slug).toBe('floral-dreams-updated');

            const updateCall = mockCollectionUpdate.mock.calls[0][0] as any;
            expect(updateCall.data.slug).toBe('floral-dreams-updated');
        });

        it('appends -2 when the new base slug is taken by another collection', async () => {
            mockCollectionFindUnique
                .mockResolvedValueOnce(existingCollection)      // existence check
                .mockResolvedValueOnce({ id: 'other-col' })    // base slug taken
                .mockResolvedValueOnce(null);                   // -2 is free

            const result = { ...updatedCollectionResult, slug: 'floral-dreams-updated-2' };
            mockCollectionUpdate.mockResolvedValue(result);

            const [req, ctx] = makePutRequest(COLLECTION_ID, validBody);
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(200);
            const updateCall = mockCollectionUpdate.mock.calls[0][0] as any;
            expect(updateCall.data.slug).toBe('floral-dreams-updated-2');
        });

        it('does not count the current slug as a conflict when the new slug equals old slug', async () => {
            // Edge case: name change produces the same slug as the existing one
            // (e.g. trailing/leading whitespace normalisation).
            const sameSlugCollection = { ...existingCollection, name: 'Floral  Dreams' };
            mockCollectionFindUnique.mockResolvedValueOnce(sameSlugCollection); // existence check
            // No further findUnique needed — ensureUniqueSlugForUpdate should return immediately

            const sameSlugResult = { ...updatedCollectionResult, slug: existingCollection.slug };
            mockCollectionUpdate.mockResolvedValue(sameSlugResult);

            const bodyWithSameSlugName = {
                name: 'Floral  Dreams', // double space → same slug 'floral-dreams'
                description: 'Updated description for floral dreams collection.',
            };

            const [req, ctx] = makePutRequest(COLLECTION_ID, bodyWithSameSlugName);
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(200);
            // slug should not have had -2 appended
            const updateCall = mockCollectionUpdate.mock.calls[0][0] as any;
            expect(updateCall.data.slug).toBe(existingCollection.slug);
        });
    });

    // -------------------------------------------------------------------------
    // Successful update
    // -------------------------------------------------------------------------

    describe('Successful update', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue(authenticatedSession);
            mockCollectionFindUnique
                .mockResolvedValueOnce(existingCollection) // existence check
                .mockResolvedValueOnce(null);              // slug uniqueness: free
            mockCollectionUpdate.mockResolvedValue(updatedCollectionResult);
        });

        it('returns 200 with success: true and updated collection shape', async () => {
            const [req, ctx] = makePutRequest(COLLECTION_ID, validBody);
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.collection).toBeDefined();
            expect(data.collection.id).toBe(COLLECTION_ID);
            expect(data.collection.name).toBe(validBody.name);
            expect(data.collection.slug).toBe(updatedCollectionResult.slug);
            expect(data.collection.description).toBe(validBody.description);
            expect(data.collection.updatedAt).toBeDefined();
            expect(data.collection._count.artworks).toBe(3);
        });

        it('calls prisma.collection.update with correct arguments', async () => {
            const [req, ctx] = makePutRequest(COLLECTION_ID, validBody);
            await PUT(req, ctx);

            expect(mockCollectionUpdate).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: COLLECTION_ID },
                    data: expect.objectContaining({
                        name: validBody.name,
                        description: validBody.description,
                    }),
                })
            );
        });

        it('triggers revalidatePath("/work") after a successful update', async () => {
            const [req, ctx] = makePutRequest(COLLECTION_ID, validBody);
            await PUT(req, ctx);

            expect(mockRevalidatePath).toHaveBeenCalledWith('/work');
        });
    });

    // -------------------------------------------------------------------------
    // Duplicate name
    // -------------------------------------------------------------------------

    describe('Duplicate name handling', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue(authenticatedSession);
            mockCollectionFindUnique
                .mockResolvedValueOnce(existingCollection) // existence check
                .mockResolvedValueOnce(null);              // slug uniqueness: free
        });

        it('returns 409 when Prisma reports a unique constraint violation', async () => {
            const prismaUniqueError = Object.assign(new Error('Unique constraint'), { code: 'P2002' });
            mockCollectionUpdate.mockRejectedValue(prismaUniqueError);

            const [req, ctx] = makePutRequest(COLLECTION_ID, validBody);
            const response = await PUT(req, ctx);
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
            mockCollectionFindUnique
                .mockResolvedValueOnce(existingCollection)
                .mockResolvedValueOnce(null);
        });

        it('returns 500 for unexpected database errors', async () => {
            mockCollectionUpdate.mockRejectedValue(new Error('Connection refused'));

            const [req, ctx] = makePutRequest(COLLECTION_ID, validBody);
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.error).toBeTruthy();
        });
    });

    // -------------------------------------------------------------------------
    // Revalidation failure is non-fatal
    // -------------------------------------------------------------------------

    describe('Cache revalidation failure', () => {
        it('still returns 200 even when revalidatePath throws', async () => {
            mockGetSession.mockResolvedValue(authenticatedSession);
            mockCollectionFindUnique
                .mockResolvedValueOnce(existingCollection)
                .mockResolvedValueOnce(null);
            mockCollectionUpdate.mockResolvedValue(updatedCollectionResult);
            mockRevalidatePath.mockImplementation(() => { throw new Error('Revalidation failed'); });

            const [req, ctx] = makePutRequest(COLLECTION_ID, validBody);
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
        });
    });
});

// ============================================================================
// Non-PUT methods → 405
// ============================================================================

describe('Non-PUT methods on /api/admin/collection/[id]', () => {
    it('GET returns 405', async () => {
        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(405);
        expect(data.success).toBe(false);
        expect(data.error).toContain('Method not allowed');
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

/**
 * Tests for PUT /api/admin/testimonial/[id]
 *
 * Covers: authentication, Zod validation, 404 for unknown id,
 * successful update, reordering logic, unsupported methods (405),
 * and database error handling.
 *
 * Requirements: 16.4, 16.5
 */

import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { PUT, GET, POST, DELETE } from './route';
import * as auth from '@/lib/auth';

// ---------------------------------------------------------------------------
// Mock dependencies
// ---------------------------------------------------------------------------

jest.mock('@/lib/auth');

jest.mock('@/lib/prisma', () => {
    const mockPrisma = {
        testimonial: {
            findUnique: jest.fn(),
            update: jest.fn(),
            updateMany: jest.fn(),
        },
    };
    return {
        __esModule: true,
        default: mockPrisma,
        prisma: mockPrisma,
    };
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(id: string, body: unknown): [NextRequest, { params: { id: string } }] {
    const request = new NextRequest(`http://localhost/api/admin/testimonial/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return [request, { params: { id } }];
}

const validPayload = {
    clientName: 'Alice Smith',
    text: 'Absolutely wonderful work, highly recommended!',
    published: true,
};

const existingTestimonial = {
    id: 'test-id-1',
    clientName: 'Old Name',
    clientTitle: null,
    text: 'Old testimonial text that is long enough.',
    order: 3,
    published: true,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
};

const updatedTestimonial = {
    id: 'test-id-1',
    clientName: 'Alice Smith',
    clientTitle: null,
    text: 'Absolutely wonderful work, highly recommended!',
    order: 3,
    published: true,
    updatedAt: new Date('2024-06-01T00:00:00Z'),
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PUT /api/admin/testimonial/[id]', () => {
    let mockGetSession: jest.MockedFunction<typeof auth.getSession>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mockPrisma: any;

    beforeEach(async () => {
        jest.clearAllMocks();
        mockGetSession = auth.getSession as jest.MockedFunction<typeof auth.getSession>;
        const prismaModule = await import('@/lib/database/prisma');
        mockPrisma = (prismaModule as any).default;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // -----------------------------------------------------------------------
    // Authentication
    // -----------------------------------------------------------------------

    describe('Authentication', () => {
        it('returns 401 when there is no session', async () => {
            mockGetSession.mockResolvedValue(null);

            const [req, ctx] = makeRequest('test-id-1', validPayload);
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
            expect(data.error).toMatch(/unauthorized/i);
        });

        it('returns 401 when session has no user', async () => {
            mockGetSession.mockResolvedValue({ user: null } as any);

            const [req, ctx] = makeRequest('test-id-1', validPayload);
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
        });
    });

    // -----------------------------------------------------------------------
    // Validation
    // -----------------------------------------------------------------------

    describe('Validation', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue({
                user: { id: 'user1', email: 'admin@test.com', name: 'Admin' },
            } as any);
        });

        it('returns 400 when clientName is missing', async () => {
            const [req, ctx] = makeRequest('test-id-1', { text: 'Great work from start to finish!' });
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.details).toHaveProperty('clientName');
        });

        it('returns 400 when text is missing', async () => {
            const [req, ctx] = makeRequest('test-id-1', { clientName: 'Bob' });
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.details).toHaveProperty('text');
        });

        it('returns 400 when text is too short (< 10 chars)', async () => {
            const [req, ctx] = makeRequest('test-id-1', { clientName: 'Bob', text: 'Short' });
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.details).toHaveProperty('text');
        });

        it('returns 400 when clientName is too short (< 2 chars)', async () => {
            const [req, ctx] = makeRequest('test-id-1', {
                clientName: 'A',
                text: 'Wonderful experience working together!',
            });
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.details).toHaveProperty('clientName');
        });

        it('returns 400 for invalid JSON body', async () => {
            mockGetSession.mockResolvedValue({
                user: { id: 'user1', email: 'admin@test.com', name: 'Admin' },
            } as any);

            const request = new NextRequest('http://localhost/api/admin/testimonial/test-id-1', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: 'not-json',
            });

            const response = await PUT(request, { params: { id: 'test-id-1' } });
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
        });

        it('returns 400 when order is negative', async () => {
            const [req, ctx] = makeRequest('test-id-1', {
                ...validPayload,
                order: -1,
            });
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.details).toHaveProperty('order');
        });
    });

    // -----------------------------------------------------------------------
    // 404 – testimonial not found
    // -----------------------------------------------------------------------

    describe('Not found', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue({
                user: { id: 'user1', email: 'admin@test.com', name: 'Admin' },
            } as any);
        });

        it('returns 404 when the testimonial does not exist', async () => {
            mockPrisma.testimonial.findUnique.mockResolvedValue(null);

            const [req, ctx] = makeRequest('non-existent-id', validPayload);
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.success).toBe(false);
            expect(data.error).toMatch(/not found/i);
        });
    });

    // -----------------------------------------------------------------------
    // Successful update (no order change)
    // -----------------------------------------------------------------------

    describe('Successful update without reordering', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue({
                user: { id: 'user1', email: 'admin@test.com', name: 'Admin' },
            } as any);
            mockPrisma.testimonial.findUnique.mockResolvedValue(existingTestimonial);
        });

        it('returns 200 with the updated testimonial', async () => {
            mockPrisma.testimonial.update.mockResolvedValue(updatedTestimonial);

            const [req, ctx] = makeRequest('test-id-1', validPayload);
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.testimonial.id).toBe('test-id-1');
            expect(data.testimonial.clientName).toBe('Alice Smith');
            expect(data.testimonial.text).toBe(validPayload.text);
        });

        it('includes optional clientTitle when provided', async () => {
            const withTitle = { ...updatedTestimonial, clientTitle: 'Collector' };
            mockPrisma.testimonial.update.mockResolvedValue(withTitle);

            const [req, ctx] = makeRequest('test-id-1', {
                ...validPayload,
                clientTitle: 'Collector',
            });
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.testimonial.clientTitle).toBe('Collector');
        });

        it('does not call updateMany when order is not provided', async () => {
            mockPrisma.testimonial.update.mockResolvedValue(updatedTestimonial);

            const [req, ctx] = makeRequest('test-id-1', validPayload); // no order field
            await PUT(req, ctx);

            expect(mockPrisma.testimonial.updateMany).not.toHaveBeenCalled();
        });

        it('does not call updateMany when order is same as current', async () => {
            mockPrisma.testimonial.update.mockResolvedValue(updatedTestimonial);

            const [req, ctx] = makeRequest('test-id-1', {
                ...validPayload,
                order: existingTestimonial.order, // same order
            });
            await PUT(req, ctx);

            expect(mockPrisma.testimonial.updateMany).not.toHaveBeenCalled();
        });

        it('returns the correct response shape (id, clientName, clientTitle, text, order, published, updatedAt)', async () => {
            mockPrisma.testimonial.update.mockResolvedValue(updatedTestimonial);

            const [req, ctx] = makeRequest('test-id-1', validPayload);
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(data.testimonial).toHaveProperty('id');
            expect(data.testimonial).toHaveProperty('clientName');
            expect(data.testimonial).toHaveProperty('clientTitle');
            expect(data.testimonial).toHaveProperty('text');
            expect(data.testimonial).toHaveProperty('order');
            expect(data.testimonial).toHaveProperty('published');
            expect(data.testimonial).toHaveProperty('updatedAt');
        });
    });

    // -----------------------------------------------------------------------
    // Reordering logic
    // -----------------------------------------------------------------------

    describe('Reordering', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue({
                user: { id: 'user1', email: 'admin@test.com', name: 'Admin' },
            } as any);
        });

        it('shifts items down (decrement) when moving the testimonial to a higher order', async () => {
            // Existing order is 2, new order is 5 → items with order 3,4,5 should decrement
            const existing = { ...existingTestimonial, order: 2 };
            mockPrisma.testimonial.findUnique.mockResolvedValue(existing);
            mockPrisma.testimonial.updateMany.mockResolvedValue({ count: 3 });
            mockPrisma.testimonial.update.mockResolvedValue({ ...updatedTestimonial, order: 5 });

            const [req, ctx] = makeRequest('test-id-1', { ...validPayload, order: 5 });
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(mockPrisma.testimonial.updateMany).toHaveBeenCalledWith({
                where: {
                    id: { not: 'test-id-1' },
                    order: { gt: 2, lte: 5 },
                },
                data: { order: { decrement: 1 } },
            });
        });

        it('shifts items up (increment) when moving the testimonial to a lower order', async () => {
            // Existing order is 5, new order is 2 → items with order 2,3,4 should increment
            const existing = { ...existingTestimonial, order: 5 };
            mockPrisma.testimonial.findUnique.mockResolvedValue(existing);
            mockPrisma.testimonial.updateMany.mockResolvedValue({ count: 3 });
            mockPrisma.testimonial.update.mockResolvedValue({ ...updatedTestimonial, order: 2 });

            const [req, ctx] = makeRequest('test-id-1', { ...validPayload, order: 2 });
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(mockPrisma.testimonial.updateMany).toHaveBeenCalledWith({
                where: {
                    id: { not: 'test-id-1' },
                    order: { gte: 2, lt: 5 },
                },
                data: { order: { increment: 1 } },
            });
        });

        it('returns the updated order in the response', async () => {
            const existing = { ...existingTestimonial, order: 1 };
            mockPrisma.testimonial.findUnique.mockResolvedValue(existing);
            mockPrisma.testimonial.updateMany.mockResolvedValue({ count: 2 });
            mockPrisma.testimonial.update.mockResolvedValue({ ...updatedTestimonial, order: 3 });

            const [req, ctx] = makeRequest('test-id-1', { ...validPayload, order: 3 });
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(data.testimonial.order).toBe(3);
        });
    });

    // -----------------------------------------------------------------------
    // Error handling
    // -----------------------------------------------------------------------

    describe('Error handling', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue({
                user: { id: 'user1', email: 'admin@test.com', name: 'Admin' },
            } as any);
        });

        it('returns 500 when findUnique throws', async () => {
            mockPrisma.testimonial.findUnique.mockRejectedValue(
                new Error('DB connection refused')
            );

            const [req, ctx] = makeRequest('test-id-1', validPayload);
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.error).toMatch(/failed to update testimonial/i);
        });

        it('returns 500 when update throws', async () => {
            mockPrisma.testimonial.findUnique.mockResolvedValue(existingTestimonial);
            mockPrisma.testimonial.update.mockRejectedValue(new Error('Write failed'));

            const [req, ctx] = makeRequest('test-id-1', validPayload);
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
        });
    });
});

// ---------------------------------------------------------------------------
// Unsupported methods
// ---------------------------------------------------------------------------

describe('Non-PUT methods on /api/admin/testimonial/[id]', () => {
    it('returns 405 for GET', async () => {
        const response = await GET();
        const data = await response.json();
        expect(response.status).toBe(405);
        expect(data.success).toBe(false);
    });

    it('returns 405 for POST', async () => {
        const response = await POST();
        const data = await response.json();
        expect(response.status).toBe(405);
        expect(data.success).toBe(false);
    });

    it('returns 405 for DELETE', async () => {
        const response = await DELETE();
        const data = await response.json();
        expect(response.status).toBe(405);
        expect(data.success).toBe(false);
    });
});

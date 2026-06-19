/**
 * Tests for POST /api/admin/testimonial
 *
 * Covers: authentication, Zod validation, successful creation, auto-order assignment,
 * and unsupported methods (405).
 *
 * Requirements: 16.1, 16.2
 */

import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { POST, GET, PUT, DELETE } from './route';
import * as auth from '@/lib/auth';

// ---------------------------------------------------------------------------
// Mock dependencies
// ---------------------------------------------------------------------------

jest.mock('@/lib/auth');

// Mock Prisma singleton
jest.mock('@/lib/prisma', () => {
    const mockPrisma = {
        testimonial: {
            aggregate: jest.fn(),
            create: jest.fn(),
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

function makeRequest(body: unknown): NextRequest {
    return new NextRequest('http://localhost/api/admin/testimonial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

const validPayload = {
    clientName: 'Alice Smith',
    text: 'Absolutely wonderful work, highly recommended!',
    published: true,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/admin/testimonial', () => {
    let mockGetSession: jest.MockedFunction<typeof auth.getSession>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mockPrisma: any;

    beforeEach(async () => {
        jest.clearAllMocks();

        mockGetSession = auth.getSession as jest.MockedFunction<typeof auth.getSession>;

        // Import the mocked prisma instance
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

            const response = await POST(makeRequest(validPayload));
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
            expect(data.error).toMatch(/unauthorized/i);
        });

        it('returns 401 when session exists but has no user', async () => {
            mockGetSession.mockResolvedValue({ user: null } as any);

            const response = await POST(makeRequest(validPayload));
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
            const response = await POST(makeRequest({ text: 'Great work!' }));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.details).toHaveProperty('clientName');
        });

        it('returns 400 when text is missing', async () => {
            const response = await POST(makeRequest({ clientName: 'Bob' }));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.details).toHaveProperty('text');
        });

        it('returns 400 when text is too short (< 10 chars)', async () => {
            const response = await POST(
                makeRequest({ clientName: 'Bob', text: 'Short' })
            );
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.details).toHaveProperty('text');
        });

        it('returns 400 when clientName is too short (< 2 chars)', async () => {
            const response = await POST(
                makeRequest({ clientName: 'A', text: 'Wonderful experience working together!' })
            );
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.details).toHaveProperty('clientName');
        });

        it('returns 400 for invalid JSON body', async () => {
            // Manually craft a request with broken JSON
            const request = new NextRequest('http://localhost/api/admin/testimonial', {
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

    // -----------------------------------------------------------------------
    // Successful creation
    // -----------------------------------------------------------------------

    describe('Successful creation', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue({
                user: { id: 'user1', email: 'admin@test.com', name: 'Admin' },
            } as any);
        });

        it('creates a testimonial and returns 201 with the record', async () => {
            mockPrisma.testimonial.aggregate.mockResolvedValue({ _max: { order: 2 } });

            const created = {
                id: 'test-id-1',
                clientName: 'Alice Smith',
                clientTitle: null,
                text: 'Absolutely wonderful work, highly recommended!',
                order: 3,
                published: true,
                createdAt: new Date('2024-01-01T00:00:00Z'),
                updatedAt: new Date('2024-01-01T00:00:00Z'),
            };
            mockPrisma.testimonial.create.mockResolvedValue(created);

            const response = await POST(makeRequest(validPayload));
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
            expect(data.testimonial.id).toBe('test-id-1');
            expect(data.testimonial.clientName).toBe('Alice Smith');
            expect(data.testimonial.text).toBe(validPayload.text);
            expect(data.testimonial.order).toBe(3);
            expect(data.testimonial.published).toBe(true);
        });

        it('includes optional clientTitle when provided', async () => {
            mockPrisma.testimonial.aggregate.mockResolvedValue({ _max: { order: 0 } });

            const created = {
                id: 'test-id-2',
                clientName: 'Bob Jones',
                clientTitle: 'Collector',
                text: 'An absolutely stunning piece of art that I treasure.',
                order: 1,
                published: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            mockPrisma.testimonial.create.mockResolvedValue(created);

            const response = await POST(
                makeRequest({
                    clientName: 'Bob Jones',
                    clientTitle: 'Collector',
                    text: 'An absolutely stunning piece of art that I treasure.',
                })
            );
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.testimonial.clientTitle).toBe('Collector');
        });
    });

    // -----------------------------------------------------------------------
    // Auto-order assignment
    // -----------------------------------------------------------------------

    describe('Auto-order assignment', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue({
                user: { id: 'user1', email: 'admin@test.com', name: 'Admin' },
            } as any);
        });

        it('assigns order 1 when no testimonials exist yet', async () => {
            // No existing testimonials — max order is null
            mockPrisma.testimonial.aggregate.mockResolvedValue({ _max: { order: null } });

            const created = {
                id: 'first-id',
                clientName: 'Carol White',
                clientTitle: null,
                text: 'Incredible talent and a wonderful experience from start to finish.',
                order: 1,
                published: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            mockPrisma.testimonial.create.mockResolvedValue(created);

            const response = await POST(
                makeRequest({
                    clientName: 'Carol White',
                    text: 'Incredible talent and a wonderful experience from start to finish.',
                })
            );
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.testimonial.order).toBe(1);

            // Verify prisma.create was called with order: 1
            expect(mockPrisma.testimonial.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ order: 1 }),
                })
            );
        });

        it('assigns order = maxOrder + 1 when testimonials already exist', async () => {
            mockPrisma.testimonial.aggregate.mockResolvedValue({ _max: { order: 5 } });

            const created = {
                id: 'next-id',
                clientName: 'Dan Brown',
                clientTitle: null,
                text: 'The artwork transformed my living space completely.',
                order: 6,
                published: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            mockPrisma.testimonial.create.mockResolvedValue(created);

            const response = await POST(
                makeRequest({
                    clientName: 'Dan Brown',
                    text: 'The artwork transformed my living space completely.',
                })
            );
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.testimonial.order).toBe(6);

            expect(mockPrisma.testimonial.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ order: 6 }),
                })
            );
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

        it('returns 500 when the database throws an error', async () => {
            mockPrisma.testimonial.aggregate.mockRejectedValue(
                new Error('DB connection refused')
            );

            const response = await POST(makeRequest(validPayload));
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.error).toMatch(/failed to create testimonial/i);
        });
    });
});

// ---------------------------------------------------------------------------
// Unsupported methods
// ---------------------------------------------------------------------------

describe('Non-POST methods on /api/admin/testimonial', () => {
    it('returns 405 for GET', async () => {
        const response = await GET();
        const data = await response.json();
        expect(response.status).toBe(405);
        expect(data.success).toBe(false);
    });

    it('returns 405 for PUT', async () => {
        const response = await PUT();
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

/**
 * Tests for GET /api/admin/inquiries
 *
 * Covers: authentication, status filtering, pagination, unreadCount,
 * reverse-chronological ordering, invalid params, and unsupported methods.
 *
 * Requirements: 17.1, 17.2, 17.7
 */

import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Prisma mock – factory must not reference outer variables (hoisting).
// ---------------------------------------------------------------------------
const prismaMock = {
    inquiry: {
        findMany: jest.fn(),
        count: jest.fn(),
    },
};

jest.mock('@/lib/prisma', () => ({
    __esModule: true,
    get default() {
        return prismaMock;
    },
}));

jest.mock('@/lib/auth');

import { GET, POST, PUT, DELETE } from './route';
import * as auth from '@/lib/auth';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a NextRequest for GET /api/admin/inquiries with optional query params. */
function makeGetRequest(params: Record<string, string> = {}): NextRequest {
    const url = new URL('http://localhost/api/admin/inquiries');
    for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
    }
    return new NextRequest(url.toString(), { method: 'GET' });
}

/** Create a realistic inquiry object. */
function makeInquiry(overrides: Record<string, unknown> = {}) {
    return {
        id: 'inq_001',
        name: 'Alice Smith',
        email: 'alice@example.com',
        subject: 'Commission inquiry',
        message: 'I would love to commission a portrait of my family.',
        status: 'UNREAD',
        createdAt: new Date('2024-03-15T10:00:00.000Z'),
        updatedAt: new Date('2024-03-15T10:00:00.000Z'),
        ...overrides,
    };
}

/** Set up the Prisma mock with given findMany results and counts. */
function setupPrismaMock(options: {
    inquiries?: ReturnType<typeof makeInquiry>[];
    total?: number;
    unreadCount?: number;
}) {
    const { inquiries = [], total = inquiries.length, unreadCount = 0 } = options;

    // count is called twice: once for total (with where), once for unreadCount (UNREAD)
    (prismaMock.inquiry.count as jest.Mock)
        .mockResolvedValueOnce(total)       // total filtered count
        .mockResolvedValueOnce(unreadCount); // UNREAD count

    (prismaMock.inquiry.findMany as jest.Mock).mockResolvedValue(inquiries);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GET /api/admin/inquiries', () => {
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

            const response = await GET(makeGetRequest());
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
            expect(data.error).toMatch(/unauthorized/i);
        });

        it('returns 401 when session has no user', async () => {
            mockGetSession.mockResolvedValue({ user: null } as any);

            const response = await GET(makeGetRequest());
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
        });
    });

    // -------------------------------------------------------------------------
    // Basic successful response
    // -------------------------------------------------------------------------

    describe('Successful response structure', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue({
                user: { id: 'u1', email: 'admin@test.com', name: 'Admin' },
            } as any);
        });

        it('returns 200 with inquiries, pagination, and unreadCount', async () => {
            const inquiries = [makeInquiry()];
            setupPrismaMock({ inquiries, total: 1, unreadCount: 1 });

            const response = await GET(makeGetRequest());
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(Array.isArray(data.inquiries)).toBe(true);
            expect(data.inquiries).toHaveLength(1);
            expect(data.pagination).toBeDefined();
            expect(data.unreadCount).toBeDefined();
        });

        it('returns ISO string dates for createdAt and updatedAt', async () => {
            const inquiries = [makeInquiry()];
            setupPrismaMock({ inquiries, total: 1, unreadCount: 1 });

            const response = await GET(makeGetRequest());
            const data = await response.json();

            expect(typeof data.inquiries[0].createdAt).toBe('string');
            expect(typeof data.inquiries[0].updatedAt).toBe('string');
            // Verify ISO format
            expect(new Date(data.inquiries[0].createdAt).toISOString()).toBe(
                data.inquiries[0].createdAt
            );
        });

        it('includes all required fields on each inquiry', async () => {
            const inquiries = [makeInquiry()];
            setupPrismaMock({ inquiries, total: 1, unreadCount: 1 });

            const response = await GET(makeGetRequest());
            const data = await response.json();

            const inq = data.inquiries[0];
            expect(inq.id).toBeDefined();
            expect(inq.name).toBeDefined();
            expect(inq.email).toBeDefined();
            expect(inq.subject).toBeDefined();
            expect(inq.message).toBeDefined();
            expect(inq.status).toBeDefined();
            expect(inq.createdAt).toBeDefined();
            expect(inq.updatedAt).toBeDefined();
        });

        it('returns empty array with zero pagination when no inquiries exist', async () => {
            setupPrismaMock({ inquiries: [], total: 0, unreadCount: 0 });

            const response = await GET(makeGetRequest());
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.inquiries).toHaveLength(0);
            expect(data.pagination.total).toBe(0);
            expect(data.pagination.totalPages).toBe(1); // at least 1 page
            expect(data.unreadCount).toBe(0);
        });
    });

    // -------------------------------------------------------------------------
    // Reverse-chronological ordering (Requirement 17.2)
    // -------------------------------------------------------------------------

    describe('Reverse-chronological ordering (17.2)', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue({
                user: { id: 'u1', email: 'admin@test.com', name: 'Admin' },
            } as any);
        });

        it('queries Prisma with orderBy: { createdAt: desc }', async () => {
            setupPrismaMock({ inquiries: [], total: 0, unreadCount: 0 });

            await GET(makeGetRequest());

            expect(prismaMock.inquiry.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderBy: { createdAt: 'desc' },
                })
            );
        });
    });

    // -------------------------------------------------------------------------
    // Status filtering (Requirement 17.7)
    // -------------------------------------------------------------------------

    describe('Status filtering (17.7)', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue({
                user: { id: 'u1', email: 'admin@test.com', name: 'Admin' },
            } as any);
        });

        it('passes status: UNREAD when status=UNREAD is provided', async () => {
            const inquiries = [makeInquiry({ status: 'UNREAD' })];
            setupPrismaMock({ inquiries, total: 1, unreadCount: 1 });

            await GET(makeGetRequest({ status: 'UNREAD' }));

            expect(prismaMock.inquiry.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { status: 'UNREAD' },
                })
            );
        });

        it('passes status: READ when status=READ is provided', async () => {
            const inquiries = [makeInquiry({ status: 'READ' })];
            setupPrismaMock({ inquiries, total: 1, unreadCount: 0 });

            await GET(makeGetRequest({ status: 'READ' }));

            expect(prismaMock.inquiry.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { status: 'READ' },
                })
            );
        });

        it('passes status: ARCHIVED when status=ARCHIVED is provided', async () => {
            const inquiries = [makeInquiry({ status: 'ARCHIVED' })];
            setupPrismaMock({ inquiries, total: 1, unreadCount: 0 });

            await GET(makeGetRequest({ status: 'ARCHIVED' }));

            expect(prismaMock.inquiry.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { status: 'ARCHIVED' },
                })
            );
        });

        it('accepts status parameter case-insensitively (unread)', async () => {
            setupPrismaMock({ inquiries: [], total: 0, unreadCount: 0 });

            await GET(makeGetRequest({ status: 'unread' }));

            expect(prismaMock.inquiry.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { status: 'UNREAD' },
                })
            );
        });

        it('accepts status parameter case-insensitively (Read)', async () => {
            setupPrismaMock({ inquiries: [], total: 0, unreadCount: 0 });

            await GET(makeGetRequest({ status: 'Read' }));

            expect(prismaMock.inquiry.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { status: 'READ' },
                })
            );
        });

        it('omits status filter when no status param is provided (returns all)', async () => {
            const inquiries = [
                makeInquiry({ status: 'UNREAD' }),
                makeInquiry({ id: 'inq_002', status: 'READ' }),
            ];
            setupPrismaMock({ inquiries, total: 2, unreadCount: 1 });

            await GET(makeGetRequest());

            expect(prismaMock.inquiry.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ where: {} })
            );
        });

        it('returns 400 for an invalid status value', async () => {
            const response = await GET(makeGetRequest({ status: 'INVALID' }));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error).toMatch(/invalid status/i);
        });
    });

    // -------------------------------------------------------------------------
    // Pagination (Requirement 17.1)
    // -------------------------------------------------------------------------

    describe('Pagination', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue({
                user: { id: 'u1', email: 'admin@test.com', name: 'Admin' },
            } as any);
        });

        it('uses default page=1 and limit=20 when not specified', async () => {
            setupPrismaMock({ inquiries: [], total: 0, unreadCount: 0 });

            await GET(makeGetRequest());

            expect(prismaMock.inquiry.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ skip: 0, take: 20 })
            );
        });

        it('calculates skip correctly for page=2 limit=10', async () => {
            setupPrismaMock({ inquiries: [], total: 25, unreadCount: 3 });

            await GET(makeGetRequest({ page: '2', limit: '10' }));

            expect(prismaMock.inquiry.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ skip: 10, take: 10 })
            );
        });

        it('returns correct pagination metadata', async () => {
            setupPrismaMock({ inquiries: [], total: 45, unreadCount: 5 });

            const response = await GET(makeGetRequest({ page: '2', limit: '10' }));
            const data = await response.json();

            expect(data.pagination.total).toBe(45);
            expect(data.pagination.page).toBe(2);
            expect(data.pagination.limit).toBe(10);
            expect(data.pagination.totalPages).toBe(5);
        });

        it('caps limit at 100 even when a larger value is given', async () => {
            setupPrismaMock({ inquiries: [], total: 0, unreadCount: 0 });

            await GET(makeGetRequest({ limit: '500' }));

            expect(prismaMock.inquiry.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ take: 100 })
            );
        });

        it('falls back to default page=1 when an invalid page value is provided', async () => {
            setupPrismaMock({ inquiries: [], total: 0, unreadCount: 0 });

            await GET(makeGetRequest({ page: 'abc' }));

            expect(prismaMock.inquiry.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ skip: 0 })
            );
        });
    });

    // -------------------------------------------------------------------------
    // unreadCount is always present (Requirement 17.6 / response spec)
    // -------------------------------------------------------------------------

    describe('unreadCount always present', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue({
                user: { id: 'u1', email: 'admin@test.com', name: 'Admin' },
            } as any);
        });

        it('includes unreadCount even when filtering by READ status', async () => {
            setupPrismaMock({
                inquiries: [makeInquiry({ status: 'READ' })],
                total: 1,
                unreadCount: 7, // separate UNREAD count
            });

            const response = await GET(makeGetRequest({ status: 'READ' }));
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.unreadCount).toBe(7);
        });

        it('queries UNREAD count independently of the status filter', async () => {
            setupPrismaMock({ inquiries: [], total: 0, unreadCount: 3 });

            await GET(makeGetRequest({ status: 'ARCHIVED' }));

            // The second call to count should use { status: UNREAD }
            const countCalls = (prismaMock.inquiry.count as jest.Mock).mock.calls;
            const unreadCall = countCalls.find(
                (call) =>
                    (call[0] as any)?.where?.status === 'UNREAD'
            );
            expect(unreadCall).toBeDefined();
        });
    });

    // -------------------------------------------------------------------------
    // Error handling
    // -------------------------------------------------------------------------

    describe('Error handling', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue({
                user: { id: 'u1', email: 'admin@test.com', name: 'Admin' },
            } as any);
        });

        it('returns 500 when Prisma throws an unexpected error', async () => {
            (prismaMock.inquiry.count as jest.Mock).mockRejectedValue(
                new Error('DB connection lost')
            );

            const response = await GET(makeGetRequest());
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.error).toBeTruthy();
        });
    });
});

// ---------------------------------------------------------------------------
// Unsupported methods → 405
// ---------------------------------------------------------------------------

describe('Non-GET methods on /api/admin/inquiries', () => {
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

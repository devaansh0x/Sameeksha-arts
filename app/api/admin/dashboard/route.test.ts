/**
 * Tests for Admin Dashboard API Endpoint
 * GET /api/admin/dashboard
 *
 * Covers: authentication check, successful statistics response,
 * artwork count by availability status, recent inquiries, and 405 for
 * non-GET methods.
 *
 * Requirements: 28.1, 28.2, 28.3, 28.4, 28.5, 28.6, 28.7
 */

import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';

// ---------------------------------------------------------------------------
// Prisma mock
// We expose the mock object via module-level object so the factory closure
// can reference it without hoisting issues.
// ---------------------------------------------------------------------------
const prismaMock = {
    artwork: {
        count: jest.fn(),
        groupBy: jest.fn(),
    },
    collection: {
        count: jest.fn(),
    },
    recognition: {
        count: jest.fn(),
    },
    inquiry: {
        count: jest.fn(),
        findMany: jest.fn(),
    },
};

jest.mock('@/lib/prisma', () => ({
    __esModule: true,
    get default() {
        return prismaMock;
    },
}));

jest.mock('@/lib/auth');

// Import AFTER mocks are set up
import { GET, POST, PUT, DELETE, PATCH } from './route';
import * as auth from '@/lib/auth';

// ---------------------------------------------------------------------------
// Shared test fixtures
// ---------------------------------------------------------------------------

const mockSession = {
    user: { id: 'user-1', email: 'admin@example.com', name: 'Admin' },
    expires: '9999-12-31',
} as any;

const mockRecentInquiries = [
    {
        id: 'inq-1',
        name: 'Alice Smith',
        email: 'alice@example.com',
        subject: 'Commission inquiry',
        status: 'UNREAD',
        createdAt: new Date('2024-05-01T10:00:00.000Z'),
    },
    {
        id: 'inq-2',
        name: 'Bob Jones',
        email: 'bob@example.com',
        subject: 'Artwork purchase',
        status: 'READ',
        createdAt: new Date('2024-04-28T08:30:00.000Z'),
    },
];

const mockGroupByResult = [
    { availabilityStatus: 'AVAILABLE', _count: { id: 10 } },
    { availabilityStatus: 'SOLD', _count: { id: 5 } },
    { availabilityStatus: 'ON_COMMISSION', _count: { id: 2 } },
    // NOT_FOR_SALE intentionally omitted to verify default-0 behaviour
];

// ---------------------------------------------------------------------------
// Helper: set up all mocks for a successful response
// ---------------------------------------------------------------------------
function setupSuccessfulMocks(overrides: {
    artworkCount?: number;
    collectionCount?: number;
    recognitionCount?: number;
    unreadCount?: number;
    recentInquiries?: typeof mockRecentInquiries;
    groupBy?: typeof mockGroupByResult;
} = {}) {
    (prismaMock.artwork.count as jest.Mock).mockResolvedValue(overrides.artworkCount ?? 42);
    (prismaMock.collection.count as jest.Mock).mockResolvedValue(overrides.collectionCount ?? 7);
    (prismaMock.recognition.count as jest.Mock).mockResolvedValue(overrides.recognitionCount ?? 15);
    (prismaMock.inquiry.count as jest.Mock).mockResolvedValue(overrides.unreadCount ?? 3);
    (prismaMock.inquiry.findMany as jest.Mock).mockResolvedValue(
        overrides.recentInquiries ?? mockRecentInquiries
    );
    (prismaMock.artwork.groupBy as jest.Mock).mockResolvedValue(
        overrides.groupBy ?? mockGroupByResult
    );
}

// ---------------------------------------------------------------------------
// Test suites
// ---------------------------------------------------------------------------

describe('GET /api/admin/dashboard', () => {
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

            const response = await GET();
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
            expect(data.error).toContain('Unauthorized');
        });

        it('returns 401 when session has no user', async () => {
            mockGetSession.mockResolvedValue({ user: null } as any);

            const response = await GET();
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
            expect(data.error).toContain('Unauthorized');
        });
    });

    // -------------------------------------------------------------------------
    // Successful response — overview statistics (Requirements 28.2–28.5)
    // -------------------------------------------------------------------------
    describe('Overview statistics', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue(mockSession);
            setupSuccessfulMocks();
        });

        it('returns 200 with success:true', async () => {
            const response = await GET();
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
        });

        it('includes artwork count in stats (Requirement 28.2)', async () => {
            setupSuccessfulMocks({ artworkCount: 42 });

            const response = await GET();
            const data = await response.json();

            expect(data.stats.artworkCount).toBe(42);
        });

        it('includes collection count in stats (Requirement 28.3)', async () => {
            setupSuccessfulMocks({ collectionCount: 7 });

            const response = await GET();
            const data = await response.json();

            expect(data.stats.collectionCount).toBe(7);
        });

        it('includes recognition count in stats (Requirement 28.4)', async () => {
            setupSuccessfulMocks({ recognitionCount: 15 });

            const response = await GET();
            const data = await response.json();

            expect(data.stats.recognitionCount).toBe(15);
        });

        it('includes unread inquiry count in stats (Requirement 28.5)', async () => {
            setupSuccessfulMocks({ unreadCount: 3 });

            const response = await GET();
            const data = await response.json();

            expect(data.stats.unreadInquiryCount).toBe(3);
        });

        it('queries unread inquiries with status UNREAD filter', async () => {
            const response = await GET();
            await response.json();

            expect(prismaMock.inquiry.count).toHaveBeenCalledWith({ where: { status: 'UNREAD' } });
        });
    });

    // -------------------------------------------------------------------------
    // Artwork count by availability status (Requirement 28.6)
    // -------------------------------------------------------------------------
    describe('Artwork count by availability status', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue(mockSession);
        });

        it('returns artworksByStatus object with all four status keys', async () => {
            setupSuccessfulMocks();

            const response = await GET();
            const data = await response.json();

            const { artworksByStatus } = data.stats;
            expect(artworksByStatus).toBeDefined();
            expect(artworksByStatus).toHaveProperty('AVAILABLE');
            expect(artworksByStatus).toHaveProperty('SOLD');
            expect(artworksByStatus).toHaveProperty('ON_COMMISSION');
            expect(artworksByStatus).toHaveProperty('NOT_FOR_SALE');
        });

        it('maps groupBy counts correctly to status keys', async () => {
            setupSuccessfulMocks({
                groupBy: [
                    { availabilityStatus: 'AVAILABLE', _count: { id: 10 } },
                    { availabilityStatus: 'SOLD', _count: { id: 5 } },
                    { availabilityStatus: 'ON_COMMISSION', _count: { id: 2 } },
                    { availabilityStatus: 'NOT_FOR_SALE', _count: { id: 1 } },
                ],
            });

            const response = await GET();
            const data = await response.json();

            const { artworksByStatus } = data.stats;
            expect(artworksByStatus.AVAILABLE).toBe(10);
            expect(artworksByStatus.SOLD).toBe(5);
            expect(artworksByStatus.ON_COMMISSION).toBe(2);
            expect(artworksByStatus.NOT_FOR_SALE).toBe(1);
        });

        it('defaults missing statuses to 0', async () => {
            setupSuccessfulMocks({
                groupBy: [
                    { availabilityStatus: 'AVAILABLE', _count: { id: 8 } },
                    // SOLD, ON_COMMISSION, NOT_FOR_SALE omitted
                ],
            });

            const response = await GET();
            const data = await response.json();

            const { artworksByStatus } = data.stats;
            expect(artworksByStatus.AVAILABLE).toBe(8);
            expect(artworksByStatus.SOLD).toBe(0);
            expect(artworksByStatus.ON_COMMISSION).toBe(0);
            expect(artworksByStatus.NOT_FOR_SALE).toBe(0);
        });

        it('returns zeros for all statuses when no artworks exist', async () => {
            setupSuccessfulMocks({ groupBy: [] });

            const response = await GET();
            const data = await response.json();

            const { artworksByStatus } = data.stats;
            expect(artworksByStatus.AVAILABLE).toBe(0);
            expect(artworksByStatus.SOLD).toBe(0);
            expect(artworksByStatus.ON_COMMISSION).toBe(0);
            expect(artworksByStatus.NOT_FOR_SALE).toBe(0);
        });
    });

    // -------------------------------------------------------------------------
    // Recent inquiries (Requirement 28.7)
    // -------------------------------------------------------------------------
    describe('Recent inquiries', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue(mockSession);
        });

        it('returns recentInquiries array in the response', async () => {
            setupSuccessfulMocks();

            const response = await GET();
            const data = await response.json();

            expect(Array.isArray(data.recentInquiries)).toBe(true);
        });

        it('fetches at most 5 most recent inquiries ordered by createdAt desc', async () => {
            setupSuccessfulMocks();

            await GET();

            expect(prismaMock.inquiry.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                })
            );
        });

        it('each inquiry contains id, name, email, subject, status, createdAt', async () => {
            setupSuccessfulMocks({ recentInquiries: mockRecentInquiries });

            const response = await GET();
            const data = await response.json();

            const first = data.recentInquiries[0];
            expect(first.id).toBe('inq-1');
            expect(first.name).toBe('Alice Smith');
            expect(first.email).toBe('alice@example.com');
            expect(first.subject).toBe('Commission inquiry');
            expect(first.status).toBe('UNREAD');
            expect(typeof first.createdAt).toBe('string'); // serialized ISO date
        });

        it('serializes createdAt as ISO string', async () => {
            setupSuccessfulMocks({ recentInquiries: mockRecentInquiries });

            const response = await GET();
            const data = await response.json();

            expect(data.recentInquiries[0].createdAt).toBe('2024-05-01T10:00:00.000Z');
        });

        it('returns empty array when there are no inquiries', async () => {
            setupSuccessfulMocks({ recentInquiries: [] });

            const response = await GET();
            const data = await response.json();

            expect(data.recentInquiries).toEqual([]);
        });
    });

    // -------------------------------------------------------------------------
    // Parallel query execution
    // -------------------------------------------------------------------------
    describe('Query execution', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue(mockSession);
            setupSuccessfulMocks();
        });

        it('calls all six Prisma queries when authenticated', async () => {
            await GET();

            expect(prismaMock.artwork.count).toHaveBeenCalledTimes(1);
            expect(prismaMock.collection.count).toHaveBeenCalledTimes(1);
            expect(prismaMock.recognition.count).toHaveBeenCalledTimes(1);
            expect(prismaMock.inquiry.count).toHaveBeenCalledTimes(1);
            expect(prismaMock.inquiry.findMany).toHaveBeenCalledTimes(1);
            expect(prismaMock.artwork.groupBy).toHaveBeenCalledTimes(1);
        });

        it('groups artworks by availabilityStatus field', async () => {
            await GET();

            expect(prismaMock.artwork.groupBy).toHaveBeenCalledWith(
                expect.objectContaining({
                    by: ['availabilityStatus'],
                })
            );
        });
    });

    // -------------------------------------------------------------------------
    // Error handling
    // -------------------------------------------------------------------------
    describe('Error handling', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue(mockSession);
        });

        it('returns 500 when a Prisma query throws', async () => {
            (prismaMock.artwork.count as jest.Mock).mockRejectedValue(new Error('DB error'));
            (prismaMock.collection.count as jest.Mock).mockResolvedValue(0);
            (prismaMock.recognition.count as jest.Mock).mockResolvedValue(0);
            (prismaMock.inquiry.count as jest.Mock).mockResolvedValue(0);
            (prismaMock.inquiry.findMany as jest.Mock).mockResolvedValue([]);
            (prismaMock.artwork.groupBy as jest.Mock).mockResolvedValue([]);

            const response = await GET();
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.error).toBeTruthy();
        });
    });
});

// ---------------------------------------------------------------------------
// Non-GET methods – all should return 405
// ---------------------------------------------------------------------------
describe('Non-GET methods on /api/admin/dashboard', () => {
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

    it('PATCH returns 405', async () => {
        const response = await PATCH();
        const data = await response.json();
        expect(response.status).toBe(405);
        expect(data.success).toBe(false);
    });
});

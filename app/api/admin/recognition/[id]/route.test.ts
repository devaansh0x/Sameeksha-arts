/**
 * Tests for Recognition Entry Update API Endpoint
 * PUT /api/admin/recognition/[id]
 *
 * Covers: authentication, Zod validation, 404 for missing entry,
 * successful update, revalidation, and 405 for non-PUT methods.
 *
 * Requirements: 13.4, 13.5
 * Task: 9.2
 */

import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { PUT, GET, POST, DELETE } from './route';
import * as auth from '@/lib/auth';
import * as nextCache from 'next/cache';
import prisma from '@/lib/database/prisma';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('@/lib/auth');
jest.mock('next/cache', () => ({
    revalidatePath: jest.fn(),
}));
jest.mock('@/lib/prisma', () => ({
    __esModule: true,
    default: {
        recognition: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
    },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(id: string, body: unknown): [NextRequest, { params: { id: string } }] {
    const request = new NextRequest(`http://localhost/api/admin/recognition/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return [request, { params: { id } }];
}

const mockSession = {
    user: { id: 'user-1', email: 'admin@example.com', name: 'Admin' },
    expires: '9999-12-31',
} as any;

const validBody = {
    title: 'National Art Award',
    type: 'AWARD',
    date: '2023-05-15T00:00:00.000Z',
    description: 'Received the prestigious national award for contemporary art.',
    published: true,
};

const existingRecord = {
    id: 'rec-001',
    title: 'Old Title',
    type: 'AWARD',
    date: new Date('2022-01-01'),
    description: 'Old description that is long enough to pass validation.',
    published: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
};

const updatedRecord = {
    id: 'rec-001',
    title: validBody.title,
    type: validBody.type,
    date: new Date(validBody.date),
    description: validBody.description,
    published: validBody.published,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-06-01'),
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PUT /api/admin/recognition/[id]', () => {
    let mockGetSession: jest.MockedFunction<typeof auth.getSession>;
    let mockFindUnique: jest.MockedFunction<any>;
    let mockUpdate: jest.MockedFunction<any>;
    let mockRevalidatePath: jest.MockedFunction<typeof nextCache.revalidatePath>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetSession = auth.getSession as jest.MockedFunction<typeof auth.getSession>;
        mockFindUnique = (prisma as any).recognition.findUnique as jest.MockedFunction<any>;
        mockUpdate = (prisma as any).recognition.update as jest.MockedFunction<any>;
        mockRevalidatePath = nextCache.revalidatePath as jest.MockedFunction<typeof nextCache.revalidatePath>;
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

            const [req, ctx] = makeRequest('rec-001', validBody);
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
            expect(data.error).toContain('Unauthorized');
        });

        it('returns 401 when session has no user', async () => {
            mockGetSession.mockResolvedValue({ user: null } as any);

            const [req, ctx] = makeRequest('rec-001', validBody);
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
            mockGetSession.mockResolvedValue(mockSession);
        });

        it('returns 422 when title is missing', async () => {
            const { title: _omit, ...noTitle } = validBody;
            const [req, ctx] = makeRequest('rec-001', noTitle);
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(422);
            expect(data.success).toBe(false);
            expect(data.errors.title).toBeDefined();
        });

        it('returns 422 when type is invalid', async () => {
            const [req, ctx] = makeRequest('rec-001', { ...validBody, type: 'INVALID_TYPE' });
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(422);
            expect(data.success).toBe(false);
            expect(data.errors.type).toBeDefined();
        });

        it('returns 422 when description is too short', async () => {
            const [req, ctx] = makeRequest('rec-001', { ...validBody, description: 'Short' });
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(422);
            expect(data.success).toBe(false);
            expect(data.errors.description).toBeDefined();
        });

        it('returns 422 when date is missing', async () => {
            const { date: _omit, ...noDate } = validBody;
            const [req, ctx] = makeRequest('rec-001', noDate);
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(422);
            expect(data.success).toBe(false);
        });

        it('returns 400 when body is not valid JSON', async () => {
            mockGetSession.mockResolvedValue(mockSession);
            const request = new NextRequest('http://localhost/api/admin/recognition/rec-001', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: '{ invalid json }',
            });

            const response = await PUT(request, { params: { id: 'rec-001' } });
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
        });
    });

    // -----------------------------------------------------------------------
    // 404 – entry not found
    // -----------------------------------------------------------------------

    describe('Not found', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue(mockSession);
        });

        it('returns 404 when recognition entry does not exist', async () => {
            mockFindUnique.mockResolvedValue(null);

            const [req, ctx] = makeRequest('non-existent-id', validBody);
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.success).toBe(false);
            expect(data.error).toContain('not found');
        });

        it('calls findUnique with the correct id', async () => {
            mockFindUnique.mockResolvedValue(null);

            const [req, ctx] = makeRequest('rec-abc', validBody);
            await PUT(req, ctx);

            expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: 'rec-abc' } });
        });
    });

    // -----------------------------------------------------------------------
    // All Recognition Types
    // -----------------------------------------------------------------------

    describe('Recognition types', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue(mockSession);
            mockFindUnique.mockResolvedValue(existingRecord);
        });

        const types = ['AWARD', 'EXHIBITION', 'INSTITUTIONAL_COLLABORATION', 'PRESS'] as const;

        types.forEach((type) => {
            it(`accepts type "${type}" and returns 200`, async () => {
                const mockResult = { ...updatedRecord, type };
                mockUpdate.mockResolvedValue(mockResult);

                const [req, ctx] = makeRequest('rec-001', { ...validBody, type });
                const response = await PUT(req, ctx);
                const data = await response.json();

                expect(response.status).toBe(200);
                expect(data.success).toBe(true);
                expect(data.recognition.type).toBe(type);
            });
        });
    });

    // -----------------------------------------------------------------------
    // Successful update
    // -----------------------------------------------------------------------

    describe('Successful update', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue(mockSession);
            mockFindUnique.mockResolvedValue(existingRecord);
            mockUpdate.mockResolvedValue(updatedRecord);
        });

        it('returns 200 with the updated recognition record', async () => {
            const [req, ctx] = makeRequest('rec-001', validBody);
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);

            const { recognition } = data;
            expect(recognition).toBeDefined();
            expect(recognition.id).toBe(updatedRecord.id);
            expect(recognition.title).toBe(updatedRecord.title);
            expect(recognition.type).toBe(updatedRecord.type);
            expect(recognition.description).toBe(updatedRecord.description);
            expect(recognition.published).toBe(updatedRecord.published);
            expect(recognition.date).toBeDefined();
            expect(recognition.createdAt).toBeDefined();
            expect(recognition.updatedAt).toBeDefined();
        });

        it('calls prisma.recognition.update with correct data', async () => {
            const [req, ctx] = makeRequest('rec-001', validBody);
            await PUT(req, ctx);

            expect(mockUpdate).toHaveBeenCalledTimes(1);
            const callArg = mockUpdate.mock.calls[0][0] as any;
            expect(callArg.where).toEqual({ id: 'rec-001' });
            expect(callArg.data.title).toBe(validBody.title);
            expect(callArg.data.type).toBe(validBody.type);
            expect(callArg.data.description).toBe(validBody.description);
            expect(callArg.data.published).toBe(validBody.published);
            expect(callArg.data.date).toBeInstanceOf(Date);
        });

        it('calls select on correct fields', async () => {
            const [req, ctx] = makeRequest('rec-001', validBody);
            await PUT(req, ctx);

            const callArg = mockUpdate.mock.calls[0][0] as any;
            expect(callArg.select).toMatchObject({
                id: true,
                title: true,
                type: true,
                date: true,
                description: true,
                published: true,
                createdAt: true,
                updatedAt: true,
            });
        });

        it('triggers revalidatePath for /recognition', async () => {
            const [req, ctx] = makeRequest('rec-001', validBody);
            await PUT(req, ctx);

            expect(mockRevalidatePath).toHaveBeenCalledWith('/recognition');
        });

        it('defaults published to true when not provided', async () => {
            const { published: _omit, ...bodyWithoutPublished } = validBody;
            mockUpdate.mockResolvedValue({ ...updatedRecord, published: true });

            const [req, ctx] = makeRequest('rec-001', bodyWithoutPublished);
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.recognition.published).toBe(true);
        });
    });

    // -----------------------------------------------------------------------
    // Revalidation failure is non-fatal
    // -----------------------------------------------------------------------

    describe('Revalidation error handling', () => {
        it('still returns 200 even if revalidatePath throws', async () => {
            mockGetSession.mockResolvedValue(mockSession);
            mockFindUnique.mockResolvedValue(existingRecord);
            mockUpdate.mockResolvedValue(updatedRecord);
            mockRevalidatePath.mockImplementation(() => {
                throw new Error('Revalidation failed');
            });

            const [req, ctx] = makeRequest('rec-001', validBody);
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
        });
    });

    // -----------------------------------------------------------------------
    // Database error handling
    // -----------------------------------------------------------------------

    describe('Error handling', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue(mockSession);
        });

        it('returns 500 when prisma.recognition.update throws', async () => {
            mockFindUnique.mockResolvedValue(existingRecord);
            mockUpdate.mockRejectedValue(new Error('DB connection failed'));

            const [req, ctx] = makeRequest('rec-001', validBody);
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.error).toBeTruthy();
        });

        it('returns 500 when prisma.recognition.findUnique throws', async () => {
            mockFindUnique.mockRejectedValue(new Error('DB connection failed'));

            const [req, ctx] = makeRequest('rec-001', validBody);
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
        });
    });
});

// ---------------------------------------------------------------------------
// Non-PUT methods → 405
// ---------------------------------------------------------------------------

describe('Non-PUT methods on /api/admin/recognition/[id]', () => {
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

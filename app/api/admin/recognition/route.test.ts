/**
 * Tests for Recognition API Endpoint
 * POST /api/admin/recognition
 *
 * Covers: authentication, Zod validation (all recognition types),
 * successful creation, and 405 for non-POST methods.
 *
 * Requirements: 13.1, 13.2
 */

import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { POST, GET, PUT, DELETE } from './route';
import * as auth from '@/lib/auth';
import prisma from '@/lib/database/prisma';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('@/lib/auth');
jest.mock('@/lib/prisma', () => ({
    __esModule: true,
    default: {
        recognition: {
            create: jest.fn(),
        },
    },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(body: unknown): NextRequest {
    return new NextRequest('http://localhost/api/admin/recognition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
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

const createdRecognition = {
    id: 'rec-001',
    title: validBody.title,
    type: validBody.type,
    date: new Date(validBody.date),
    description: validBody.description,
    published: validBody.published,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/admin/recognition', () => {
    let mockGetSession: jest.MockedFunction<typeof auth.getSession>;
    let mockCreate: jest.MockedFunction<any>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetSession = auth.getSession as jest.MockedFunction<typeof auth.getSession>;
        mockCreate = (prisma as any).recognition.create as jest.MockedFunction<any>;
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

            const response = await POST(makeRequest(validBody));
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
            expect(data.error).toContain('Unauthorized');
        });

        it('returns 401 when session has no user', async () => {
            mockGetSession.mockResolvedValue({ user: null } as any);

            const response = await POST(makeRequest(validBody));
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
            expect(data.error).toContain('Unauthorized');
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
            const response = await POST(makeRequest(noTitle));
            const data = await response.json();

            expect(response.status).toBe(422);
            expect(data.success).toBe(false);
            expect(data.errors).toBeDefined();
            expect(data.errors.title).toBeDefined();
        });

        it('returns 422 when type is invalid', async () => {
            const response = await POST(makeRequest({ ...validBody, type: 'INVALID_TYPE' }));
            const data = await response.json();

            expect(response.status).toBe(422);
            expect(data.success).toBe(false);
            expect(data.errors).toBeDefined();
            expect(data.errors.type).toBeDefined();
        });

        it('returns 422 when description is too short', async () => {
            const response = await POST(makeRequest({ ...validBody, description: 'Short' }));
            const data = await response.json();

            expect(response.status).toBe(422);
            expect(data.success).toBe(false);
            expect(data.errors).toBeDefined();
            expect(data.errors.description).toBeDefined();
        });

        it('returns 422 when date is missing', async () => {
            const { date: _omit, ...noDate } = validBody;
            const response = await POST(makeRequest(noDate));
            const data = await response.json();

            expect(response.status).toBe(422);
            expect(data.success).toBe(false);
            expect(data.errors).toBeDefined();
        });

        it('returns 400 when body is not valid JSON', async () => {
            const request = new NextRequest('http://localhost/api/admin/recognition', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: '{ invalid json }',
            });
            mockGetSession.mockResolvedValue(mockSession);

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
        });
    });

    // -----------------------------------------------------------------------
    // All Recognition Types
    // -----------------------------------------------------------------------

    describe('Recognition types', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue(mockSession);
        });

        const types = ['AWARD', 'EXHIBITION', 'INSTITUTIONAL_COLLABORATION', 'PRESS'] as const;

        types.forEach((type) => {
            it(`accepts type "${type}" and returns 201`, async () => {
                const body = { ...validBody, type };
                const mockResult = { ...createdRecognition, type };
                mockCreate.mockResolvedValue(mockResult);

                const response = await POST(makeRequest(body));
                const data = await response.json();

                expect(response.status).toBe(201);
                expect(data.success).toBe(true);
                expect(data.recognition).toBeDefined();
                expect(data.recognition.type).toBe(type);
            });
        });
    });

    // -----------------------------------------------------------------------
    // Successful creation
    // -----------------------------------------------------------------------

    describe('Successful creation', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue(mockSession);
            mockCreate.mockResolvedValue(createdRecognition);
        });

        it('returns 201 with the created recognition record', async () => {
            const response = await POST(makeRequest(validBody));
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);

            const { recognition } = data;
            expect(recognition).toBeDefined();
            expect(recognition.id).toBe(createdRecognition.id);
            expect(recognition.title).toBe(createdRecognition.title);
            expect(recognition.type).toBe(createdRecognition.type);
            expect(recognition.description).toBe(createdRecognition.description);
            expect(recognition.published).toBe(createdRecognition.published);
            // date, createdAt, updatedAt are serialized as ISO strings in JSON
            expect(recognition.date).toBeDefined();
            expect(recognition.createdAt).toBeDefined();
            expect(recognition.updatedAt).toBeDefined();
        });

        it('defaults published to true when not provided', async () => {
            const { published: _omit, ...bodyWithoutPublished } = validBody;
            const mockResult = { ...createdRecognition, published: true };
            mockCreate.mockResolvedValue(mockResult);

            const response = await POST(makeRequest(bodyWithoutPublished));
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
            expect(data.recognition.published).toBe(true);
        });

        it('calls prisma.recognition.create with correct data', async () => {
            mockCreate.mockResolvedValue(createdRecognition);

            await POST(makeRequest(validBody));

            expect(mockCreate).toHaveBeenCalledTimes(1);
            const callArg = mockCreate.mock.calls[0][0] as any;
            expect(callArg.data.title).toBe(validBody.title);
            expect(callArg.data.type).toBe(validBody.type);
            expect(callArg.data.description).toBe(validBody.description);
            expect(callArg.data.published).toBe(validBody.published);
            expect(callArg.data.date).toBeInstanceOf(Date);
        });
    });

    // -----------------------------------------------------------------------
    // Error handling
    // -----------------------------------------------------------------------

    describe('Error handling', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue(mockSession);
        });

        it('returns 500 when Prisma throws', async () => {
            mockCreate.mockRejectedValue(new Error('DB connection failed'));

            const response = await POST(makeRequest(validBody));
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.error).toBeTruthy();
        });
    });
});

// ---------------------------------------------------------------------------
// Non-POST methods → 405
// ---------------------------------------------------------------------------

describe('Non-POST methods on /api/admin/recognition', () => {
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

/**
 * Tests for Password Change API Endpoint
 * POST /api/admin/password
 *
 * Covers: authentication check, validation errors, current password
 * verification, successful password change, and method restrictions.
 *
 * Requirements: 29.1, 29.2, 29.3, 29.4, 29.5, 29.6
 */

import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Prisma mock
// ---------------------------------------------------------------------------
const prismaMock = {
    user: {
        findUnique: jest.fn(),
        update: jest.fn(),
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
import { POST, GET, PUT, DELETE } from './route';
import * as auth from '@/lib/auth';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a valid password change request body */
function validPayload(overrides: Record<string, unknown> = {}) {
    return {
        currentPassword: 'OldPassword1',
        newPassword: 'NewPassword1',
        confirmPassword: 'NewPassword1',
        ...overrides,
    };
}

/** Build a fake user record as returned from the DB */
function fakeUser(overrides: Partial<{ id: string; email: string; name: string; passwordHash: string }> = {}) {
    return {
        id: 'user_id_001',
        email: 'admin@example.com',
        name: 'Admin',
        passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$hashed_old_password',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
        ...overrides,
    };
}

/** Create a NextRequest with a JSON body */
function makeRequest(body: unknown) {
    return new NextRequest('http://localhost/api/admin/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

// ---------------------------------------------------------------------------
// Test suites
// ---------------------------------------------------------------------------

describe('POST /api/admin/password', () => {
    let mockGetSession: jest.MockedFunction<typeof auth.getSession>;
    let mockVerifyPassword: jest.MockedFunction<typeof auth.verifyPassword>;
    let mockHashPassword: jest.MockedFunction<typeof auth.hashPassword>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetSession = auth.getSession as jest.MockedFunction<typeof auth.getSession>;
        mockVerifyPassword = auth.verifyPassword as jest.MockedFunction<typeof auth.verifyPassword>;
        mockHashPassword = auth.hashPassword as jest.MockedFunction<typeof auth.hashPassword>;
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

        it('returns 401 when session user has no id', async () => {
            mockGetSession.mockResolvedValue({ user: { email: 'admin@example.com' } } as any);

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
                user: { id: 'user_id_001', email: 'admin@example.com', name: 'Admin' },
            } as any);
        });

        it('returns 400 when body is not valid JSON', async () => {
            const request = new NextRequest('http://localhost/api/admin/password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: 'not-json',
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
        });

        it('returns 400 when currentPassword is missing', async () => {
            const response = await POST(makeRequest(validPayload({ currentPassword: '' })));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors?.currentPassword).toBeDefined();
        });

        it('returns 400 when newPassword is too short (less than 8 chars)', async () => {
            const response = await POST(makeRequest(validPayload({ newPassword: 'Short1', confirmPassword: 'Short1' })));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors?.newPassword).toBeDefined();
        });

        it('returns 400 when newPassword lacks an uppercase letter', async () => {
            const response = await POST(makeRequest(validPayload({ newPassword: 'nouppercase1', confirmPassword: 'nouppercase1' })));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors?.newPassword).toBeDefined();
        });

        it('returns 400 when newPassword lacks a lowercase letter', async () => {
            const response = await POST(makeRequest(validPayload({ newPassword: 'NOLOWERCASE1', confirmPassword: 'NOLOWERCASE1' })));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors?.newPassword).toBeDefined();
        });

        it('returns 400 when newPassword lacks a number', async () => {
            const response = await POST(makeRequest(validPayload({ newPassword: 'NoNumberHere', confirmPassword: 'NoNumberHere' })));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors?.newPassword).toBeDefined();
        });

        it('returns 400 when newPassword and confirmPassword do not match', async () => {
            const response = await POST(makeRequest(validPayload({ confirmPassword: 'DifferentPassword1' })));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors?.confirmPassword).toBeDefined();
        });
    });

    // -------------------------------------------------------------------------
    // Current password verification
    // -------------------------------------------------------------------------
    describe('Current password verification', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue({
                user: { id: 'user_id_001', email: 'admin@example.com', name: 'Admin' },
            } as any);
        });

        it('returns 400 when current password is incorrect', async () => {
            (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(fakeUser());
            mockVerifyPassword.mockResolvedValue(false);

            const response = await POST(makeRequest(validPayload()));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error).toContain('incorrect');
        });

        it('returns 404 when the user is not found in the database', async () => {
            (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);

            const response = await POST(makeRequest(validPayload()));
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.success).toBe(false);
            expect(data.error).toContain('not found');
        });

        it('calls verifyPassword with the stored hash and current password', async () => {
            const user = fakeUser();
            (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(user);
            mockVerifyPassword.mockResolvedValue(false);

            await POST(makeRequest(validPayload()));

            expect(mockVerifyPassword).toHaveBeenCalledWith(user.passwordHash, 'OldPassword1');
        });
    });

    // -------------------------------------------------------------------------
    // Successful password change
    // -------------------------------------------------------------------------
    describe('Successful password change', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue({
                user: { id: 'user_id_001', email: 'admin@example.com', name: 'Admin' },
            } as any);
            (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(fakeUser());
            mockVerifyPassword.mockResolvedValue(true);
            mockHashPassword.mockResolvedValue('$argon2id$v=19$m=65536,t=3,p=4$new_hashed_password');
            (prismaMock.user.update as jest.Mock).mockResolvedValue({
                ...fakeUser(),
                passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$new_hashed_password',
            });
        });

        it('returns 200 with success message when password is changed', async () => {
            const response = await POST(makeRequest(validPayload()));
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.message).toBe('Password changed successfully.');
        });

        it('hashes the new password before saving', async () => {
            await POST(makeRequest(validPayload()));

            expect(mockHashPassword).toHaveBeenCalledWith('NewPassword1');
        });

        it('updates the user record with the new password hash', async () => {
            await POST(makeRequest(validPayload()));

            expect(prismaMock.user.update).toHaveBeenCalledWith({
                where: { id: 'user_id_001' },
                data: { passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$new_hashed_password' },
            });
        });

        it('queries the user by session user id', async () => {
            await POST(makeRequest(validPayload()));

            expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
                where: { id: 'user_id_001' },
            });
        });
    });

    // -------------------------------------------------------------------------
    // Error handling
    // -------------------------------------------------------------------------
    describe('Error handling', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue({
                user: { id: 'user_id_001', email: 'admin@example.com', name: 'Admin' },
            } as any);
        });

        it('returns 500 for unexpected database errors', async () => {
            (prismaMock.user.findUnique as jest.Mock).mockRejectedValue(new Error('DB connection failed'));

            const response = await POST(makeRequest(validPayload()));
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.error).toBeTruthy();
        });

        it('returns 500 when password hash update fails', async () => {
            (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(fakeUser());
            mockVerifyPassword.mockResolvedValue(true);
            mockHashPassword.mockResolvedValue('$argon2id$new_hash');
            (prismaMock.user.update as jest.Mock).mockRejectedValue(new Error('Update failed'));

            const response = await POST(makeRequest(validPayload()));
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
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

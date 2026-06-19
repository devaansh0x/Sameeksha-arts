/**
 * Unit tests for authentication utilities
 *
 * Validates: Requirements 9.1, 9.2, 9.3
 *
 * Note: These tests verify the password hashing, verification functions, and
 * session helper contracts. Full end-to-end authentication flow tests rely on a
 * live database and are covered by the manual testing checklist in AUTH_SETUP.md.
 */

import { hashPassword, verifyPassword, getSession, getCurrentUser, isAuthenticated } from "./auth";

// ──────────────────────────────────────────────────────────────────────────────
// Session helpers require next-auth/next which calls into the Next.js runtime.
// We mock it at the module boundary so the helpers can be unit-tested in
// isolation without a running server or database.
// ──────────────────────────────────────────────────────────────────────────────
jest.mock("next-auth/next", () => ({
    getServerSession: jest.fn(),
}));

import { getServerSession } from "next-auth/next";

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

describe("Authentication Utilities", () => {
    describe("hashPassword", () => {
        it("should hash a password successfully", async () => {
            const password = "testPassword123";
            const hash = await hashPassword(password);

            expect(hash).toBeDefined();
            expect(hash).not.toBe(password);
            expect(hash.length).toBeGreaterThan(0);
        });

        it("should generate different hashes for the same password", async () => {
            const password = "testPassword123";
            const hash1 = await hashPassword(password);
            const hash2 = await hashPassword(password);

            expect(hash1).not.toBe(hash2);
        });

        it("should handle empty passwords", async () => {
            const password = "";
            const hash = await hashPassword(password);

            expect(hash).toBeDefined();
            expect(hash.length).toBeGreaterThan(0);
        });
    });

    describe("verifyPassword", () => {
        it("should verify correct password", async () => {
            const password = "testPassword123";
            const hash = await hashPassword(password);

            const isValid = await verifyPassword(hash, password);
            expect(isValid).toBe(true);
        });

        it("should reject incorrect password", async () => {
            const password = "testPassword123";
            const wrongPassword = "wrongPassword456";
            const hash = await hashPassword(password);

            const isValid = await verifyPassword(hash, wrongPassword);
            expect(isValid).toBe(false);
        });

        it("should handle empty password verification", async () => {
            const password = "testPassword123";
            const hash = await hashPassword(password);

            const isValid = await verifyPassword(hash, "");
            expect(isValid).toBe(false);
        });

        it("should handle invalid hash gracefully", async () => {
            const invalidHash = "not-a-valid-hash";
            const password = "testPassword123";

            const isValid = await verifyPassword(invalidHash, password);
            expect(isValid).toBe(false);
        });

        it("should be case-sensitive", async () => {
            const password = "TestPassword123";
            const hash = await hashPassword(password);

            const isValidLower = await verifyPassword(hash, "testpassword123");
            expect(isValidLower).toBe(false);
        });
    });

    describe("Password Security", () => {
        it("should create cryptographically secure hashes", async () => {
            const password = "testPassword123";
            const hash = await hashPassword(password);

            // Argon2 hashes should start with $argon2
            expect(hash).toMatch(/^\$argon2/);
        });

        it("should handle special characters in passwords", async () => {
            const password = "p@$$w0rd!#%&*()[]{}";
            const hash = await hashPassword(password);
            const isValid = await verifyPassword(hash, password);

            expect(isValid).toBe(true);
        });

        it("should handle unicode characters", async () => {
            const password = "пароль密码🔒";
            const hash = await hashPassword(password);
            const isValid = await verifyPassword(hash, password);

            expect(isValid).toBe(true);
        });

        it("should handle long passwords", async () => {
            const password = "a".repeat(1000);
            const hash = await hashPassword(password);
            const isValid = await verifyPassword(hash, password);

            expect(isValid).toBe(true);
        });
    });
});

// ──────────────────────────────────────────────────────────────────────────────
// Session helpers
// ──────────────────────────────────────────────────────────────────────────────
describe("Session Helpers", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("getSession", () => {
        it("should return session when user is authenticated (Req 9.2)", async () => {
            const fakeSession = { user: { id: "1", email: "admin@example.com", name: "Admin" } };
            mockGetServerSession.mockResolvedValueOnce(fakeSession as any);

            const session = await getSession();
            expect(session).toEqual(fakeSession);
        });

        it("should return null when no session exists (Req 9.3)", async () => {
            mockGetServerSession.mockResolvedValueOnce(null);

            const session = await getSession();
            expect(session).toBeNull();
        });
    });

    describe("getCurrentUser", () => {
        it("should return user object when authenticated (Req 9.2)", async () => {
            const fakeUser = { id: "1", email: "admin@example.com", name: "Admin" };
            mockGetServerSession.mockResolvedValueOnce({ user: fakeUser } as any);

            const user = await getCurrentUser();
            expect(user).toEqual(fakeUser);
        });

        it("should return undefined when not authenticated (Req 9.3)", async () => {
            mockGetServerSession.mockResolvedValueOnce(null);

            const user = await getCurrentUser();
            expect(user).toBeUndefined();
        });
    });

    describe("isAuthenticated", () => {
        it("should return true when session has a user (Req 9.2, 9.4)", async () => {
            const fakeSession = { user: { id: "1", email: "admin@example.com", name: "Admin" } };
            mockGetServerSession.mockResolvedValueOnce(fakeSession as any);

            const result = await isAuthenticated();
            expect(result).toBe(true);
        });

        it("should return false when no session exists (Req 9.3)", async () => {
            mockGetServerSession.mockResolvedValueOnce(null);

            const result = await isAuthenticated();
            expect(result).toBe(false);
        });

        it("should return false when session has no user (Req 9.3)", async () => {
            mockGetServerSession.mockResolvedValueOnce({} as any);

            const result = await isAuthenticated();
            expect(result).toBe(false);
        });
    });
});

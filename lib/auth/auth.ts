import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import * as argon2 from "argon2";

/**
 * Get the current authenticated session on the server
 * @returns The session object or null if not authenticated
 */
export async function getSession() {
    return await getServerSession(authOptions);
}

/**
 * Get the current authenticated user
 * @returns The user object or null if not authenticated
 */
export async function getCurrentUser() {
    const session = await getSession();
    return session?.user;
}

/**
 * Check if the current request is authenticated
 * @returns true if authenticated, false otherwise
 */
export async function isAuthenticated() {
    const session = await getSession();
    return !!session?.user;
}

/**
 * Hash a password using Argon2
 * @param password The plain text password to hash
 * @returns The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
    return await argon2.hash(password);
}

/**
 * Verify a password against a hash using Argon2
 * @param hash The stored password hash
 * @param password The plain text password to verify
 * @returns true if the password matches, false otherwise
 */
export async function verifyPassword(
    hash: string,
    password: string
): Promise<boolean> {
    try {
        return await argon2.verify(hash, password);
    } catch (error) {
        return false;
    }
}

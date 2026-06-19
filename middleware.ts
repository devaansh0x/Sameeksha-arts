import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Authentication middleware for protecting admin routes.
 * 
 * This middleware:
 * - Protects all routes under /admin/*
 * - Redirects unauthenticated users to the login page
 * - Allows authenticated users to access protected routes
 * - Implements session-based authentication with NextAuth.js
 * 
 * Requirements: 9.2, 9.3
 */
export default withAuth(
    function middleware(req) {
        // Request has been authenticated, allow access
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => {
                // User is authorized if they have a valid session token
                return !!token;
            },
        },
        pages: {
            signIn: "/admin/login",
        },
    }
);

/**
 * Configure which routes this middleware applies to.
 * Protects all /admin/* routes except the login page itself.
 */
export const config = {
    matcher: [
        // Protect all admin routes except login
        "/admin/((?!login).*)",
    ],
};

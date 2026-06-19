/**
 * Password Change API Endpoint
 * POST /api/admin/password
 *
 * Allows an authenticated admin user to change their password.
 * Verifies the current password, validates the new password,
 * hashes it with Argon2, and updates the database record.
 *
 * Requirements: 29.1, 29.2, 29.3, 29.4, 29.5, 29.6
 * Task: 13.2
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession, verifyPassword, hashPassword } from '@/lib/auth';
import prisma from '@/lib/database/prisma';
import { passwordChangeSchema } from '@/lib/validation/validationSchemas';

/**
 * POST /api/admin/password
 * Change the current admin user's password.
 */
export async function POST(request: NextRequest) {
    try {
        // Authentication check
        const session = await getSession();
        if (!session || !session.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized. Please log in to change your password.' },
                { status: 401 }
            );
        }

        const userId = (session.user as { id?: string }).id;
        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized. User ID not found in session.' },
                { status: 401 }
            );
        }

        // Parse JSON body
        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON body.' },
                { status: 400 }
            );
        }

        // Validate with Zod passwordChangeSchema
        const parseResult = passwordChangeSchema.safeParse(body);
        if (!parseResult.success) {
            const errors: Record<string, string[]> = {};
            for (const issue of parseResult.error.issues) {
                const field = issue.path.join('.') || 'general';
                if (!errors[field]) {
                    errors[field] = [];
                }
                errors[field].push(issue.message);
            }
            return NextResponse.json(
                { success: false, errors },
                { status: 400 }
            );
        }

        const { currentPassword, newPassword } = parseResult.data;

        // Query the user from the database
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found.' },
                { status: 404 }
            );
        }

        // Verify the current password
        const isCurrentPasswordValid = await verifyPassword(user.passwordHash, currentPassword);
        if (!isCurrentPasswordValid) {
            return NextResponse.json(
                { success: false, error: 'Current password is incorrect.' },
                { status: 400 }
            );
        }

        // Hash the new password
        const newPasswordHash = await hashPassword(newPassword);

        // Update the user's password hash in the database
        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newPasswordHash },
        });

        return NextResponse.json(
            { success: true, message: 'Password changed successfully.' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in POST /api/admin/password:', error);
        return NextResponse.json(
            { success: false, error: 'An unexpected error occurred. Please try again.' },
            { status: 500 }
        );
    }
}

/**
 * Handle all non-POST methods with 405.
 */
export async function GET() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use POST to change password.' },
        { status: 405 }
    );
}

export async function PUT() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use POST to change password.' },
        { status: 405 }
    );
}

export async function DELETE() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use POST to change password.' },
        { status: 405 }
    );
}

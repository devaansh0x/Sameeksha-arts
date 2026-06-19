/**
 * Recognition Entry API Endpoint
 * PUT /api/admin/recognition/[id]
 *
 * Updates an existing recognition entry (award, exhibition, institutional
 * collaboration, or press) with Zod validation and session authentication.
 * Triggers ISR revalidation of the recognition page after a successful update.
 *
 * Requirements: 13.4, 13.5
 * Task: 9.2
 */

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { recognitionSchema } from '@/lib/validation/validationSchemas';
import prisma from '@/lib/database/prisma';

/**
 * PUT /api/admin/recognition/[id]
 * Update an existing recognition entry
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // 1. Authentication check
        const session = await getSession();
        if (!session || !session.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized. Please log in.' },
                { status: 401 }
            );
        }

        // 2. Extract id from route params
        const { id } = params;

        // 3. Parse JSON body
        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON body.' },
                { status: 400 }
            );
        }

        // 4. Validate with Zod recognitionSchema
        const parsed = recognitionSchema.safeParse(body);
        if (!parsed.success) {
            const errors: Record<string, string[]> = {};
            for (const issue of parsed.error.issues) {
                const key = issue.path.join('.') || 'general';
                if (!errors[key]) errors[key] = [];
                errors[key].push(issue.message);
            }
            return NextResponse.json(
                { success: false, errors },
                { status: 422 }
            );
        }

        const { title, type, date, description, published } = parsed.data;

        // 5. Check that the recognition entry exists
        const existing = await prisma.recognition.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json(
                { success: false, error: 'Recognition entry not found.' },
                { status: 404 }
            );
        }

        // 6. Update the record
        const recognition = await prisma.recognition.update({
            where: { id },
            data: {
                title,
                type,
                date: date instanceof Date ? date : new Date(date),
                description,
                published: published ?? true,
            },
            select: {
                id: true,
                title: true,
                type: true,
                date: true,
                description: true,
                published: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        // 7. Trigger ISR revalidation (non-fatal if it fails)
        try {
            revalidatePath('/recognition');
        } catch (revalidateError) {
            console.warn('Failed to revalidate /recognition path:', revalidateError);
        }

        // 8. Return 200 with updated record
        return NextResponse.json(
            { success: true, recognition },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error updating recognition entry:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error
                    ? `Failed to update recognition entry: ${error.message}`
                    : 'An unexpected error occurred. Please try again.',
            },
            { status: 500 }
        );
    }
}

/**
 * Catch-all for unsupported HTTP methods
 */
export async function GET() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use PUT to update a recognition entry.' },
        { status: 405 }
    );
}

export async function POST() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use PUT to update a recognition entry.' },
        { status: 405 }
    );
}

export async function DELETE() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use PUT to update a recognition entry.' },
        { status: 405 }
    );
}

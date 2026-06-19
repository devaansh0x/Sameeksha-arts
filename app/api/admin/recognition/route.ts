/**
 * Recognition API Endpoint
 * POST /api/admin/recognition
 *
 * Creates a new recognition entry (award, exhibition, institutional
 * collaboration, or press) with Zod validation and session authentication.
 *
 * Requirements: 13.1, 13.2
 * Task: 9.1
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { recognitionSchema } from '@/lib/validation/validationSchemas';
import prisma from '@/lib/database/prisma';

/**
 * POST /api/admin/recognition
 * Create a new recognition entry
 */
export async function POST(request: NextRequest) {
    try {
        // Authentication check
        const session = await getSession();
        if (!session || !session.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized. Please log in.' },
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

        // Validate with Zod recognitionSchema
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

        // Create Recognition record via Prisma
        const recognition = await prisma.recognition.create({
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

        return NextResponse.json(
            { success: true, recognition },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating recognition entry:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error
                    ? `Failed to create recognition entry: ${error.message}`
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
        { success: false, error: 'Method not allowed. Use POST to create a recognition entry.' },
        { status: 405 }
    );
}

export async function PUT() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use POST to create a recognition entry.' },
        { status: 405 }
    );
}

export async function DELETE() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use POST to create a recognition entry.' },
        { status: 405 }
    );
}

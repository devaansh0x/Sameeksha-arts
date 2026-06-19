/**
 * Testimonial API Endpoint
 * POST /api/admin/testimonial
 *
 * Creates a new testimonial with Zod validation and auto-assigned display order.
 *
 * Requirements: 16.1, 16.2
 * Task: 10.1
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/database/prisma';
import { testimonialSchema } from '@/lib/validation/validationSchemas';

/**
 * POST /api/admin/testimonial
 * Create a new testimonial record.
 */
export async function POST(request: NextRequest) {
    try {
        // Authentication check
        const session = await getSession();
        if (!session || !session.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized. Please log in to manage testimonials.' },
                { status: 401 }
            );
        }

        // Parse request body
        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON body.' },
                { status: 400 }
            );
        }

        // Validate with Zod (omit order — it is auto-assigned)
        const createSchema = testimonialSchema.omit({ order: true });
        const parseResult = createSchema.safeParse(body);

        if (!parseResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Validation failed.',
                    details: parseResult.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        const { clientName, clientTitle, text, published } = parseResult.data;

        // Auto-assign order: MAX(order) + 1, or 1 if no testimonials exist
        const maxOrderResult = await prisma.testimonial.aggregate({
            _max: { order: true },
        });
        const nextOrder = (maxOrderResult._max.order ?? 0) + 1;

        // Create testimonial record
        const testimonial = await prisma.testimonial.create({
            data: {
                clientName,
                clientTitle: clientTitle ?? null,
                text,
                order: nextOrder,
                published: published ?? true,
            },
            select: {
                id: true,
                clientName: true,
                clientTitle: true,
                text: true,
                order: true,
                published: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json(
            { success: true, testimonial },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating testimonial:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error
                    ? `Failed to create testimonial: ${error.message}`
                    : 'An unexpected error occurred. Please try again.',
            },
            { status: 500 }
        );
    }
}

/**
 * Catch-all handler for unsupported methods.
 */
export async function GET() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use POST to create a testimonial.' },
        { status: 405 }
    );
}

export async function PUT() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use POST to create a testimonial.' },
        { status: 405 }
    );
}

export async function DELETE() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use POST to create a testimonial.' },
        { status: 405 }
    );
}

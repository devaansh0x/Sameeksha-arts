/**
 * Testimonial Update API Endpoint
 * PUT /api/admin/testimonial/[id]
 *
 * Updates an existing testimonial, including support for reordering.
 * When the order changes, other testimonials are shifted to make room.
 *
 * Requirements: 16.4, 16.5
 * Task: 10.2
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/database/prisma';
import { testimonialSchema } from '@/lib/validation/validationSchemas';

/**
 * PUT /api/admin/testimonial/[id]
 * Update an existing testimonial record.
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
                { success: false, error: 'Unauthorized. Please log in to manage testimonials.' },
                { status: 401 }
            );
        }

        // 2. Extract id from params
        const { id } = params;

        // 3. Parse request body
        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON body.' },
                { status: 400 }
            );
        }

        // 4. Validate with Zod — order and published are fully optional for updates.
        // We extend the base schema so order/published have no default, ensuring
        // undefined is preserved when the caller omits those fields.
        const updateSchema = testimonialSchema
            .extend({
                order: testimonialSchema.shape.order.removeDefault().optional(),
                published: testimonialSchema.shape.published.removeDefault().optional(),
            })
            .partial({ order: true, published: true });
        const parseResult = updateSchema.safeParse(body);

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

        const { clientName, clientTitle, text, order, published } = parseResult.data;

        // 5. Check that the testimonial exists
        const existing = await prisma.testimonial.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { success: false, error: 'Testimonial not found.' },
                { status: 404 }
            );
        }

        // 6. Handle reordering if a new order is supplied and differs from current
        if (order !== undefined && order !== existing.order) {
            const oldOrder = existing.order;
            const newOrder = order;

            if (newOrder > oldOrder) {
                // Moving down: shift items between oldOrder+1 and newOrder up by 1
                await prisma.testimonial.updateMany({
                    where: {
                        id: { not: id },
                        order: { gt: oldOrder, lte: newOrder },
                    },
                    data: { order: { decrement: 1 } },
                });
            } else {
                // Moving up: shift items between newOrder and oldOrder-1 down by 1
                await prisma.testimonial.updateMany({
                    where: {
                        id: { not: id },
                        order: { gte: newOrder, lt: oldOrder },
                    },
                    data: { order: { increment: 1 } },
                });
            }
        }

        // 7. Update the record
        const testimonial = await prisma.testimonial.update({
            where: { id },
            data: {
                clientName,
                clientTitle: clientTitle ?? null,
                text,
                ...(order !== undefined && { order }),
                ...(published !== undefined && { published }),
            },
            select: {
                id: true,
                clientName: true,
                clientTitle: true,
                text: true,
                order: true,
                published: true,
                updatedAt: true,
            },
        });

        // 8. Return 200 with the updated record
        return NextResponse.json(
            { success: true, testimonial },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error updating testimonial:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error
                    ? `Failed to update testimonial: ${error.message}`
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
        { success: false, error: 'Method not allowed. Use PUT to update a testimonial.' },
        { status: 405 }
    );
}

export async function POST() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use PUT to update a testimonial.' },
        { status: 405 }
    );
}

export async function DELETE() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use PUT to update a testimonial.' },
        { status: 405 }
    );
}

/**
 * Inquiry Status Update API Endpoint
 * PATCH /api/admin/inquiries/[id]
 *
 * Updates the status of a single inquiry (UNREAD → READ → ARCHIVED).
 *
 * Requirements: 17.4, 17.5 — Task 11.3
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/database/prisma';
import { inquiryUpdateSchema } from '@/lib/validation/validationSchemas';

/**
 * PATCH /api/admin/inquiries/[id]
 * Body: { status: 'UNREAD' | 'READ' | 'ARCHIVED' }
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession();
        if (!session || !session.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized.' },
                { status: 401 }
            );
        }

        const { id } = params;

        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON body.' },
                { status: 400 }
            );
        }

        const parsed = inquiryUpdateSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { success: false, errors: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const existing = await prisma.inquiry.findUnique({ where: { id }, select: { id: true } });
        if (!existing) {
            return NextResponse.json(
                { success: false, error: 'Inquiry not found.' },
                { status: 404 }
            );
        }

        const inquiry = await prisma.inquiry.update({
            where: { id },
            data: { status: parsed.data.status },
            select: {
                id: true,
                name: true,
                email: true,
                subject: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json(
            { success: true, inquiry: { ...inquiry, createdAt: inquiry.createdAt.toISOString(), updatedAt: inquiry.updatedAt.toISOString() } },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in PATCH /api/admin/inquiries/[id]:', error);
        return NextResponse.json(
            { success: false, error: 'An unexpected error occurred.' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({ success: false, error: 'Method not allowed. Use PATCH to update an inquiry.' }, { status: 405 });
}
export async function POST() {
    return NextResponse.json({ success: false, error: 'Method not allowed.' }, { status: 405 });
}
export async function PUT() {
    return NextResponse.json({ success: false, error: 'Method not allowed.' }, { status: 405 });
}
export async function DELETE() {
    return NextResponse.json({ success: false, error: 'Method not allowed.' }, { status: 405 });
}

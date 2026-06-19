/**
 * Inquiry Management API Endpoint
 * GET /api/admin/inquiries
 *
 * Returns a paginated, optionally filtered list of Commission_Inquiry records
 * in reverse chronological order (newest first), along with a count of all
 * UNREAD inquiries.
 *
 * Query parameters:
 *   status  – filter by inquiry status: 'UNREAD' | 'READ' | 'ARCHIVED'
 *             (case-insensitive; omit to return all statuses)
 *   page    – page number (default: 1, min: 1)
 *   limit   – items per page (default: 20, max: 100)
 *
 * Requirements: 17.1, 17.2, 17.7
 * Task: 11.2
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/database/prisma';
import { InquiryStatus } from '@prisma/client';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse a positive integer from a query string value, falling back to `defaultValue`. */
function parsePositiveInt(raw: string | null, defaultValue: number): number {
    if (raw === null) return defaultValue;
    const parsed = parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultValue;
}

/**
 * Normalise the raw status query param to an InquiryStatus enum value.
 * Returns `null` when the value is absent or unrecognised.
 */
function parseStatus(raw: string | null): InquiryStatus | null {
    if (!raw) return null;
    const upper = raw.toUpperCase();
    if (upper === 'UNREAD') return InquiryStatus.UNREAD;
    if (upper === 'READ') return InquiryStatus.READ;
    if (upper === 'ARCHIVED') return InquiryStatus.ARCHIVED;
    return null;
}

// ---------------------------------------------------------------------------
// GET /api/admin/inquiries
// ---------------------------------------------------------------------------

/**
 * Retrieve a paginated list of inquiries.
 *
 * Returns:
 * {
 *   success: true,
 *   inquiries: Array<{ id, name, email, subject, message, status, createdAt, updatedAt }>,
 *   pagination: { total, page, limit, totalPages },
 *   unreadCount: number,
 * }
 */
export async function GET(request: NextRequest) {
    try {
        // --- Authentication ---
        const session = await getSession();
        if (!session || !session.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized. Please log in to view inquiries.' },
                { status: 401 }
            );
        }

        // --- Query Parameters ---
        const { searchParams } = request.nextUrl;

        const rawStatus = searchParams.get('status');
        const statusFilter = parseStatus(rawStatus);

        // If a non-empty status value was provided but didn't match a valid enum member,
        // return a 400 rather than silently ignoring it.
        if (rawStatus && rawStatus.trim() !== '' && statusFilter === null) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Invalid status value "${rawStatus}". Must be one of: UNREAD, READ, ARCHIVED.`,
                },
                { status: 400 }
            );
        }

        const page = parsePositiveInt(searchParams.get('page'), 1);
        const rawLimit = parsePositiveInt(searchParams.get('limit'), 20);
        const limit = Math.min(rawLimit, 100); // cap at 100

        const skip = (page - 1) * limit;

        // --- Database Queries ---
        // Build a where clause that is either status-filtered or unrestricted.
        const where = statusFilter ? { status: statusFilter } : {};

        const [total, inquiries, unreadCount] = await Promise.all([
            prisma.inquiry.count({ where }),
            prisma.inquiry.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    subject: true,
                    message: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
            prisma.inquiry.count({ where: { status: InquiryStatus.UNREAD } }),
        ]);

        const totalPages = Math.ceil(total / limit) || 1;

        // --- Response ---
        return NextResponse.json(
            {
                success: true,
                inquiries: inquiries.map((inq) => ({
                    ...inq,
                    createdAt: inq.createdAt.toISOString(),
                    updatedAt: inq.updatedAt.toISOString(),
                })),
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages,
                },
                unreadCount,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in GET /api/admin/inquiries:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'An unexpected error occurred while fetching inquiries. Please try again.',
            },
            { status: 500 }
        );
    }
}

// ---------------------------------------------------------------------------
// All other methods → 405
// ---------------------------------------------------------------------------

export async function POST() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use PATCH /api/admin/inquiries/[id] to update an inquiry.' },
        { status: 405 }
    );
}

export async function PUT() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use PATCH /api/admin/inquiries/[id] to update an inquiry.' },
        { status: 405 }
    );
}

export async function DELETE() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed.' },
        { status: 405 }
    );
}

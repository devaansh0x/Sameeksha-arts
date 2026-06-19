/**
 * Admin Dashboard API Endpoint
 * GET /api/admin/dashboard
 *
 * Returns an overview of website statistics:
 * - Total counts for artworks, collections, recognition entries, and unread inquiries
 * - Artwork counts broken down by availability status
 * - Most recent 5 inquiries (id, name, email, subject, status, createdAt)
 *
 * Requirements: 28.1, 28.2, 28.3, 28.4, 28.5, 28.6, 28.7
 * Task: 13.3
 */

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/database/prisma';

/**
 * GET /api/admin/dashboard
 * Returns dashboard overview statistics and recent inquiries.
 */
export async function GET() {
    try {
        // Authentication check
        const session = await getSession();
        if (!session || !session.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized. Please log in to access the dashboard.' },
                { status: 401 }
            );
        }

        // Run all queries in parallel for efficiency
        const [
            artworkCount,
            collectionCount,
            recognitionCount,
            unreadInquiryCount,
            recentInquiriesRaw,
            artworksByStatusRaw,
        ] = await Promise.all([
            prisma.artwork.count(),
            prisma.collection.count(),
            prisma.recognition.count(),
            prisma.inquiry.count({ where: { status: 'UNREAD' } }),
            prisma.inquiry.findMany({
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    subject: true,
                    status: true,
                    createdAt: true,
                },
            }),
            prisma.artwork.groupBy({
                by: ['availabilityStatus'],
                _count: { id: true },
            }),
        ]);

        // Build artworksByStatus map from groupBy result
        // Default all statuses to 0, then fill in actual counts
        const artworksByStatus: Record<string, number> = {
            AVAILABLE: 0,
            SOLD: 0,
            ON_COMMISSION: 0,
            NOT_FOR_SALE: 0,
        };

        for (const group of artworksByStatusRaw) {
            artworksByStatus[group.availabilityStatus] = group._count.id;
        }

        // Serialize recent inquiries (dates to ISO strings)
        const recentInquiries = recentInquiriesRaw.map((inquiry) => ({
            id: inquiry.id,
            name: inquiry.name,
            email: inquiry.email,
            subject: inquiry.subject,
            status: inquiry.status,
            createdAt: inquiry.createdAt.toISOString(),
        }));

        return NextResponse.json(
            {
                success: true,
                stats: {
                    artworkCount,
                    collectionCount,
                    recognitionCount,
                    unreadInquiryCount,
                    artworksByStatus,
                },
                recentInquiries,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in GET /api/admin/dashboard:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'An unexpected error occurred. Please try again.',
            },
            { status: 500 }
        );
    }
}

/**
 * Handle all non-GET methods with 405.
 */
export async function POST() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use GET to fetch dashboard data.' },
        { status: 405 }
    );
}

export async function PUT() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use GET to fetch dashboard data.' },
        { status: 405 }
    );
}

export async function DELETE() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use GET to fetch dashboard data.' },
        { status: 405 }
    );
}

export async function PATCH() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use GET to fetch dashboard data.' },
        { status: 405 }
    );
}

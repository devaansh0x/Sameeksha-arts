/**
 * Public Page Content API Endpoint
 * GET /api/content/[page]
 *
 * Public endpoint for fetching published page content for homepage, about,
 * and commissions pages. No authentication required — read-only access.
 *
 * Requirements: 1.1-1.9, 6.1-6.5, 14.3, 14.4
 * Task: 12.2
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';

// Valid page identifiers
const VALID_PAGES = ['homepage', 'about', 'commissions'] as const;
type ValidPage = (typeof VALID_PAGES)[number];

// ---------------------------------------------------------------------------
// GET /api/content/[page]
// ---------------------------------------------------------------------------

export async function GET(
    _request: NextRequest,
    { params }: { params: { page: string } }
) {
    try {
        // 1. Validate the dynamic segment
        const { page } = params;
        if (!VALID_PAGES.includes(page as ValidPage)) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Invalid page. Must be one of: ${VALID_PAGES.join(', ')}.`,
                },
                { status: 400 }
            );
        }

        const validPage = page as ValidPage;

        // 2. Query the PageContent record
        const record = await prisma.pageContent.findUnique({
            where: { page: validPage },
        });

        // 3. Return 404 if no content has been published for this page yet
        if (!record) {
            return NextResponse.json(
                { success: false, error: 'Page content not found.' },
                { status: 404 }
            );
        }

        // 4. Return the published content
        return NextResponse.json(
            {
                success: true,
                page: record.page,
                content: record.content,
                updatedAt: record.updatedAt.toISOString(),
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('[Content API] Unexpected error:', error);
        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? `Failed to fetch content: ${error.message}`
                        : 'An unexpected error occurred. Please try again.',
            },
            { status: 500 }
        );
    }
}

// ---------------------------------------------------------------------------
// Method-not-allowed handlers
// ---------------------------------------------------------------------------

export async function POST() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use GET to fetch page content.' },
        { status: 405 }
    );
}

export async function PUT() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use GET to fetch page content.' },
        { status: 405 }
    );
}

export async function DELETE() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use GET to fetch page content.' },
        { status: 405 }
    );
}

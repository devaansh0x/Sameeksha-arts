/**
 * Page Content API Endpoint
 * PUT /api/admin/content/[page]
 *
 * Handles updating structured page content for homepage, about, and commissions pages.
 * Validates JSON structure per page type using Zod, upserts the PageContent record,
 * and triggers SSG revalidation after a successful update.
 *
 * Requirements: 14.3, 14.4, 15.6, 19.7
 * Task: 12.1
 */

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/database/prisma';

// ---------------------------------------------------------------------------
// Zod schemas for each page's content structure
// ---------------------------------------------------------------------------

const homepageContentSchema = z.object({
    hero: z.object({
        artworkId: z.string().nullable(),
        heading: z.string().min(1),
        subheading: z.string().min(1),
    }),
    introduction: z.object({
        heading: z.string().min(1),
        text: z.string().min(1),
    }),
    selectedWorks: z.object({
        artworkIds: z.array(z.string()),
    }),
    artistWorld: z.object({
        heading: z.string().min(1),
        text: z.string().min(1),
        imageUrl: z.string().nullable().optional(),
    }),
    commissionInvitation: z.object({
        heading: z.string().min(1),
        text: z.string().min(1),
    }),
    contactInvitation: z.object({
        heading: z.string().min(1),
        text: z.string().min(1),
    }),
});

const aboutContentSchema = z.object({
    biography: z.object({
        text: z.string().min(1),
        portraitUrl: z.string().nullable().optional(),
    }),
    philosophy: z.object({
        heading: z.string().min(1),
        text: z.string().min(1),
    }),
    studio: z.object({
        heading: z.string().min(1),
        text: z.string().min(1),
        imageUrl: z.string().nullable().optional(),
    }),
});

const commissionsContentSchema = z.object({
    process: z.object({
        heading: z.string().min(1),
        steps: z.array(
            z.object({
                title: z.string().min(1),
                description: z.string().min(1),
            })
        ),
    }),
    examples: z.object({
        artworkIds: z.array(z.string()),
    }),
    stories: z.array(
        z.object({
            id: z.string(),
            title: z.string().min(1),
            text: z.string().min(1),
        })
    ),
    invitation: z.object({
        heading: z.string().min(1),
        text: z.string().min(1),
    }),
});

// Valid page identifiers
const VALID_PAGES = ['homepage', 'about', 'commissions'] as const;
type ValidPage = (typeof VALID_PAGES)[number];

// Map each page to its revalidation path
const PAGE_PATHS: Record<ValidPage, string> = {
    homepage: '/',
    about: '/about',
    commissions: '/commissions',
};

// Map each page to its Zod schema
const PAGE_SCHEMAS: Record<ValidPage, z.ZodTypeAny> = {
    homepage: homepageContentSchema,
    about: aboutContentSchema,
    commissions: commissionsContentSchema,
};

// Request body schema
const requestBodySchema = z.object({
    content: z.record(z.string(), z.unknown()),
});

// ---------------------------------------------------------------------------
// PUT /api/admin/content/[page]
// ---------------------------------------------------------------------------

export async function PUT(
    request: NextRequest,
    { params }: { params: { page: string } }
) {
    try {
        // 1. Require authentication
        const session = await getSession();
        if (!session || !session.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized. Please log in to update content.' },
                { status: 401 }
            );
        }

        // 2. Validate the dynamic segment
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

        // 4. Validate the top-level body shape
        const bodyResult = requestBodySchema.safeParse(body);
        if (!bodyResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Request body must include a "content" object.',
                    details: bodyResult.error.flatten(),
                },
                { status: 400 }
            );
        }

        // 5. Validate content against the page-specific schema
        const contentSchema = PAGE_SCHEMAS[validPage];
        const contentResult = contentSchema.safeParse(bodyResult.data.content);
        if (!contentResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Invalid content structure for page "${validPage}".`,
                    details: contentResult.error.flatten(),
                },
                { status: 400 }
            );
        }

        const validatedContent = contentResult.data;

        // 6. Upsert PageContent record
        const record = await prisma.pageContent.upsert({
            where: { page: validPage },
            create: {
                page: validPage,
                content: validatedContent,
            },
            update: {
                content: validatedContent,
            },
        });

        // 7. Trigger SSG revalidation for the relevant page path
        // Wrapped in try/catch so test environments don't fail
        try {
            revalidatePath(PAGE_PATHS[validPage]);
        } catch {
            // revalidatePath may not work in test/non-Next.js environments – ignore
        }

        // 8. Return success response
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
        console.error('Error updating page content:', error);
        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? `Failed to update content: ${error.message}`
                        : 'An unexpected error occurred. Please try again.',
            },
            { status: 500 }
        );
    }
}

// ---------------------------------------------------------------------------
// Method-not-allowed handlers
// ---------------------------------------------------------------------------

export async function GET() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use PUT to update page content.' },
        { status: 405 }
    );
}

export async function POST() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use PUT to update page content.' },
        { status: 405 }
    );
}

export async function DELETE() {
    return NextResponse.json(
        { success: false, error: 'Method not allowed. Use PUT to update page content.' },
        { status: 405 }
    );
}

/**
 * Tests for Page Content API Endpoint
 * PUT /api/admin/content/[page]
 *
 * Tests authentication, page validation, content structure validation,
 * upsert logic, SSG revalidation, and error handling.
 *
 * Requirements: 14.3, 14.4, 15.6, 19.7
 * Task: 12.1
 */

import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { PUT, GET, POST, DELETE } from './route';
import * as auth from '@/lib/auth';
import * as nextCache from 'next/cache';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('@/lib/auth');
jest.mock('next/cache', () => ({
    revalidatePath: jest.fn(),
}));

// Prisma singleton mock
jest.mock('@/lib/prisma', () => {
    const mockPrisma = {
        pageContent: {
            upsert: jest.fn(),
        },
    };
    return {
        __esModule: true,
        default: mockPrisma,
        prisma: mockPrisma,
    };
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VALID_HOMEPAGE_CONTENT = {
    hero: { artworkId: 'art1', heading: 'Welcome', subheading: 'Fine Art' },
    introduction: { heading: 'About', text: 'Some intro text.' },
    selectedWorks: { artworkIds: ['art1', 'art2'] },
    artistWorld: { heading: 'My World', text: 'Context here.' },
    commissionInvitation: { heading: 'Commission', text: 'Let us create.' },
    contactInvitation: { heading: 'Contact', text: 'Get in touch.' },
};

const VALID_ABOUT_CONTENT = {
    biography: { text: 'Biography text here.', portraitUrl: null },
    philosophy: { heading: 'Philosophy', text: 'My approach to art.' },
    studio: { heading: 'Studio', text: 'Where I work.', imageUrl: null },
};

const VALID_COMMISSIONS_CONTENT = {
    process: {
        heading: 'How It Works',
        steps: [
            { title: 'Consultation', description: 'We discuss your vision.' },
            { title: 'Creation', description: 'I create the artwork.' },
        ],
    },
    examples: { artworkIds: ['art3', 'art4'] },
    stories: [{ id: 'story1', title: 'Client Story', text: 'It was wonderful.' }],
    invitation: { heading: 'Commission Me', text: 'Reach out today.' },
};

function makeRequest(
    page: string,
    body: unknown,
    method = 'PUT'
): [NextRequest, { params: { page: string } }] {
    const request = new NextRequest(`http://localhost/api/admin/content/${page}`, {
        method,
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    });
    return [request, { params: { page } }];
}

function makeMockUpsertResult(page: string, content: unknown) {
    return {
        id: 'pc1',
        page,
        content,
        updatedAt: new Date('2024-06-01T12:00:00Z'),
    };
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('PUT /api/admin/content/[page]', () => {
    let mockGetSession: jest.MockedFunction<typeof auth.getSession>;
    let mockRevalidatePath: jest.MockedFunction<typeof nextCache.revalidatePath>;
    let mockPrisma: { pageContent: { upsert: jest.MockedFunction<any> } };

    beforeEach(async () => {
        jest.clearAllMocks();

        mockGetSession = auth.getSession as jest.MockedFunction<typeof auth.getSession>;
        mockRevalidatePath = nextCache.revalidatePath as jest.MockedFunction<typeof nextCache.revalidatePath>;

        // Re-require prisma mock to get reference to the mock object
        const prismaMod = await import('@/lib/database/prisma');
        mockPrisma = (prismaMod as any).default;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // -----------------------------------------------------------------------
    // Authentication
    // -----------------------------------------------------------------------
    describe('Authentication', () => {
        it('should return 401 when no session exists', async () => {
            mockGetSession.mockResolvedValue(null);

            const [req, ctx] = makeRequest('homepage', { content: VALID_HOMEPAGE_CONTENT });
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
            expect(data.error).toContain('Unauthorized');
        });

        it('should return 401 when session has no user', async () => {
            mockGetSession.mockResolvedValue({ user: null } as any);

            const [req, ctx] = makeRequest('homepage', { content: VALID_HOMEPAGE_CONTENT });
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
        });
    });

    // -----------------------------------------------------------------------
    // Page parameter validation
    // -----------------------------------------------------------------------
    describe('Page parameter validation', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue({
                user: { id: 'u1', email: 'admin@test.com', name: 'Admin' },
            } as any);
        });

        it('should return 400 for an unknown page', async () => {
            const [req, ctx] = makeRequest('settings', { content: {} });
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error).toMatch(/invalid page/i);
        });

        it('should accept "homepage" as a valid page', async () => {
            mockPrisma.pageContent.upsert.mockResolvedValue(
                makeMockUpsertResult('homepage', VALID_HOMEPAGE_CONTENT)
            );

            const [req, ctx] = makeRequest('homepage', { content: VALID_HOMEPAGE_CONTENT });
            const response = await PUT(req, ctx);

            expect(response.status).toBe(200);
        });

        it('should accept "about" as a valid page', async () => {
            mockPrisma.pageContent.upsert.mockResolvedValue(
                makeMockUpsertResult('about', VALID_ABOUT_CONTENT)
            );

            const [req, ctx] = makeRequest('about', { content: VALID_ABOUT_CONTENT });
            const response = await PUT(req, ctx);

            expect(response.status).toBe(200);
        });

        it('should accept "commissions" as a valid page', async () => {
            mockPrisma.pageContent.upsert.mockResolvedValue(
                makeMockUpsertResult('commissions', VALID_COMMISSIONS_CONTENT)
            );

            const [req, ctx] = makeRequest('commissions', { content: VALID_COMMISSIONS_CONTENT });
            const response = await PUT(req, ctx);

            expect(response.status).toBe(200);
        });
    });

    // -----------------------------------------------------------------------
    // Request body validation
    // -----------------------------------------------------------------------
    describe('Request body validation', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue({
                user: { id: 'u1', email: 'admin@test.com', name: 'Admin' },
            } as any);
        });

        it('should return 400 for invalid JSON body', async () => {
            const request = new NextRequest('http://localhost/api/admin/content/homepage', {
                method: 'PUT',
                body: 'not-json',
                headers: { 'Content-Type': 'application/json' },
            });

            const response = await PUT(request, { params: { page: 'homepage' } });
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
        });

        it('should return 400 when "content" field is missing from body', async () => {
            const [req, ctx] = makeRequest('homepage', { notContent: {} });
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
        });
    });

    // -----------------------------------------------------------------------
    // Content structure validation — homepage
    // -----------------------------------------------------------------------
    describe('Homepage content validation', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue({
                user: { id: 'u1', email: 'admin@test.com', name: 'Admin' },
            } as any);
        });

        it('should return 400 when homepage content is missing required sections', async () => {
            const invalidContent = { hero: { artworkId: null, heading: 'Hi', subheading: 'Sub' } };
            const [req, ctx] = makeRequest('homepage', { content: invalidContent });
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error).toContain('homepage');
        });

        it('should return 400 when hero section is malformed', async () => {
            const invalidContent = {
                ...VALID_HOMEPAGE_CONTENT,
                hero: { heading: 'Hi' }, // missing artworkId and subheading
            };
            const [req, ctx] = makeRequest('homepage', { content: invalidContent });
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
        });

        it('should accept hero.artworkId as null', async () => {
            mockPrisma.pageContent.upsert.mockResolvedValue(
                makeMockUpsertResult('homepage', {
                    ...VALID_HOMEPAGE_CONTENT,
                    hero: { artworkId: null, heading: 'Hi', subheading: 'Sub' },
                })
            );

            const content = {
                ...VALID_HOMEPAGE_CONTENT,
                hero: { artworkId: null, heading: 'Hi', subheading: 'Sub' },
            };
            const [req, ctx] = makeRequest('homepage', { content });
            const response = await PUT(req, ctx);

            expect(response.status).toBe(200);
        });

        it('should accept artistWorld without optional imageUrl', async () => {
            mockPrisma.pageContent.upsert.mockResolvedValue(
                makeMockUpsertResult('homepage', VALID_HOMEPAGE_CONTENT)
            );

            const content = {
                ...VALID_HOMEPAGE_CONTENT,
                artistWorld: { heading: 'World', text: 'Context.' }, // no imageUrl
            };
            const [req, ctx] = makeRequest('homepage', { content });
            const response = await PUT(req, ctx);

            expect(response.status).toBe(200);
        });
    });

    // -----------------------------------------------------------------------
    // Content structure validation — about
    // -----------------------------------------------------------------------
    describe('About content validation', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue({
                user: { id: 'u1', email: 'admin@test.com', name: 'Admin' },
            } as any);
        });

        it('should return 400 when about content is missing biography', async () => {
            const invalidContent = {
                philosophy: { heading: 'Philosophy', text: 'Text' },
                studio: { heading: 'Studio', text: 'Text' },
            };
            const [req, ctx] = makeRequest('about', { content: invalidContent });
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
        });

        it('should accept biography without optional portraitUrl', async () => {
            mockPrisma.pageContent.upsert.mockResolvedValue(
                makeMockUpsertResult('about', VALID_ABOUT_CONTENT)
            );

            const content = {
                ...VALID_ABOUT_CONTENT,
                biography: { text: 'Bio text.' }, // no portraitUrl
            };
            const [req, ctx] = makeRequest('about', { content });
            const response = await PUT(req, ctx);

            expect(response.status).toBe(200);
        });
    });

    // -----------------------------------------------------------------------
    // Content structure validation — commissions
    // -----------------------------------------------------------------------
    describe('Commissions content validation', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue({
                user: { id: 'u1', email: 'admin@test.com', name: 'Admin' },
            } as any);
        });

        it('should return 400 when process steps are malformed', async () => {
            const invalidContent = {
                ...VALID_COMMISSIONS_CONTENT,
                process: {
                    heading: 'Process',
                    steps: [{ title: 'Step 1' }], // missing description
                },
            };
            const [req, ctx] = makeRequest('commissions', { content: invalidContent });
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
        });

        it('should accept an empty stories array', async () => {
            mockPrisma.pageContent.upsert.mockResolvedValue(
                makeMockUpsertResult('commissions', { ...VALID_COMMISSIONS_CONTENT, stories: [] })
            );

            const content = { ...VALID_COMMISSIONS_CONTENT, stories: [] };
            const [req, ctx] = makeRequest('commissions', { content });
            const response = await PUT(req, ctx);

            expect(response.status).toBe(200);
        });

        it('should return 400 when a story is missing the text field', async () => {
            const invalidContent = {
                ...VALID_COMMISSIONS_CONTENT,
                stories: [{ id: 's1', title: 'Story' }], // missing text
            };
            const [req, ctx] = makeRequest('commissions', { content: invalidContent });
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
        });
    });

    // -----------------------------------------------------------------------
    // Successful update behaviour
    // -----------------------------------------------------------------------
    describe('Successful update', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue({
                user: { id: 'u1', email: 'admin@test.com', name: 'Admin' },
            } as any);
        });

        it('should upsert the record and return 200 with expected shape', async () => {
            const updatedAt = new Date('2024-06-01T12:00:00Z');
            mockPrisma.pageContent.upsert.mockResolvedValue({
                id: 'pc1',
                page: 'homepage',
                content: VALID_HOMEPAGE_CONTENT,
                updatedAt,
            });

            const [req, ctx] = makeRequest('homepage', { content: VALID_HOMEPAGE_CONTENT });
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.page).toBe('homepage');
            expect(data.content).toEqual(VALID_HOMEPAGE_CONTENT);
            expect(data.updatedAt).toBe(updatedAt.toISOString());
        });

        it('should call prisma.pageContent.upsert with correct arguments', async () => {
            mockPrisma.pageContent.upsert.mockResolvedValue(
                makeMockUpsertResult('about', VALID_ABOUT_CONTENT)
            );

            const [req, ctx] = makeRequest('about', { content: VALID_ABOUT_CONTENT });
            await PUT(req, ctx);

            expect(mockPrisma.pageContent.upsert).toHaveBeenCalledWith({
                where: { page: 'about' },
                create: { page: 'about', content: VALID_ABOUT_CONTENT },
                update: { content: VALID_ABOUT_CONTENT },
            });
        });

        it('should revalidate "/" path for homepage', async () => {
            mockPrisma.pageContent.upsert.mockResolvedValue(
                makeMockUpsertResult('homepage', VALID_HOMEPAGE_CONTENT)
            );

            const [req, ctx] = makeRequest('homepage', { content: VALID_HOMEPAGE_CONTENT });
            await PUT(req, ctx);

            expect(mockRevalidatePath).toHaveBeenCalledWith('/');
        });

        it('should revalidate "/about" path for about', async () => {
            mockPrisma.pageContent.upsert.mockResolvedValue(
                makeMockUpsertResult('about', VALID_ABOUT_CONTENT)
            );

            const [req, ctx] = makeRequest('about', { content: VALID_ABOUT_CONTENT });
            await PUT(req, ctx);

            expect(mockRevalidatePath).toHaveBeenCalledWith('/about');
        });

        it('should revalidate "/commissions" path for commissions', async () => {
            mockPrisma.pageContent.upsert.mockResolvedValue(
                makeMockUpsertResult('commissions', VALID_COMMISSIONS_CONTENT)
            );

            const [req, ctx] = makeRequest('commissions', { content: VALID_COMMISSIONS_CONTENT });
            await PUT(req, ctx);

            expect(mockRevalidatePath).toHaveBeenCalledWith('/commissions');
        });
    });

    // -----------------------------------------------------------------------
    // Database error handling
    // -----------------------------------------------------------------------
    describe('Database error handling', () => {
        beforeEach(() => {
            mockGetSession.mockResolvedValue({
                user: { id: 'u1', email: 'admin@test.com', name: 'Admin' },
            } as any);
        });

        it('should return 500 when prisma upsert throws', async () => {
            mockPrisma.pageContent.upsert.mockRejectedValue(
                new Error('DB connection refused')
            );

            const [req, ctx] = makeRequest('homepage', { content: VALID_HOMEPAGE_CONTENT });
            const response = await PUT(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.error).toBeTruthy();
        });
    });
});

// ---------------------------------------------------------------------------
// Method-not-allowed handlers
// ---------------------------------------------------------------------------

describe('Non-PUT methods', () => {
    it('GET should return 405', async () => {
        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(405);
        expect(data.success).toBe(false);
        expect(data.error).toContain('Method not allowed');
    });

    it('POST should return 405', async () => {
        const response = await POST();
        const data = await response.json();

        expect(response.status).toBe(405);
        expect(data.success).toBe(false);
    });

    it('DELETE should return 405', async () => {
        const response = await DELETE();
        const data = await response.json();

        expect(response.status).toBe(405);
        expect(data.success).toBe(false);
    });
});

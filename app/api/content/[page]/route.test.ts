/**
 * Tests for Public Page Content API Endpoint
 * GET /api/content/[page]
 *
 * Tests page validation, content retrieval, 404 handling, and error handling.
 * No authentication is required for this public endpoint.
 *
 * Requirements: 1.1-1.9, 6.1-6.5, 14.3, 14.4
 * Task: 12.2
 */

import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET, POST, PUT, DELETE } from './route';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('@/lib/prisma', () => {
    const mockPrisma = {
        pageContent: {
            findUnique: jest.fn(),
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

const SAMPLE_HOMEPAGE_CONTENT = {
    hero: { artworkId: 'art1', heading: 'Welcome', subheading: 'Fine Art' },
    introduction: { heading: 'About', text: 'Some intro text.' },
    selectedWorks: { artworkIds: ['art1', 'art2'] },
    artistWorld: { heading: 'My World', text: 'Context here.' },
    commissionInvitation: { heading: 'Commission', text: 'Let us create.' },
    contactInvitation: { heading: 'Contact', text: 'Get in touch.' },
};

const SAMPLE_ABOUT_CONTENT = {
    biography: { text: 'Biography text here.', portraitUrl: null },
    philosophy: { heading: 'Philosophy', text: 'My approach to art.' },
    studio: { heading: 'Studio', text: 'Where I work.', imageUrl: null },
};

const SAMPLE_COMMISSIONS_CONTENT = {
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

function makeRequest(page: string): [NextRequest, { params: { page: string } }] {
    const request = new NextRequest(`http://localhost/api/content/${page}`, {
        method: 'GET',
    });
    return [request, { params: { page } }];
}

function makeMockRecord(page: string, content: unknown, updatedAt = new Date('2024-06-01T12:00:00Z')) {
    return { id: 'pc1', page, content, updatedAt };
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('GET /api/content/[page]', () => {
    let mockPrisma: { pageContent: { findUnique: jest.MockedFunction<any> } };

    beforeEach(async () => {
        jest.clearAllMocks();
        const prismaMod = await import('@/lib/database/prisma');
        mockPrisma = (prismaMod as any).default;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // -----------------------------------------------------------------------
    // Page parameter validation
    // -----------------------------------------------------------------------
    describe('Page parameter validation', () => {
        it('should return 400 for an unknown page', async () => {
            const [req, ctx] = makeRequest('settings');
            const response = await GET(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error).toMatch(/invalid page/i);
        });

        it('should return 400 for empty string page', async () => {
            const [req, ctx] = makeRequest('');
            const response = await GET(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
        });

        it('should return 400 for a SQL-injection-style page value', async () => {
            const [req, ctx] = makeRequest("homepage'; DROP TABLE");
            const response = await GET(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
        });

        it('should accept "homepage" as a valid page', async () => {
            mockPrisma.pageContent.findUnique.mockResolvedValue(
                makeMockRecord('homepage', SAMPLE_HOMEPAGE_CONTENT)
            );

            const [req, ctx] = makeRequest('homepage');
            const response = await GET(req, ctx);

            expect(response.status).toBe(200);
        });

        it('should accept "about" as a valid page', async () => {
            mockPrisma.pageContent.findUnique.mockResolvedValue(
                makeMockRecord('about', SAMPLE_ABOUT_CONTENT)
            );

            const [req, ctx] = makeRequest('about');
            const response = await GET(req, ctx);

            expect(response.status).toBe(200);
        });

        it('should accept "commissions" as a valid page', async () => {
            mockPrisma.pageContent.findUnique.mockResolvedValue(
                makeMockRecord('commissions', SAMPLE_COMMISSIONS_CONTENT)
            );

            const [req, ctx] = makeRequest('commissions');
            const response = await GET(req, ctx);

            expect(response.status).toBe(200);
        });
    });

    // -----------------------------------------------------------------------
    // 404 — content not found
    // -----------------------------------------------------------------------
    describe('Content not found', () => {
        it('should return 404 when no record exists for a valid page', async () => {
            mockPrisma.pageContent.findUnique.mockResolvedValue(null);

            const [req, ctx] = makeRequest('homepage');
            const response = await GET(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Page content not found.');
        });

        it('should return 404 for about page when record is missing', async () => {
            mockPrisma.pageContent.findUnique.mockResolvedValue(null);

            const [req, ctx] = makeRequest('about');
            const response = await GET(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.success).toBe(false);
        });
    });

    // -----------------------------------------------------------------------
    // Successful retrieval
    // -----------------------------------------------------------------------
    describe('Successful retrieval', () => {
        it('should return 200 with correct shape for homepage', async () => {
            const updatedAt = new Date('2024-06-01T12:00:00Z');
            mockPrisma.pageContent.findUnique.mockResolvedValue(
                makeMockRecord('homepage', SAMPLE_HOMEPAGE_CONTENT, updatedAt)
            );

            const [req, ctx] = makeRequest('homepage');
            const response = await GET(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.page).toBe('homepage');
            expect(data.content).toEqual(SAMPLE_HOMEPAGE_CONTENT);
            expect(data.updatedAt).toBe(updatedAt.toISOString());
        });

        it('should return 200 with correct shape for about', async () => {
            const updatedAt = new Date('2024-05-15T08:30:00Z');
            mockPrisma.pageContent.findUnique.mockResolvedValue(
                makeMockRecord('about', SAMPLE_ABOUT_CONTENT, updatedAt)
            );

            const [req, ctx] = makeRequest('about');
            const response = await GET(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.page).toBe('about');
            expect(data.content).toEqual(SAMPLE_ABOUT_CONTENT);
            expect(data.updatedAt).toBe(updatedAt.toISOString());
        });

        it('should return 200 with correct shape for commissions', async () => {
            const updatedAt = new Date('2024-04-10T16:00:00Z');
            mockPrisma.pageContent.findUnique.mockResolvedValue(
                makeMockRecord('commissions', SAMPLE_COMMISSIONS_CONTENT, updatedAt)
            );

            const [req, ctx] = makeRequest('commissions');
            const response = await GET(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.page).toBe('commissions');
            expect(data.content).toEqual(SAMPLE_COMMISSIONS_CONTENT);
            expect(data.updatedAt).toBe(updatedAt.toISOString());
        });

        it('should call prisma.pageContent.findUnique with the correct page param', async () => {
            mockPrisma.pageContent.findUnique.mockResolvedValue(
                makeMockRecord('about', SAMPLE_ABOUT_CONTENT)
            );

            const [req, ctx] = makeRequest('about');
            await GET(req, ctx);

            expect(mockPrisma.pageContent.findUnique).toHaveBeenCalledWith({
                where: { page: 'about' },
            });
        });

        it('should serialize updatedAt as an ISO 8601 string', async () => {
            const updatedAt = new Date('2024-01-01T00:00:00.000Z');
            mockPrisma.pageContent.findUnique.mockResolvedValue(
                makeMockRecord('homepage', SAMPLE_HOMEPAGE_CONTENT, updatedAt)
            );

            const [req, ctx] = makeRequest('homepage');
            const response = await GET(req, ctx);
            const data = await response.json();

            expect(data.updatedAt).toBe('2024-01-01T00:00:00.000Z');
        });
    });

    // -----------------------------------------------------------------------
    // Database error handling
    // -----------------------------------------------------------------------
    describe('Database error handling', () => {
        it('should return 500 when prisma findUnique throws', async () => {
            mockPrisma.pageContent.findUnique.mockRejectedValue(
                new Error('DB connection refused')
            );

            const [req, ctx] = makeRequest('homepage');
            const response = await GET(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.error).toBeTruthy();
        });

        it('should include error message in 500 response', async () => {
            mockPrisma.pageContent.findUnique.mockRejectedValue(
                new Error('Timeout exceeded')
            );

            const [req, ctx] = makeRequest('commissions');
            const response = await GET(req, ctx);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toContain('Timeout exceeded');
        });
    });
});

// ---------------------------------------------------------------------------
// Method-not-allowed handlers
// ---------------------------------------------------------------------------

describe('Non-GET methods on /api/content/[page]', () => {
    it('POST should return 405', async () => {
        const response = await POST();
        const data = await response.json();

        expect(response.status).toBe(405);
        expect(data.success).toBe(false);
        expect(data.error).toContain('Method not allowed');
    });

    it('PUT should return 405', async () => {
        const response = await PUT();
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

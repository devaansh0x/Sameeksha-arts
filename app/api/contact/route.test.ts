/**
 * Tests for Contact Form API Endpoint
 * POST /api/contact
 *
 * Covers: validation errors, honeypot rejection (fake success),
 * successful inquiry creation, and email send attempt.
 *
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6
 */

import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Mocks — must be declared before importing the module under test
// ---------------------------------------------------------------------------

// Mock Prisma singleton
jest.mock('@/lib/prisma', () => ({
    __esModule: true,
    default: {
        inquiry: {
            create: jest.fn(),
        },
    },
}));

// Mock nodemailer so we never hit real SMTP in tests
jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn<() => Promise<{ messageId: string }>>().mockResolvedValue({ messageId: 'test-id' }),
    }),
}));

// Import after mocks are set up
import { POST, GET, PUT, DELETE } from './route';
import prismaDefault from '@/lib/database/prisma';
import nodemailer from 'nodemailer';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Cast the Prisma mock to the correct type for per-test overrides. */
const mockPrisma = prismaDefault as jest.Mocked<typeof prismaDefault>;

/** Build a well-formed NextRequest with a JSON body. */
function makeRequest(body: unknown): NextRequest {
    return new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

/** Valid contact form payload (all required fields). */
const validPayload = {
    name: 'Alice Smith',
    email: 'alice@example.com',
    subject: 'Commission enquiry',
    message: 'I would love to commission a portrait of my family.',
};

// ---------------------------------------------------------------------------
// Test suites
// ---------------------------------------------------------------------------

describe('POST /api/contact', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // -----------------------------------------------------------------------
    // Validation errors (Requirement 8.3, 8.6)
    // -----------------------------------------------------------------------

    describe('Validation errors', () => {
        it('should return 400 when the request body is not valid JSON', async () => {
            const request = new NextRequest('http://localhost/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: 'not-json',
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
        });

        it('should return 400 when required fields are missing', async () => {
            const response = await POST(makeRequest({}));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toBeDefined();
            // All four required fields should report errors
            expect(data.errors).toHaveProperty('name');
            expect(data.errors).toHaveProperty('email');
            expect(data.errors).toHaveProperty('subject');
            expect(data.errors).toHaveProperty('message');
        });

        it('should return 400 with field error when email is malformed', async () => {
            const response = await POST(
                makeRequest({ ...validPayload, email: 'not-an-email' })
            );
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors?.email).toBeDefined();
        });

        it('should return 400 when name is too short (< 2 chars)', async () => {
            const response = await POST(makeRequest({ ...validPayload, name: 'A' }));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors?.name).toBeDefined();
        });

        it('should return 400 when message is too short (< 10 chars)', async () => {
            const response = await POST(makeRequest({ ...validPayload, message: 'Hi' }));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors?.message).toBeDefined();
        });

        it('should return 400 when subject is too short (< 3 chars)', async () => {
            const response = await POST(makeRequest({ ...validPayload, subject: 'Hi' }));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors?.subject).toBeDefined();
        });
    });

    // -----------------------------------------------------------------------
    // Honeypot spam prevention (Requirement 8.2 — no real record created)
    // -----------------------------------------------------------------------

    describe('Honeypot spam prevention', () => {
        it('should return fake 200 success when honeypot field is filled', async () => {
            const response = await POST(
                makeRequest({ ...validPayload, honeypot: 'i-am-a-bot' })
            );
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            // Should NOT have created a database record
            expect(mockPrisma.inquiry.create).not.toHaveBeenCalled();
        });

        it('should still process normally when honeypot field is present but empty', async () => {
            // Set up Prisma mock to return a created inquiry
            (mockPrisma.inquiry.create as jest.MockedFunction<typeof mockPrisma.inquiry.create>)
                .mockResolvedValue({
                    id: 'inq-001',
                    name: validPayload.name,
                    email: validPayload.email,
                    subject: validPayload.subject,
                    message: validPayload.message,
                    status: 'UNREAD',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });

            const response = await POST(
                makeRequest({ ...validPayload, honeypot: '' })
            );
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(mockPrisma.inquiry.create).toHaveBeenCalledTimes(1);
        });
    });

    // -----------------------------------------------------------------------
    // Successful inquiry creation (Requirements 8.2, 8.4)
    // -----------------------------------------------------------------------

    describe('Successful inquiry creation', () => {
        it('should create an Inquiry record with status UNREAD and return 200', async () => {
            (mockPrisma.inquiry.create as jest.MockedFunction<typeof mockPrisma.inquiry.create>)
                .mockResolvedValue({
                    id: 'inq-123',
                    name: validPayload.name,
                    email: validPayload.email,
                    subject: validPayload.subject,
                    message: validPayload.message,
                    status: 'UNREAD',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });

            const response = await POST(makeRequest(validPayload));
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.message).toMatch(/sent/i);
            expect(data.inquiryId).toBe('inq-123');

            // Verify the correct data was passed to Prisma
            expect(mockPrisma.inquiry.create).toHaveBeenCalledWith({
                data: {
                    name: validPayload.name,
                    email: validPayload.email,
                    subject: validPayload.subject,
                    message: validPayload.message,
                    status: 'UNREAD',
                },
            });
        });

        it('should return success confirmation message to visitor (Requirement 8.4)', async () => {
            (mockPrisma.inquiry.create as jest.MockedFunction<typeof mockPrisma.inquiry.create>)
                .mockResolvedValue({
                    id: 'inq-456',
                    name: validPayload.name,
                    email: validPayload.email,
                    subject: validPayload.subject,
                    message: validPayload.message,
                    status: 'UNREAD',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });

            const response = await POST(makeRequest(validPayload));
            const data = await response.json();

            expect(data.success).toBe(true);
            expect(typeof data.message).toBe('string');
            expect(data.message.length).toBeGreaterThan(0);
        });
    });

    // -----------------------------------------------------------------------
    // Email notification (Requirement 8.5)
    // -----------------------------------------------------------------------

    describe('Email notification', () => {
        it('should attempt to send an email when SMTP is configured', async () => {
            // Configure SMTP env vars so createTransporter returns a real mock
            const originalEnv = { ...process.env };
            process.env.SMTP_HOST = 'smtp.gmail.com';
            process.env.SMTP_PORT = '587';
            process.env.SMTP_USER = 'user@example.com';
            process.env.SMTP_PASS = 'secret';
            process.env.CONTACT_EMAIL_TO = 'artist@example.com';

            (mockPrisma.inquiry.create as jest.MockedFunction<typeof mockPrisma.inquiry.create>)
                .mockResolvedValue({
                    id: 'inq-789',
                    name: validPayload.name,
                    email: validPayload.email,
                    subject: validPayload.subject,
                    message: validPayload.message,
                    status: 'UNREAD',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });

            const response = await POST(makeRequest(validPayload));
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);

            // Verify nodemailer was asked to create a transporter
            expect(nodemailer.createTransport).toHaveBeenCalled();

            // Restore env
            process.env = originalEnv;
        });

        it('should still return 200 success even if email sending fails', async () => {
            // Configure SMTP so the transporter is created
            const originalEnv = { ...process.env };
            process.env.SMTP_HOST = 'smtp.gmail.com';
            process.env.SMTP_PORT = '587';
            process.env.SMTP_USER = 'user@example.com';
            process.env.SMTP_PASS = 'secret';
            process.env.CONTACT_EMAIL_TO = 'artist@example.com';

            // Make sendMail throw an error
            const mockSendMail = jest.fn<() => Promise<never>>().mockRejectedValue(
                new Error('SMTP connection refused')
            );
            (nodemailer.createTransport as jest.MockedFunction<typeof nodemailer.createTransport>)
                .mockReturnValue({ sendMail: mockSendMail } as unknown as nodemailer.Transporter);

            (mockPrisma.inquiry.create as jest.MockedFunction<typeof mockPrisma.inquiry.create>)
                .mockResolvedValue({
                    id: 'inq-err',
                    name: validPayload.name,
                    email: validPayload.email,
                    subject: validPayload.subject,
                    message: validPayload.message,
                    status: 'UNREAD',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });

            const response = await POST(makeRequest(validPayload));
            const data = await response.json();

            // Should still succeed — inquiry was created; email failure is non-fatal
            expect(response.status).toBe(200);
            expect(data.success).toBe(true);

            // Restore env
            process.env = originalEnv;
        });

        it('should succeed without sending email when SMTP is not configured', async () => {
            // Remove SMTP variables
            const originalEnv = { ...process.env };
            delete process.env.SMTP_HOST;
            delete process.env.SMTP_PORT;
            delete process.env.SMTP_USER;
            delete process.env.SMTP_PASS;

            (mockPrisma.inquiry.create as jest.MockedFunction<typeof mockPrisma.inquiry.create>)
                .mockResolvedValue({
                    id: 'inq-nosmtp',
                    name: validPayload.name,
                    email: validPayload.email,
                    subject: validPayload.subject,
                    message: validPayload.message,
                    status: 'UNREAD',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });

            const response = await POST(makeRequest(validPayload));
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);

            // Restore env
            process.env = originalEnv;
        });
    });

    // -----------------------------------------------------------------------
    // Database errors
    // -----------------------------------------------------------------------

    describe('Error handling', () => {
        it('should return 500 when the database throws an unexpected error', async () => {
            (mockPrisma.inquiry.create as jest.MockedFunction<typeof mockPrisma.inquiry.create>)
                .mockRejectedValue(new Error('Connection refused'));

            const response = await POST(makeRequest(validPayload));
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
        });
    });
});

// ---------------------------------------------------------------------------
// Non-POST methods — 405
// ---------------------------------------------------------------------------

describe('Non-POST methods on /api/contact', () => {
    it('GET should return 405', async () => {
        const response = await GET();
        const data = await response.json();
        expect(response.status).toBe(405);
        expect(data.success).toBe(false);
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

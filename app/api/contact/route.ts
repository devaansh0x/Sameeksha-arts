/**
 * Contact Form API Endpoint
 * POST /api/contact
 *
 * Public endpoint for handling contact form submissions from visitors.
 * Creates an Inquiry record in the database and sends an email notification
 * to the artist. Includes honeypot field for spam prevention.
 *
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6
 * Task: 11.1
 */

import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { contactSchema } from '@/lib/validation/validationSchemas';
import prisma from '@/lib/database/prisma';

/**
 * Build a Nodemailer transporter from environment variables.
 * Returns null if SMTP is not configured (missing required vars).
 */
function createTransporter(): nodemailer.Transporter | null {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !port || !user || !pass) {
        return null;
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // true for port 465 (SSL), false for 587 (TLS/STARTTLS)
        auth: { user, pass },
    });
}

/**
 * Build the HTML body for the email notification sent to the artist.
 */
function buildEmailHtml(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
}): string {
    // Escape HTML entities to prevent XSS in the email body
    const escape = (str: string) =>
        str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
            .replace(/\n/g, '<br>');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>New Contact Inquiry</title>
</head>
<body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #8B4513; border-bottom: 2px solid #8B4513; padding-bottom: 8px;">
    New Contact Inquiry from Sameeksha Arts Website
  </h2>

  <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
    <tr>
      <td style="padding: 8px; font-weight: bold; width: 120px; vertical-align: top;">Name:</td>
      <td style="padding: 8px;">${escape(data.name)}</td>
    </tr>
    <tr style="background-color: #f9f9f9;">
      <td style="padding: 8px; font-weight: bold; vertical-align: top;">Email:</td>
      <td style="padding: 8px;"><a href="mailto:${escape(data.email)}">${escape(data.email)}</a></td>
    </tr>
    <tr>
      <td style="padding: 8px; font-weight: bold; vertical-align: top;">Subject:</td>
      <td style="padding: 8px;">${escape(data.subject)}</td>
    </tr>
    <tr style="background-color: #f9f9f9;">
      <td style="padding: 8px; font-weight: bold; vertical-align: top;">Message:</td>
      <td style="padding: 8px;">${escape(data.message)}</td>
    </tr>
  </table>

  <p style="margin-top: 30px; color: #666; font-size: 14px;">
    This inquiry was submitted through the contact form on your website.
    You can reply directly to the sender at <a href="mailto:${escape(data.email)}">${escape(data.email)}</a>.
  </p>
</body>
</html>
  `.trim();
}

/**
 * POST /api/contact
 *
 * Accepts a contact form submission from a visitor. Validates the request body
 * using the contactSchema, silently discards honeypot-triggered requests,
 * persists the inquiry to the database, and sends an email notification.
 */
export async function POST(request: NextRequest) {
    try {
        // Parse the request JSON body
        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, message: 'Invalid request body. Please send JSON.' },
                { status: 400 }
            );
        }

        // Validate with Zod contactSchema
        const parseResult = contactSchema.safeParse(body);
        if (!parseResult.success) {
            const fieldErrors: Record<string, string> = {};
            for (const issue of parseResult.error.issues) {
                const field = issue.path[0] as string;
                if (field) {
                    fieldErrors[field] = issue.message;
                }
            }
            return NextResponse.json(
                {
                    success: false,
                    message: 'Validation failed. Please check the fields and try again.',
                    errors: fieldErrors,
                },
                { status: 400 }
            );
        }

        const { name, email, subject, message, honeypot } = parseResult.data;

        // Honeypot spam check: if the hidden field is filled, this is likely a bot.
        // Return a fake 200 success so bots do not learn that they were rejected.
        if (honeypot && honeypot.trim().length > 0) {
            return NextResponse.json(
                {
                    success: true,
                    message: 'Your message has been sent. We will get back to you soon.',
                },
                { status: 200 }
            );
        }

        // Persist the inquiry to the database with status UNREAD
        const inquiry = await prisma.inquiry.create({
            data: {
                name,
                email,
                subject,
                message,
                status: 'UNREAD',
            },
        });

        // Send email notification to the artist
        const transporter = createTransporter();
        if (!transporter) {
            // SMTP is not configured — log a warning but don't fail the request
            console.warn(
                '[Contact API] SMTP not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and CONTACT_EMAIL_TO to enable email notifications.'
            );
        } else {
            const recipientEmail = process.env.CONTACT_EMAIL_TO ?? 'sameeksha@example.com';
            try {
                await transporter.sendMail({
                    from: process.env.SMTP_USER,
                    to: recipientEmail,
                    subject: `New Contact Inquiry: ${subject}`,
                    html: buildEmailHtml({ name, email, subject, message }),
                });
            } catch (emailError) {
                // Email sending failed — log but don't fail the user's request.
                // The inquiry was already saved to the database.
                console.error('[Contact API] Failed to send email notification:', emailError);
            }
        }

        // Return success confirmation to the visitor
        return NextResponse.json(
            {
                success: true,
                message: 'Your message has been sent. We will get back to you soon.',
                inquiryId: inquiry.id,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('[Contact API] Unexpected error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'An unexpected error occurred. Please try again later.',
            },
            { status: 500 }
        );
    }
}

/**
 * Reject all non-POST methods with 405.
 */
export async function GET() {
    return NextResponse.json(
        { success: false, message: 'Method not allowed. Use POST to submit a contact inquiry.' },
        { status: 405 }
    );
}

export async function PUT() {
    return NextResponse.json(
        { success: false, message: 'Method not allowed. Use POST to submit a contact inquiry.' },
        { status: 405 }
    );
}

export async function DELETE() {
    return NextResponse.json(
        { success: false, message: 'Method not allowed. Use POST to submit a contact inquiry.' },
        { status: 405 }
    );
}

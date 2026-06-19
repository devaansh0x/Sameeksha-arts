/**
 * Shared Zod validation schemas for all data models
 * Used for both client-side and server-side validation
 */

import { z } from 'zod';

// ============================================================================
// Enums
// ============================================================================

/**
 * Availability status for artworks
 */
export const AvailabilityStatus = z.enum([
    'AVAILABLE',
    'SOLD',
    'ON_COMMISSION',
    'NOT_FOR_SALE',
]);

export type AvailabilityStatus = z.infer<typeof AvailabilityStatus>;

/**
 * Recognition types (awards, exhibitions, collaborations, press)
 */
export const RecognitionType = z.enum([
    'AWARD',
    'EXHIBITION',
    'INSTITUTIONAL_COLLABORATION',
    'PRESS',
]);

export type RecognitionType = z.infer<typeof RecognitionType>;

/**
 * Inquiry status for contact form submissions
 */
export const InquiryStatus = z.enum(['UNREAD', 'READ', 'ARCHIVED']);

export type InquiryStatus = z.infer<typeof InquiryStatus>;

// ============================================================================
// Artwork Validation
// ============================================================================

/**
 * Validation schema for creating or updating artwork
 * Validates: Requirements 10.1, 10.2, 10.7, 10.8
 */
export const artworkSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title must not exceed 200 characters'),
    slug: z
        .string()
        .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only')
        .min(1, 'Slug is required'),
    description: z
        .string()
        .min(10, 'Description must be at least 10 characters')
        .max(5000, 'Description must not exceed 5000 characters'),
    story: z
        .string()
        .max(5000, 'Story must not exceed 5000 characters')
        .optional(),
    medium: z.string().min(1, 'Medium is required').max(200, 'Medium must not exceed 200 characters'),
    dimensions: z
        .string()
        .min(1, 'Dimensions are required')
        .max(100, 'Dimensions must not exceed 100 characters'),
    year: z
        .number()
        .int('Year must be a whole number')
        .min(1900, 'Year must be 1900 or later')
        .max(new Date().getFullYear() + 1, `Year cannot be more than ${new Date().getFullYear() + 1}`),
    availabilityStatus: AvailabilityStatus,
    collectionId: z.string().cuid('Invalid collection ID').optional().nullable(),
    published: z.boolean(),
    imageIds: z
        .array(z.string().cuid('Invalid image ID'))
        .min(1, 'At least one image is required')
        .max(20, 'Maximum 20 images allowed per artwork'),
});

export type ArtworkInput = z.infer<typeof artworkSchema>;

/**
 * Partial schema for updating artwork (all fields optional except ID)
 */
export const artworkUpdateSchema = artworkSchema.partial();

export type ArtworkUpdateInput = z.infer<typeof artworkUpdateSchema>;

// ============================================================================
// Collection Validation
// ============================================================================

/**
 * Validation schema for creating or updating collections
 * Validates: Requirements 12.1, 12.2, 12.4, 12.5
 */
export const collectionSchema = z.object({
    name: z
        .string()
        .min(1, 'Collection name is required')
        .max(100, 'Collection name must not exceed 100 characters'),
    slug: z
        .string()
        .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only')
        .min(1, 'Slug is required'),
    description: z
        .string()
        .min(10, 'Description must be at least 10 characters')
        .max(2000, 'Description must not exceed 2000 characters'),
});

export type CollectionInput = z.infer<typeof collectionSchema>;

/**
 * Partial schema for updating collections
 */
export const collectionUpdateSchema = collectionSchema.partial();

export type CollectionUpdateInput = z.infer<typeof collectionUpdateSchema>;

// ============================================================================
// Recognition Validation
// ============================================================================

/**
 * Validation schema for creating or updating recognition entries
 * Validates: Requirements 13.1, 13.2, 13.4, 13.5
 */
export const recognitionSchema = z.object({
    title: z
        .string()
        .min(1, 'Title is required')
        .max(200, 'Title must not exceed 200 characters'),
    type: RecognitionType,
    date: z.coerce.date(),
    description: z
        .string()
        .min(10, 'Description must be at least 10 characters')
        .max(2000, 'Description must not exceed 2000 characters'),
    published: z.boolean().default(true),
});

export type RecognitionInput = z.infer<typeof recognitionSchema>;

/**
 * Partial schema for updating recognition entries
 */
export const recognitionUpdateSchema = recognitionSchema.partial();

export type RecognitionUpdateInput = z.infer<typeof recognitionUpdateSchema>;

// ============================================================================
// Testimonial Validation
// ============================================================================

/**
 * Validation schema for creating or updating testimonials
 * Validates: Requirements 16.1, 16.2, 16.4, 16.5
 */
export const testimonialSchema = z.object({
    clientName: z
        .string()
        .min(2, 'Client name must be at least 2 characters')
        .max(100, 'Client name must not exceed 100 characters'),
    clientTitle: z
        .string()
        .max(100, 'Client title must not exceed 100 characters')
        .optional()
        .nullable(),
    text: z
        .string()
        .min(10, 'Testimonial text must be at least 10 characters')
        .max(1000, 'Testimonial text must not exceed 1000 characters'),
    order: z.number().int('Order must be a whole number').min(0, 'Order must be 0 or greater').default(0),
    published: z.boolean().default(true),
});

export type TestimonialInput = z.infer<typeof testimonialSchema>;

/**
 * Partial schema for updating testimonials
 */
export const testimonialUpdateSchema = testimonialSchema.partial();

export type TestimonialUpdateInput = z.infer<typeof testimonialUpdateSchema>;

// ============================================================================
// Contact Form / Inquiry Validation
// ============================================================================

/**
 * Validation schema for contact form submissions
 * Validates: Requirements 8.1, 8.2, 8.3, 8.6
 */
export const contactSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must not exceed 100 characters'),
    email: z.string().email('Invalid email address').max(200, 'Email must not exceed 200 characters'),
    subject: z
        .string()
        .min(3, 'Subject must be at least 3 characters')
        .max(200, 'Subject must not exceed 200 characters'),
    message: z
        .string()
        .min(10, 'Message must be at least 10 characters')
        .max(5000, 'Message must not exceed 5000 characters'),
    honeypot: z.string().optional(), // Anti-spam field - should be empty
});

export type ContactFormInput = z.infer<typeof contactSchema>;

/**
 * Schema for updating inquiry status
 * Validates: Requirements 17.4, 17.5
 */
export const inquiryUpdateSchema = z.object({
    status: InquiryStatus,
});

export type InquiryUpdateInput = z.infer<typeof inquiryUpdateSchema>;

// ============================================================================
// Password Validation
// ============================================================================

/**
 * Validation schema for password changes
 * Validates: Requirements 29.1, 29.2, 29.3, 29.4, 29.5
 */
export const passwordChangeSchema = z
    .object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
            .regex(/[0-9]/, 'Password must contain at least one number'),
        confirmPassword: z.string().min(1, 'Please confirm your new password'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;

/**
 * Schema for initial password/login
 */
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ============================================================================
// Image Upload Validation
// ============================================================================

/**
 * Validation schema for image uploads
 * Validates: Requirements 11.1, 11.2
 */
export const imageUploadSchema = z.object({
    file: z
        .custom<File>((file) => file instanceof File, 'File is required')
        .refine((file) => file.size <= 10 * 1024 * 1024, 'File size must be less than 10MB')
        .refine(
            (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
            'Only JPEG, PNG, and WebP formats are supported'
        ),
});

export type ImageUploadInput = z.infer<typeof imageUploadSchema>;

/**
 * Schema for validating image metadata (used after upload)
 */
export const mediaAssetSchema = z.object({
    filename: z.string().min(1, 'Filename is required'),
    originalUrl: z.string().url('Invalid URL'),
    thumbnailUrl: z.string().url('Invalid URL'),
    smallUrl: z.string().url('Invalid URL'),
    mediumUrl: z.string().url('Invalid URL'),
    largeUrl: z.string().url('Invalid URL'),
    width: z.number().int().positive('Width must be positive'),
    height: z.number().int().positive('Height must be positive'),
    size: z.number().int().positive('File size must be positive'),
    mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
});

export type MediaAssetInput = z.infer<typeof mediaAssetSchema>;

// ============================================================================
// Page Content Validation
// ============================================================================

/**
 * Validation schema for homepage content
 * Validates: Requirements 15.1-15.8
 */
export const homepageContentSchema = z.object({
    hero: z.object({
        artworkId: z.string().cuid('Invalid artwork ID'),
        heading: z.string().min(1, 'Hero heading is required').max(200),
        subheading: z.string().min(1, 'Hero subheading is required').max(500),
    }),
    introduction: z.object({
        heading: z.string().min(1, 'Introduction heading is required').max(200),
        text: z.string().min(10, 'Introduction text must be at least 10 characters').max(5000),
    }),
    selectedWorks: z.object({
        artworkIds: z.array(z.string().cuid()).min(3, 'Select at least 3 artworks').max(12, 'Maximum 12 artworks'),
    }),
    artistWorld: z.object({
        heading: z.string().min(1, 'Artist world heading is required').max(200),
        text: z.string().min(10, 'Artist world text must be at least 10 characters').max(5000),
        imageUrl: z.string().url('Invalid image URL').optional().nullable(),
    }),
    commissionInvitation: z.object({
        heading: z.string().min(1, 'Commission invitation heading is required').max(200),
        text: z.string().min(10, 'Commission invitation text must be at least 10 characters').max(2000),
    }),
    contactInvitation: z.object({
        heading: z.string().min(1, 'Contact invitation heading is required').max(200),
        text: z.string().min(10, 'Contact invitation text must be at least 10 characters').max(2000),
    }),
});

export type HomepageContentInput = z.infer<typeof homepageContentSchema>;

/**
 * Validation schema for about page content
 * Validates: Requirements 14.1-14.5
 */
export const aboutContentSchema = z.object({
    biography: z.object({
        text: z.string().min(50, 'Biography must be at least 50 characters').max(10000),
        portraitUrl: z.string().url('Invalid portrait URL').optional().nullable(),
    }),
    philosophy: z.object({
        heading: z.string().min(1, 'Philosophy heading is required').max(200),
        text: z.string().min(50, 'Philosophy text must be at least 50 characters').max(5000),
    }),
    studio: z.object({
        heading: z.string().min(1, 'Studio heading is required').max(200),
        text: z.string().min(50, 'Studio text must be at least 50 characters').max(5000),
        imageUrl: z.string().url('Invalid image URL').optional().nullable(),
    }),
});

export type AboutContentInput = z.infer<typeof aboutContentSchema>;

/**
 * Validation schema for commission page content
 * Validates: Requirements 19.1-19.7
 */
export const commissionContentSchema = z.object({
    process: z.object({
        heading: z.string().min(1, 'Process heading is required').max(200),
        steps: z
            .array(
                z.object({
                    title: z.string().min(1, 'Step title is required').max(100),
                    description: z.string().min(10, 'Step description must be at least 10 characters').max(500),
                })
            )
            .min(1, 'At least one process step is required')
            .max(10, 'Maximum 10 process steps'),
    }),
    examples: z.object({
        artworkIds: z.array(z.string().cuid()).min(2, 'Select at least 2 commission examples').max(8),
    }),
    stories: z
        .array(
            z.object({
                id: z.string().cuid(),
                title: z.string().min(1, 'Story title is required').max(200),
                text: z.string().min(50, 'Story text must be at least 50 characters').max(2000),
            })
        )
        .max(10, 'Maximum 10 commission stories'),
    invitation: z.object({
        heading: z.string().min(1, 'Invitation heading is required').max(200),
        text: z.string().min(10, 'Invitation text must be at least 10 characters').max(2000),
    }),
});

export type CommissionContentInput = z.infer<typeof commissionContentSchema>;

// ============================================================================
// Bulk Operations Validation
// ============================================================================

/**
 * Schema for bulk update operations
 * Validates: Requirement 27.2
 */
export const bulkUpdateArtworkStatusSchema = z.object({
    artworkIds: z.array(z.string().cuid()).min(1, 'Select at least one artwork'),
    availabilityStatus: AvailabilityStatus,
});

export type BulkUpdateArtworkStatusInput = z.infer<typeof bulkUpdateArtworkStatusSchema>;

/**
 * Schema for bulk delete operations
 * Validates: Requirements 27.2, 27.4
 */
export const bulkDeleteSchema = z.object({
    ids: z.array(z.string().cuid()).min(1, 'Select at least one item to delete'),
});

export type BulkDeleteInput = z.infer<typeof bulkDeleteSchema>;

# Validation Schemas

This file contains shared Zod validation schemas for all data models in the Sameeksha Arts Website.

## Overview

The `validationSchemas.ts` file provides type-safe validation for:
- Artwork records
- Collections
- Recognition entries
- Testimonials
- Contact form submissions
- User authentication
- Image uploads
- Page content (Homepage, About, Commissions)

## Usage

### Basic Validation

```typescript
import { artworkSchema } from '@/lib/validationSchemas';

// Validate data
const result = artworkSchema.safeParse(data);

if (result.success) {
  // Data is valid, use result.data
  const validatedArtwork = result.data;
} else {
  // Data is invalid, show errors
  console.error(result.error.issues);
}
```

### Using with React Hook Form

```typescript
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { artworkSchema, type ArtworkInput } from '@/lib/validationSchemas';

function ArtworkForm() {
  const form = useForm<ArtworkInput>({
    resolver: zodResolver(artworkSchema),
  });

  const onSubmit = (data: ArtworkInput) => {
    // Data is already validated
    console.log(data);
  };

  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
}
```

### Using in API Routes

```typescript
import { artworkSchema } from '@/lib/validationSchemas';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Validate input
  const validation = artworkSchema.safeParse(body);
  
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: validation.error.issues },
      { status: 400 }
    );
  }
  
  // Use validated data
  const artwork = validation.data;
  // ... save to database
}
```

## Available Schemas

### Artwork

- `artworkSchema` - Full validation for creating artwork
- `artworkUpdateSchema` - Partial validation for updating artwork

**Fields:**
- `title` (string, 1-200 chars, required)
- `slug` (string, lowercase with hyphens, required)
- `description` (string, 10-5000 chars, required)
- `story` (string, optional, max 5000 chars)
- `medium` (string, 1-200 chars, required)
- `dimensions` (string, 1-100 chars, required)
- `year` (number, 1900-current year+1, required)
- `availabilityStatus` (enum: AVAILABLE, SOLD, ON_COMMISSION, NOT_FOR_SALE)
- `collectionId` (string CUID, optional)
- `published` (boolean, required)
- `imageIds` (array of CUIDs, 1-20 items, required)

### Collection

- `collectionSchema` - Full validation for creating collections
- `collectionUpdateSchema` - Partial validation for updating collections

**Fields:**
- `name` (string, 1-100 chars, required)
- `slug` (string, lowercase with hyphens, required)
- `description` (string, 10-2000 chars, required)

### Recognition

- `recognitionSchema` - Full validation for recognition entries
- `recognitionUpdateSchema` - Partial validation for updating recognition

**Fields:**
- `title` (string, 1-200 chars, required)
- `type` (enum: AWARD, EXHIBITION, INSTITUTIONAL_COLLABORATION, PRESS)
- `date` (date, required)
- `description` (string, 10-2000 chars, required)
- `published` (boolean, default true)

### Testimonial

- `testimonialSchema` - Full validation for testimonials
- `testimonialUpdateSchema` - Partial validation for updating testimonials

**Fields:**
- `clientName` (string, 2-100 chars, required)
- `clientTitle` (string, optional, max 100 chars)
- `text` (string, 10-1000 chars, required)
- `order` (number, default 0)
- `published` (boolean, default true)

### Contact Form

- `contactSchema` - Validation for contact form submissions
- `inquiryUpdateSchema` - Validation for updating inquiry status

**Contact Fields:**
- `name` (string, 2-100 chars, required)
- `email` (email format, required)
- `subject` (string, 3-200 chars, required)
- `message` (string, 10-5000 chars, required)
- `honeypot` (string, optional - anti-spam field)

### Authentication

- `loginSchema` - Validation for login credentials
- `passwordChangeSchema` - Validation for password changes

**Password Change Fields:**
- `currentPassword` (string, required)
- `newPassword` (string, min 8 chars, must contain uppercase, lowercase, and number)
- `confirmPassword` (string, must match newPassword)

### Image Upload

- `imageUploadSchema` - Validation for image file uploads
- `mediaAssetSchema` - Validation for media metadata

**Image Upload Requirements:**
- File size: Max 10MB
- Formats: JPEG, PNG, WebP only

### Page Content

- `homepageContentSchema` - Validation for homepage content structure
- `aboutContentSchema` - Validation for about page content
- `commissionContentSchema` - Validation for commissions page content

These schemas validate complex nested JSON structures for page content.

## TypeScript Types

All schemas export corresponding TypeScript types:

```typescript
import type {
  ArtworkInput,
  CollectionInput,
  RecognitionInput,
  TestimonialInput,
  ContactFormInput,
  PasswordChangeInput,
  // ... and more
} from '@/lib/validationSchemas';
```

## Enums

The following enums are exported:

```typescript
import {
  AvailabilityStatus,
  RecognitionType,
  InquiryStatus,
} from '@/lib/validationSchemas';

// Usage
const status: AvailabilityStatus = 'AVAILABLE';
```

## Requirements Mapping

Each schema validates specific requirements from the design document:

- **Artwork**: Requirements 10.1, 10.2, 10.7, 10.8
- **Collection**: Requirements 12.1, 12.2, 12.4, 12.5
- **Recognition**: Requirements 13.1, 13.2, 13.4, 13.5
- **Testimonial**: Requirements 16.1, 16.2, 16.4, 16.5
- **Contact**: Requirements 8.1, 8.2, 8.3, 8.6
- **Password**: Requirements 29.1, 29.2, 29.3, 29.4, 29.5
- **Image Upload**: Requirements 11.1, 11.2
- **Page Content**: Requirements 14.1-14.5, 15.1-15.8, 19.1-19.7

## Notes

- All schemas use Zod v3.x
- CUIDs are validated using the `.cuid()` method
- Email validation uses Zod's built-in `.email()` validator
- Date fields use `.coerce.date()` for flexible date parsing
- String lengths are enforced to prevent database overflow
- Regular expressions validate slug format (lowercase, numbers, hyphens only)

# Image Processing Service

This module provides comprehensive image processing capabilities using Sharp, following the design specifications for the Sameeksha Arts Website.

## Features

- **Image Validation**: Validates file size and format (JPEG, PNG, WebP only)
- **Metadata Extraction**: Extracts width, height, format, and other metadata
- **Responsive Sizing**: Generates multiple sizes (thumbnail: 150px, small: 480px, medium: 1024px, large: 1920px, original)
- **Format Conversion**: Converts between JPEG, PNG, and WebP formats
- **WebP Generation**: Creates WebP versions with JPEG fallback for browser compatibility
- **Optimization**: Compresses images while maintaining quality
- **Blur Placeholder**: Generates tiny blurred images for progressive loading
- **Auto-rotation**: Handles EXIF orientation for correct display

## Usage Examples

### Basic Image Validation

```typescript
import { validateImageBuffer } from '@/lib/imageProcessing';

// Validate an image buffer
const validation = await validateImageBuffer(buffer, 'image/jpeg');
if (!validation.isValid) {
    console.error(validation.error);
}
```

### Extract Image Metadata

```typescript
import { extractMetadata } from '@/lib/imageProcessing';

const metadata = await extractMetadata(buffer);
console.log(metadata);
// {
//   width: 2000,
//   height: 1500,
//   format: 'jpeg',
//   size: 523842,
//   hasAlpha: false
// }
```

### Resize Image

```typescript
import { resizeImage } from '@/lib/imageProcessing';

// Resize to 800px width, maintaining aspect ratio
const resized = await resizeImage(buffer, 800, 'jpeg', 80);
console.log(`Resized to ${resized.width}x${resized.height}`);
```

### Generate All Responsive Sizes

```typescript
import { generateResponsiveSizes } from '@/lib/imageProcessing';

// Generate thumbnail, small, medium, large, and original sizes
const sizes = await generateResponsiveSizes(buffer, 'jpeg');

console.log(`Thumbnail: ${sizes.thumbnail.width}x${sizes.thumbnail.height}`);
console.log(`Small: ${sizes.small.width}x${sizes.small.height}`);
console.log(`Medium: ${sizes.medium.width}x${sizes.medium.height}`);
console.log(`Large: ${sizes.large.width}x${sizes.large.height}`);
console.log(`Original: ${sizes.original.width}x${sizes.original.height}`);
```

### Generate WebP with JPEG Fallback

```typescript
import { generateWebPWithFallback } from '@/lib/imageProcessing';

// Generate both WebP and JPEG versions at 1024px width
const images = await generateWebPWithFallback(buffer, 1024);

console.log(`WebP: ${images.webp.size} bytes`);
console.log(`JPEG: ${images.jpeg.size} bytes`);
```

### Complete Upload Processing Pipeline

```typescript
import { processImageForUpload } from '@/lib/imageProcessing';

// Process image for upload - validates, generates all sizes in both formats
const result = await processImageForUpload(buffer, 'image/jpeg');

if (!result.isValid) {
    console.error(result.error);
    return;
}

// Access processed images
console.log('Metadata:', result.metadata);
console.log('JPEG sizes:', result.jpeg);
console.log('WebP sizes:', result.webp);
console.log('Blur placeholder:', result.blurPlaceholder);

// Now upload to CDN (Cloudinary)
// You would upload result.jpeg.thumbnail.buffer, result.jpeg.small.buffer, etc.
```

### Generate Blur Placeholder

```typescript
import { generateBlurPlaceholder } from '@/lib/imageProcessing';

// Generate tiny blurred version for progressive loading
const placeholder = await generateBlurPlaceholder(buffer);
console.log(`Placeholder size: ${placeholder.size} bytes`);
```

### Optimize Image Without Resizing

```typescript
import { optimizeImage } from '@/lib/imageProcessing';

// Optimize image maintaining original dimensions
const optimized = await optimizeImage(buffer, 'jpeg', 75);
console.log(`Original: ${buffer.length} bytes`);
console.log(`Optimized: ${optimized.size} bytes`);
```

### Auto-rotate Based on EXIF

```typescript
import { autoRotate } from '@/lib/imageProcessing';

// Automatically rotate based on EXIF orientation
const rotatedBuffer = await autoRotate(buffer);
```

### Calculate Optimal Quality

```typescript
import { calculateOptimalQuality } from '@/lib/imageProcessing';

// Get recommended quality based on image size
const quality = calculateOptimalQuality(2000, 1500);
console.log(`Recommended quality: ${quality}`);
```

## Integration with Upload API

Here's how to use the image processing service in an API route:

```typescript
// app/api/admin/media/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { processImageForUpload } from '@/lib/imageProcessing';
import cloudinary from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        
        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file provided' },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Process image with Sharp
        const processed = await processImageForUpload(buffer, file.type);

        if (!processed.isValid) {
            return NextResponse.json(
                { success: false, error: processed.error },
                { status: 400 }
            );
        }

        // Upload processed images to Cloudinary
        // Upload JPEG versions
        const uploadPromises = [];
        
        if (processed.jpeg) {
            uploadPromises.push(
                uploadToCloudinary(processed.jpeg.thumbnail.buffer, 'thumbnail'),
                uploadToCloudinary(processed.jpeg.small.buffer, 'small'),
                uploadToCloudinary(processed.jpeg.medium.buffer, 'medium'),
                uploadToCloudinary(processed.jpeg.large.buffer, 'large'),
                uploadToCloudinary(processed.jpeg.original.buffer, 'original')
            );
        }

        const uploadedUrls = await Promise.all(uploadPromises);

        return NextResponse.json({
            success: true,
            metadata: processed.metadata,
            urls: uploadedUrls
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to process image' },
            { status: 500 }
        );
    }
}
```

## Performance Considerations

- **Parallel Processing**: The service processes multiple sizes in parallel using `Promise.all()` for better performance
- **Memory Efficiency**: Sharp is highly optimized and uses streaming where possible
- **Quality Settings**: Different quality levels are used based on image size:
  - Thumbnail: 85% quality
  - Small: 80% quality
  - Medium: 80% quality
  - Large: 75% quality
  - Original: 90% quality

## Error Handling

All functions throw descriptive errors that can be caught and handled:

```typescript
try {
    const result = await resizeImage(buffer, 800, 'jpeg');
} catch (error) {
    console.error('Failed to resize image:', error.message);
}
```

Validation functions return result objects with `isValid` and optional `error` properties:

```typescript
const validation = await validateImageBuffer(buffer, mimeType);
if (!validation.isValid) {
    // Handle validation error
    console.error(validation.error);
}
```

## Image Size Specifications

From `lib/cloudinary.ts`:

```typescript
export const IMAGE_SIZES = {
    thumbnail: 150,  // Grid thumbnails
    small: 480,      // Mobile displays
    medium: 1024,    // Tablet displays
    large: 1920,     // Desktop displays
} as const;
```

## Supported Formats

- **JPEG**: Best for photographs, progressive encoding enabled
- **PNG**: Best for images with transparency, high compression
- **WebP**: Modern format with excellent compression, generated with fallback

## File Size Limits

- Maximum file size: **10MB** (as per requirements)
- Constraint defined in: `lib/cloudinary.ts`

## Testing

The service includes comprehensive unit tests covering:
- Image validation (format and size)
- Metadata extraction
- Resizing operations
- Format conversion
- Responsive size generation
- WebP generation with JPEG fallback
- Blur placeholder generation
- Complete upload pipeline
- Edge cases (small images, large images, different aspect ratios)

Run tests with:
```bash
npm test -- lib/imageProcessing.test.ts
```

## Requirements Mapping

This service implements the following requirements:

- **Requirement 11.1**: Image upload validation (JPEG, PNG, WebP)
- **Requirement 11.2**: File format validation with error messages
- **Requirement 11.3**: Image optimization for web display within 10 seconds
- **Requirement 11.4**: Multiple responsive sizes generation
- **Requirement 22.3**: Optimized images for device size
- **Requirement 22.4**: Image optimization for performance

## Design Document Reference

From `design.md`:

> **Image Optimization Pipeline:**
> - Upload → Sharp processing → Generate sizes (thumb: 150px, small: 480px, medium: 1024px, large: 1920px, original)
> - WebP generation with JPEG fallback
> - Automatic alt text from artwork metadata
> - Lazy loading with blur-up placeholders


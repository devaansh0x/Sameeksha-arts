# Media Storage Architecture

This document describes the media storage and CDN architecture for the Sameeksha Arts Website.

## Overview

The media storage system is built on **Cloudinary**, a cloud-based image and video management solution that provides:

- **Secure Storage**: Cloud storage for all artwork images and media assets
- **Global CDN**: Fast content delivery through Cloudinary's worldwide CDN network
- **Automatic Optimization**: On-the-fly image transformation, format conversion, and quality optimization
- **Responsive Images**: Multiple image sizes generated automatically for different devices

## Architecture Components

### 1. Cloudinary SDK Integration

**Location**: `lib/cloudinary.ts`

The Cloudinary SDK is configured and provides:
- Authenticated connection to Cloudinary API
- Image upload capabilities
- URL generation for responsive images
- Image deletion and management
- Validation utilities

### 2. Environment Configuration

**Files**:
- `.env.local` - Local development configuration (not committed to Git)
- `.env.example` - Template with placeholder values (committed to Git)

**Required Variables**:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### 3. Type Definitions

**Location**: `types/media.ts`

Provides TypeScript interfaces for:
- Media assets stored in database
- Cloudinary upload results
- Responsive image URLs
- Image validation
- Media library operations

### 4. Configuration Verification

**Location**: `lib/config-check.ts`

Utility to verify that all environment variables are properly configured. Automatically runs in development mode and provides clear feedback about:
- Missing configuration
- Placeholder values that need to be replaced
- Configuration status for all systems (Cloudinary, database, auth, email)

### 5. Test Script

**Location**: `scripts/test-cloudinary.ts`

Comprehensive test script to verify Cloudinary setup:
- Tests API connectivity
- Checks account usage and limits
- Verifies folder structure
- Lists existing resources

**Run with**: `npm run test:cloudinary`

## Image Processing Pipeline

### Upload Flow

```
User uploads image
       ↓
Validate file (type, size)
       ↓
Upload to Cloudinary
       ↓
Cloudinary generates multiple sizes:
  - Thumbnail: 150px
  - Small: 480px
  - Medium: 1024px
  - Large: 1920px
  - Original: full resolution
       ↓
Store URLs in database (MediaAsset)
       ↓
Return asset record to client
```

### Delivery Flow

```
Request image from public gallery
       ↓
Generate appropriate URL with transformations
       ↓
Cloudinary CDN serves optimized image:
  - Automatic format (WebP for modern browsers, JPEG fallback)
  - Automatic quality optimization
  - Proper size for device/viewport
       ↓
Browser caches image
```

## Image Sizes and Transformations

### Standard Sizes

| Size Name | Width | Use Case |
|-----------|-------|----------|
| Thumbnail | 150px | Grid previews, thumbnails |
| Small | 480px | Mobile devices |
| Medium | 1024px | Tablets, small desktop |
| Large | 1920px | Large desktop displays |
| Original | Full | Maximum quality, downloads |

### Automatic Optimizations

All image URLs include:
- `f_auto` - Automatic format selection (WebP, JPEG, PNG)
- `q_auto` - Automatic quality optimization
- Proper width for viewport
- Lazy loading support
- Blur placeholder generation

### URL Structure

Cloudinary URLs follow this pattern:
```
https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}
```

Example:
```
https://res.cloudinary.com/demo/image/upload/w_1024,f_auto,q_auto/sameeksha-arts/artwork/portrait-123
```

## Folder Organization

Images are organized in Cloudinary using the following structure:

```
sameeksha-arts/
├── artwork/
│   ├── portrait-001
│   ├── landscape-002
│   └── ...
├── portraits/
│   ├── artist-photo
│   └── studio-photo
└── general/
    ├── homepage-hero
    └── about-image
```

**Folder Constants**: Defined in `lib/cloudinary.ts` as `CLOUDINARY_FOLDERS`

## API Integration

### Future API Endpoints

When implementing Task 4.3 (media upload API), the following endpoints will be created:

**POST /api/admin/media/upload**
- Accepts multipart/form-data with image file
- Validates file type and size
- Uploads to Cloudinary
- Stores MediaAsset record in database
- Returns asset with all generated URLs

**DELETE /api/admin/media/[id]**
- Deletes image from Cloudinary
- Removes MediaAsset record from database
- Checks for usage in artworks (warning if in use)

**GET /api/admin/media**
- Lists all media assets
- Supports search and filtering
- Returns paginated results

## Database Schema

### MediaAsset Model

```prisma
model MediaAsset {
  id            String         @id @default(cuid())
  filename      String
  originalUrl   String         // Full resolution URL
  thumbnailUrl  String         // 150px
  smallUrl      String         // 480px
  mediumUrl     String         // 1024px
  largeUrl      String         // 1920px
  width         Int
  height        Int
  size          Int            // bytes
  mimeType      String
  uploadedAt    DateTime       @default(now())
  artworkImages ArtworkImage[]
  
  @@index([uploadedAt])
}
```

## Security Considerations

### Environment Variables

- **API Secret**: Kept server-side only, never exposed to client
- **HTTPS**: All URLs use secure HTTPS protocol
- **Authentication**: Upload endpoints protected with authentication
- **Validation**: All uploads validated for type and size

### File Upload Security

- **MIME Type Validation**: Only JPEG, PNG, WebP allowed
- **File Size Limit**: Maximum 10MB per file
- **Filename Sanitization**: Safe filenames generated by Cloudinary
- **Access Control**: Upload endpoints require authentication

## Performance Optimizations

### CDN Caching

- Images cached at edge locations worldwide
- Fast delivery regardless of user location
- Automatic cache invalidation on updates

### Image Optimization

- WebP format for 25-35% smaller file sizes
- Automatic quality adjustment
- Lazy loading for below-fold images
- Blur placeholders for progressive loading

### Responsive Images

- Appropriate size served based on viewport
- `srcset` and `sizes` attributes for HTML images
- Device pixel ratio support (Retina displays)

## Utility Functions

### Core Functions

**`getResponsiveImageUrls(publicId, sizes?)`**
- Generates URLs for all image sizes
- Returns object with thumbnail, small, medium, large, original URLs
- Includes automatic format and quality optimization

**`getWebPWithFallback(publicId, width?)`**
- Generates both WebP and JPEG URLs
- Used for `<picture>` elements with fallback

**`getBlurPlaceholder(publicId)`**
- Generates tiny, blurred placeholder for progressive loading
- Used with Next.js Image component

**`validateImageFile(file)`**
- Validates file type and size
- Returns validation result with error message if invalid

**`deleteImage(publicId)`**
- Deletes image from Cloudinary
- Returns deletion result

## Usage Examples

### Upload Image to Cloudinary (Server-Side)

```typescript
import cloudinary from '@/lib/cloudinary';
import { CLOUDINARY_FOLDERS } from '@/lib/cloudinary';

const result = await cloudinary.uploader.upload(fileDataUrl, {
  folder: CLOUDINARY_FOLDERS.artwork,
  transformation: [
    { width: 1920, crop: 'limit' },
    { quality: 'auto' },
    { fetch_format: 'auto' }
  ]
});

// result.public_id - Use this to generate URLs
// result.secure_url - Direct URL to image
```

### Generate Responsive URLs

```typescript
import { getResponsiveImageUrls } from '@/lib/cloudinary';

const urls = getResponsiveImageUrls('sameeksha-arts/artwork/portrait-123');

// Use in Next.js Image component
<Image
  src={urls.large}
  alt="Artwork title"
  width={1920}
  height={1080}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

### Validate File Before Upload

```typescript
import { validateImageFile } from '@/lib/cloudinary';

const validation = validateImageFile(file);

if (!validation.isValid) {
  // Show error to user
  alert(validation.error);
  return;
}

// Proceed with upload
```

## Testing

### Manual Testing

1. **Configuration Test**:
   ```bash
   npm run test:cloudinary
   ```
   This verifies your Cloudinary credentials and connection.

2. **Upload Test** (after implementing API endpoint):
   - Use Postman or similar tool to POST to `/api/admin/media/upload`
   - Verify image appears in Cloudinary dashboard
   - Check that all size URLs are generated correctly

3. **Delivery Test**:
   - Open any generated image URL in browser
   - Verify image loads correctly
   - Check browser developer tools for:
     - Correct content-type (image/webp for modern browsers)
     - Cache headers
     - Compression

### Automated Testing

When implementing tests for the media upload system:

```typescript
// Example test structure
describe('Media Upload', () => {
  it('should validate file type', () => {
    const pdfFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    const result = validateImageFile(pdfFile);
    expect(result.isValid).toBe(false);
  });
  
  it('should validate file size', () => {
    // Test with file > 10MB
  });
  
  it('should upload to Cloudinary and return URLs', async () => {
    // Mock Cloudinary upload
    // Test URL generation
  });
});
```

## Monitoring and Maintenance

### Usage Monitoring

- Check Cloudinary dashboard regularly for usage stats
- Monitor storage and bandwidth limits
- Review transformation credits usage

### Cleanup

- Implement periodic cleanup of unused media assets
- Remove orphaned images (not associated with any artwork)
- Archive old images if needed

### Cost Management

Cloudinary free tier includes:
- 25GB storage
- 25GB monthly bandwidth
- 25 monthly transformation credits

For production:
- Monitor usage trends
- Optimize image sizes and transformations
- Consider paid plan for higher traffic

## Troubleshooting

### Common Issues

**Images not loading**
- Check environment variables are set correctly
- Verify Cloudinary cloud name in URLs
- Check browser console for CORS errors

**Upload failures**
- Verify API credentials are correct
- Check file size and format
- Review Cloudinary dashboard for error messages

**Slow loading**
- Ensure proper image sizes are being used
- Verify CDN caching is working
- Check transformation parameters

### Debug Tools

1. **Config Check**: Run automatic configuration verification
2. **Test Script**: Use `npm run test:cloudinary` to verify setup
3. **Cloudinary Dashboard**: Review uploads, transformations, and errors
4. **Browser DevTools**: Inspect network requests and responses

## Next Steps

After completing this task (4.1):

1. **Task 4.2**: Create image processing service with Sharp
   - Local image processing if needed
   - Additional optimizations before upload

2. **Task 4.3**: Create media upload API endpoint
   - Implement POST /api/admin/media/upload
   - Integrate with database
   - Test end-to-end upload flow

3. **Phase 5**: Build Artist Dashboard image upload UI
   - ImageUploader component
   - ImageGalleryEditor component
   - Media library interface

## References

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Next.js Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)
- [Responsive Images Guide](https://web.dev/responsive-images/)
- Design Document: `docs/design.md`
- Setup Guide: `docs/CLOUDINARY_SETUP.md`

# Cloudinary Setup Guide

This document provides instructions for setting up Cloudinary for media storage and CDN delivery in the Sameeksha Arts Website.

## Overview

Cloudinary is used for:
- **Media Storage**: Secure cloud storage for all artwork images
- **CDN Delivery**: Fast, global content delivery network for images
- **Automatic Transformations**: On-the-fly image resizing, format conversion, and optimization
- **Responsive Images**: Multiple image sizes generated automatically

## Getting Started

### 1. Create a Cloudinary Account

1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Sign up for a free account (includes 25GB storage and 25GB monthly bandwidth)
3. Verify your email address

### 2. Get Your Credentials

After signing in:

1. Go to your **Dashboard** (default landing page)
2. You'll see your **Account Details** section with:
   - **Cloud Name**: Your unique Cloudinary identifier
   - **API Key**: Public API key for authentication
   - **API Secret**: Secret key for secure operations (keep this private!)

### 3. Configure Environment Variables

1. Open `.env.local` in the project root
2. Replace the placeholder values with your actual credentials:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret

# Public configuration for client-side access (if needed)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
```

**Important**: 
- Never commit `.env.local` to version control
- Keep your API Secret confidential
- The `.env.example` file is for reference only

### 4. Verify Configuration

To verify your Cloudinary setup is working:

1. Start the development server: `npm run dev`
2. Check the console for any Cloudinary configuration warnings
3. Try uploading an image through the Artist Dashboard (once implemented)

## Features

### Automatic Image Optimization

Cloudinary automatically:
- Converts images to optimal formats (WebP for modern browsers, JPEG fallback)
- Compresses images without visible quality loss
- Generates responsive sizes for different devices
- Creates blur placeholders for progressive loading

### Image Sizes

The following image sizes are generated for each upload:

- **Thumbnail**: 150px wide - for grid previews
- **Small**: 480px wide - for mobile devices
- **Medium**: 1024px wide - for tablets and small desktops
- **Large**: 1920px wide - for large desktop displays
- **Original**: Full resolution - preserved for highest quality

### CDN Delivery

All images are delivered through Cloudinary's global CDN with:
- Automatic caching at edge locations worldwide
- Fast load times regardless of user location
- HTTPS by default for security
- Automatic format and quality optimization

### Folder Structure

Images are organized in Cloudinary using the following folder structure:

```
sameeksha-arts/
├── artwork/        # Artwork images
├── portraits/      # Artist portraits and studio images
└── general/        # General content images
```

## Usage Examples

### Getting Responsive Image URLs

```typescript
import { getResponsiveImageUrls } from '@/lib/cloudinary';

const urls = getResponsiveImageUrls('sameeksha-arts/artwork/portrait-123');

// Returns:
// {
//   thumbnail: 'https://res.cloudinary.com/.../w_150,f_auto,q_auto/...',
//   small: 'https://res.cloudinary.com/.../w_480,f_auto,q_auto/...',
//   medium: 'https://res.cloudinary.com/.../w_1024,f_auto,q_auto/...',
//   large: 'https://res.cloudinary.com/.../w_1920,f_auto,q_auto/...',
//   original: 'https://res.cloudinary.com/.../f_auto,q_auto/...'
// }
```

### WebP with JPEG Fallback

```typescript
import { getWebPWithFallback } from '@/lib/cloudinary';

const images = getWebPWithFallback('sameeksha-arts/artwork/portrait-123', 1024);

// Returns:
// {
//   webp: 'https://res.cloudinary.com/.../w_1024,f_webp,q_auto/...',
//   jpeg: 'https://res.cloudinary.com/.../w_1024,f_jpg,q_auto/...'
// }
```

### Blur Placeholder for Progressive Loading

```typescript
import { getBlurPlaceholder } from '@/lib/cloudinary';

const placeholder = getBlurPlaceholder('sameeksha-arts/artwork/portrait-123');
// Returns a tiny, blurred placeholder URL for smooth loading
```

### Validating File Uploads

```typescript
import { validateImageFile } from '@/lib/cloudinary';

const validation = validateImageFile(file);

if (!validation.isValid) {
  console.error(validation.error);
  // Display error to user
}
```

## File Upload Specifications

Per the requirements document:

- **Allowed Formats**: JPEG, PNG, WebP
- **Maximum File Size**: 10MB
- **Automatic Processing**: Multi-resolution generation, WebP conversion, optimization

## API Integration

When implementing the image upload API endpoint (task 4.3), use the Cloudinary SDK:

```typescript
import cloudinary from '@/lib/cloudinary';

// Upload to Cloudinary
const result = await cloudinary.uploader.upload(fileDataUrl, {
  folder: 'sameeksha-arts/artwork',
  transformation: [
    { width: 1920, crop: 'limit' }, // Limit max width
    { quality: 'auto' }, // Automatic quality optimization
    { fetch_format: 'auto' } // Automatic format selection
  ]
});

// result contains:
// - public_id: Unique identifier for the image
// - secure_url: HTTPS URL to the image
// - width, height: Original dimensions
// - format: File format
// - bytes: File size
```

## Troubleshooting

### Images Not Loading

1. Check that environment variables are set correctly in `.env.local`
2. Verify your Cloud Name matches exactly (it's case-sensitive)
3. Check the browser console for CORS or 404 errors
4. Ensure your Cloudinary account is active and within quota

### Upload Failures

1. Verify API Key and API Secret are correct
2. Check that the file size is under 10MB
3. Ensure file format is JPEG, PNG, or WebP
4. Check Cloudinary dashboard for upload errors
5. Verify your Cloudinary account hasn't exceeded storage limits

### Performance Issues

1. Ensure you're using the `f_auto` and `q_auto` parameters for optimization
2. Check that appropriate image sizes are being used for different viewports
3. Verify CDN caching is working (check response headers)
4. Consider using lazy loading for below-fold images

## Cost Considerations

Cloudinary's free tier includes:
- 25GB storage
- 25GB monthly bandwidth
- 25 monthly credits for transformations

For production use with higher traffic:
- Monitor usage in the Cloudinary dashboard
- Consider upgrading to a paid plan if needed
- Implement image optimization best practices to reduce bandwidth

## Security Best Practices

1. **Never expose API Secret**: Keep it server-side only
2. **Use HTTPS**: Always use `secure: true` in configuration
3. **Implement access control**: Protect upload endpoints with authentication
4. **Validate uploads**: Always validate file type and size before uploading
5. **Monitor usage**: Regularly check Cloudinary dashboard for suspicious activity

## Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Node.js SDK Reference](https://cloudinary.com/documentation/node_integration)
- [Image Transformation Reference](https://cloudinary.com/documentation/image_transformations)
- [Optimization Best Practices](https://cloudinary.com/documentation/image_optimization)

## Next Steps

After configuring Cloudinary:

1. Proceed to **Task 4.2**: Create image processing service with Sharp (for local processing if needed)
2. Then **Task 4.3**: Create media upload API endpoint
3. Test the complete upload pipeline
4. Implement the Artist Dashboard image uploader UI

## Support

If you encounter issues:
- Check the [Cloudinary Community Forum](https://community.cloudinary.com/)
- Contact [Cloudinary Support](https://support.cloudinary.com/)
- Review the project's troubleshooting documentation

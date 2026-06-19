# Cloudinary Media Storage - Quick Start

This project uses Cloudinary for media storage and CDN delivery. This guide will help you get started quickly.

## 🚀 Quick Setup (5 minutes)

### 1. Get Cloudinary Credentials

1. Sign up at [cloudinary.com](https://cloudinary.com) (free account)
2. Go to your Dashboard
3. Copy your **Cloud Name**, **API Key**, and **API Secret**

### 2. Configure Environment Variables

1. Open `.env.local` in the project root
2. Replace the placeholder values:

```env
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
```

### 3. Test Configuration

```bash
npm run test:cloudinary
```

If successful, you'll see: ✅ All Cloudinary tests passed!

## 📁 Project Structure

```
lib/
├── cloudinary.ts         # Cloudinary configuration and utilities
├── config-check.ts       # Configuration verification utility
types/
├── media.ts             # TypeScript type definitions
scripts/
├── test-cloudinary.ts   # Test script
docs/
├── CLOUDINARY_SETUP.md  # Detailed setup guide
└── MEDIA_STORAGE_ARCHITECTURE.md  # Architecture documentation
```

## 🔧 Common Operations

### Generate Responsive Image URLs

```typescript
import { getResponsiveImageUrls } from '@/lib/cloudinary';

const urls = getResponsiveImageUrls('sameeksha-arts/artwork/portrait-123');
// Returns: { thumbnail, small, medium, large, original }
```

### Validate File Before Upload

```typescript
import { validateImageFile } from '@/lib/cloudinary';

const validation = validateImageFile(file);
if (!validation.isValid) {
  alert(validation.error);
}
```

### Upload Image (Server-Side Only)

```typescript
import cloudinary, { CLOUDINARY_FOLDERS } from '@/lib/cloudinary';

const result = await cloudinary.uploader.upload(fileDataUrl, {
  folder: CLOUDINARY_FOLDERS.artwork
});
```

## 📸 Image Specifications

- **Allowed Formats**: JPEG, PNG, WebP
- **Max File Size**: 10MB
- **Generated Sizes**: 
  - Thumbnail: 150px
  - Small: 480px
  - Medium: 1024px
  - Large: 1920px
  - Original: full resolution

## 🔗 Useful Links

- [Detailed Setup Guide](./docs/CLOUDINARY_SETUP.md)
- [Architecture Documentation](./docs/MEDIA_STORAGE_ARCHITECTURE.md)
- [Cloudinary Dashboard](https://cloudinary.com/console)
- [Cloudinary Docs](https://cloudinary.com/documentation)

## ❓ Need Help?

1. Run `npm run test:cloudinary` to diagnose issues
2. Check `docs/CLOUDINARY_SETUP.md` for troubleshooting
3. Verify your credentials in the Cloudinary dashboard
4. Ensure `.env.local` has no typos or extra spaces

## ⚠️ Important Notes

- **Never commit** `.env.local` to Git (it's already in .gitignore)
- **Keep API Secret private** - it's server-side only
- **Free tier limits**: 25GB storage, 25GB bandwidth/month
- **Monitor usage** in Cloudinary dashboard

## 🎯 Next Tasks

After configuring Cloudinary:

1. ✅ Task 4.1: Configure Cloudinary (DONE)
2. ⬜ Task 4.2: Create image processing service with Sharp
3. ⬜ Task 4.3: Create media upload API endpoint

---

For more detailed information, see the full documentation in the `docs/` folder.

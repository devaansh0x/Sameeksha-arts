# Media Upload API Endpoint

## Overview

This API endpoint handles image upload with Sharp image processing and Cloudinary storage. It includes comprehensive validation, error handling, and session authentication.

**Endpoint:** `POST /api/admin/media/upload`

**Task:** 4.3 - Create media upload API endpoint  
**Requirements:** 11.1, 11.2, 11.3, 11.4, 11.8

## Features

- ✅ Session-based authentication using NextAuth.js
- ✅ File validation (format and size)
- ✅ Sharp image processing for multiple responsive sizes
- ✅ Cloudinary upload with CDN delivery
- ✅ WebP and JPEG format generation
- ✅ Database record creation (MediaAsset)
- ✅ Comprehensive error handling
- ✅ User-friendly error messages

## Request Format

### Headers
```
Content-Type: multipart/form-data
Cookie: next-auth.session-token=<session_token>
```

### Body (FormData)
```
file: File (image file)
```

### Constraints
- **Max file size:** 10MB
- **Allowed formats:** JPEG, PNG, WebP
- **Authentication:** Required (admin session)

## Response Format

### Success Response (201 Created)

```json
{
  "success": true,
  "media": {
    "id": "clx1234567890abcdef",
    "filename": "artwork.jpg",
    "url": "https://res.cloudinary.com/.../original.jpg",
    "thumbnailUrl": "https://res.cloudinary.com/.../thumbnail.jpg",
    "smallUrl": "https://res.cloudinary.com/.../small.jpg",
    "mediumUrl": "https://res.cloudinary.com/.../medium.jpg",
    "largeUrl": "https://res.cloudinary.com/.../large.jpg",
    "width": 1920,
    "height": 1080,
    "size": 524288,
    "mimeType": "image/jpeg",
    "uploadedAt": "2024-01-15T10:30:00.000Z",
    "urls": {
      "jpeg": {
        "thumbnail": "https://res.cloudinary.com/.../thumbnail.jpg",
        "small": "https://res.cloudinary.com/.../small.jpg",
        "medium": "https://res.cloudinary.com/.../medium.jpg",
        "large": "https://res.cloudinary.com/.../large.jpg",
        "original": "https://res.cloudinary.com/.../original.jpg"
      },
      "webp": {
        "thumbnail": "https://res.cloudinary.com/.../thumbnail.webp",
        "small": "https://res.cloudinary.com/.../small.webp",
        "medium": "https://res.cloudinary.com/.../medium.webp",
        "large": "https://res.cloudinary.com/.../large.webp",
        "original": "https://res.cloudinary.com/.../original.webp"
      },
      "blurPlaceholder": "https://res.cloudinary.com/.../blur.jpg"
    },
    "publicIds": {
      "jpeg": {
        "thumbnail": "sameeksha-arts/artwork/media_1234_jpeg_thumbnail",
        "small": "sameeksha-arts/artwork/media_1234_jpeg_small",
        "medium": "sameeksha-arts/artwork/media_1234_jpeg_medium",
        "large": "sameeksha-arts/artwork/media_1234_jpeg_large",
        "original": "sameeksha-arts/artwork/media_1234_jpeg_original"
      },
      "webp": { /* similar structure */ },
      "blurPlaceholder": "sameeksha-arts/artwork/media_1234_blur"
    }
  }
}
```

### Error Responses

#### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized. Please log in to upload media."
}
```

#### 400 Bad Request - No File
```json
{
  "success": false,
  "error": "No file provided. Please select an image to upload."
}
```

#### 400 Bad Request - File Too Large
```json
{
  "success": false,
  "error": "Image must be smaller than 10MB. Please compress or choose a different image."
}
```

#### 400 Bad Request - Invalid Format
```json
{
  "success": false,
  "error": "Only JPEG, PNG, and WebP formats are supported. Please convert your image."
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Upload failed: <error message>"
}
```

#### 405 Method Not Allowed (GET)
```json
{
  "success": false,
  "error": "Method not allowed. Use POST to upload media."
}
```

## Usage Examples

### Using Fetch API

```typescript
async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/admin/media/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include', // Include session cookie
    });

    const data = await response.json();

    if (data.success) {
      console.log('Upload successful:', data.media);
      return data.media;
    } else {
      console.error('Upload failed:', data.error);
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

// Usage in a React component
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    const media = await uploadImage(file);
    console.log('Media ID:', media.id);
    console.log('Thumbnail URL:', media.thumbnailUrl);
  } catch (error) {
    alert('Failed to upload image');
  }
};
```

### Using Axios

```typescript
import axios from 'axios';

async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post('/api/admin/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true, // Include session cookie
    });

    return response.data.media;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Upload failed');
    }
    throw error;
  }
}
```

### With Progress Tracking

```typescript
async function uploadImageWithProgress(
  file: File,
  onProgress: (progress: number) => void
) {
  const formData = new FormData();
  formData.append('file', file);

  const xhr = new XMLHttpRequest();

  return new Promise((resolve, reject) => {
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const progress = (e.loaded / e.total) * 100;
        onProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 201) {
        const data = JSON.parse(xhr.responseText);
        resolve(data.media);
      } else {
        const data = JSON.parse(xhr.responseText);
        reject(new Error(data.error || 'Upload failed'));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.open('POST', '/api/admin/media/upload');
    xhr.withCredentials = true; // Include session cookie
    xhr.send(formData);
  });
}

// Usage
const [uploadProgress, setUploadProgress] = useState(0);

const handleUpload = async (file: File) => {
  try {
    const media = await uploadImageWithProgress(file, setUploadProgress);
    console.log('Upload complete:', media);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

## Image Processing Pipeline

The endpoint performs the following operations:

1. **Authentication Check** - Verifies user session
2. **File Validation** - Checks file size and format
3. **Buffer Conversion** - Converts File to Buffer for processing
4. **Sharp Processing** - Generates multiple responsive sizes:
   - Thumbnail: 150px width
   - Small: 480px width
   - Medium: 1024px width
   - Large: 1920px width
   - Original: up to 4000px width
5. **Format Conversion** - Creates both JPEG and WebP versions
6. **Cloudinary Upload** - Uploads all sizes in parallel
7. **Database Record** - Creates MediaAsset entry in PostgreSQL
8. **Response** - Returns complete media information with all URLs

## Database Schema

The endpoint creates records in the `MediaAsset` table:

```prisma
model MediaAsset {
  id            String         @id @default(cuid())
  filename      String
  originalUrl   String
  thumbnailUrl  String
  smallUrl      String
  mediumUrl     String
  largeUrl      String
  width         Int
  height        Int
  size          Int            // bytes
  mimeType      String
  uploadedAt    DateTime       @default(now())
  artworkImages ArtworkImage[]

  @@index([uploadedAt])
}
```

## Error Handling

The endpoint implements comprehensive error handling:

- **Authentication Errors**: Returns 401 with clear message
- **Validation Errors**: Returns 400 with specific validation failure
- **Processing Errors**: Returns 500 with error details
- **Unexpected Errors**: Returns 500 with generic message, logs full error

All errors are logged to the console for debugging while returning user-friendly messages to the client.

## Security Features

1. **Session Authentication** - Requires valid NextAuth.js session
2. **File Type Validation** - Only allows JPEG, PNG, WebP
3. **File Size Limit** - Maximum 10MB per file
4. **HTTP-Only Cookies** - Session tokens stored securely
5. **Input Sanitization** - File buffers validated before processing

## Testing

The endpoint includes comprehensive unit tests covering:

- Authentication scenarios (unauthorized, no session, no user)
- File validation (missing file, size limit, format validation)
- Image processing and upload (success, failure, incomplete data)
- Error handling (unexpected errors)
- HTTP method validation (GET requests rejected)

Run tests with:
```bash
npm test -- app/api/admin/media/upload/route.test.ts
```

## Dependencies

- **Next.js**: API Routes framework
- **NextAuth.js**: Session authentication
- **Sharp**: Image processing
- **Cloudinary**: CDN storage
- **Prisma**: Database ORM
- **PostgreSQL**: Database

## Environment Variables Required

```env
# NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/database
```

## Related Files

- **Implementation**: `app/api/admin/media/upload/route.ts`
- **Tests**: `app/api/admin/media/upload/route.test.ts`
- **Image Processing**: `lib/imageProcessing.ts`
- **Upload Helper**: `lib/imageUploadHelper.ts`
- **Cloudinary Config**: `lib/cloudinary.ts`
- **Auth Utilities**: `lib/auth.ts`

## Next Steps

After implementing this endpoint, you can:

1. Create the ImageUploader React component for the dashboard
2. Integrate with the artwork editor form
3. Implement the media library UI
4. Add drag-and-drop file upload
5. Add upload progress indicators

## Support

For issues or questions about this endpoint:
- Check the test file for usage examples
- Review the design document for requirements
- Verify environment variables are configured
- Check CloudinaryTesting logs for upload issues

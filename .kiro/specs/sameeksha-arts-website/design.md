# Design Document: Sameeksha Arts Website

## Overview

The Sameeksha Arts Website is a sophisticated artist portfolio platform combining a public-facing gallery website with an integrated content management system (CMS). The platform enables professional artist Sameeksha to showcase her work in a museum-like digital environment while maintaining complete control over all content without requiring technical knowledge.

### Design Philosophy

The system prioritizes:
- **Artist-centric experience**: The website tells Sameeksha's story and philosophy, not a marketplace
- **Museum-quality presentation**: Gallery-style artwork display with rich context and storytelling
- **Non-technical management**: Intuitive CMS interface requiring zero technical expertise
- **Performance and accessibility**: Fast loading, SEO-optimized, WCAG 2.1 compliant
- **Mobile-first responsive design**: Seamless experience across all devices

### Technology Stack

**Frontend (Public Gallery):**
- **Next.js 14+** with App Router for SSR/SSG capabilities
- **React 18+** for component architecture
- **TypeScript** for type safety
- **Tailwind CSS** for responsive design system
- **Sharp** for image optimization
- **React Query** for data fetching and caching

**Frontend (Artist Dashboard):**
- **Next.js 14+** admin routes with authentication middleware
- **TipTap** or **Slate.js** for rich text editing
- **React Hook Form** for form management
- **Zod** for schema validation
- **React DnD** for drag-and-drop reordering

**Backend:**
- **Next.js API Routes** for serverless backend
- **Prisma ORM** for database access
- **NextAuth.js** for session-based authentication
- **Nodemailer** for email notifications
- **Zod** for input validation

**Database:**
- **PostgreSQL** for relational data storage
- Indexes on frequently queried fields (collection_id, availability_status, created_at)

**Media Storage:**
- **Cloudinary** or **AWS S3** with CloudFront CDN
- Automatic multi-resolution image generation
- WebP format with JPEG fallbacks

**Deployment:**
- **Vercel** or **AWS Amplify** for Next.js hosting
- Edge caching for static assets
- Environment-based configuration

### System Architecture

The system follows a three-tier architecture:

```mermaid
graph TB
    subgraph "Presentation Layer"
        PG[Public Gallery<br/>Next.js SSR/SSG]
        AD[Artist Dashboard<br/>Next.js CSR]
    end
    
    subgraph "Application Layer"
        API[Next.js API Routes]
        AUTH[NextAuth.js<br/>Authentication]
        IMG[Image Processing<br/>Sharp]
        EMAIL[Email Service<br/>Nodemailer]
    end
    
    subgraph "Data Layer"
        DB[(PostgreSQL<br/>Database)]
        CDN[CDN<br/>Cloudinary/S3]
    end
    
    PG -->|Public API| API
    AD -->|Admin API| API
    AD -->|Login| AUTH
    AUTH -->|Session| AD
    API -->|Prisma ORM| DB
    API -->|Image Upload| IMG
    IMG -->|Store| CDN
    PG -->|Load Images| CDN
    API -->|Notifications| EMAIL
```

### Key Architectural Patterns

**1. Server-Side Rendering (SSR) and Static Site Generation (SSG):**
- Homepage, About, Recognition pages use SSG with revalidation
- Artwork detail pages use SSG with dynamic routes
- Collection pages use SSG with incremental static regeneration (ISR)
- Contact form uses SSR for CSRF token generation

**2. Component-Driven Design:**
- Atomic design methodology (atoms, molecules, organisms, templates, pages)
- Shared components between Public Gallery and Dashboard where appropriate
- Design system with consistent spacing, typography, and colors

**3. Content Draft/Publish Pattern:**
- All content has `published` boolean flag
- Dashboard preview mode renders unpublished content
- Public Gallery queries only published content
- Automatic draft saving every 30 seconds

**4. Image Optimization Pipeline:**
- Upload → Sharp processing → Generate sizes (thumb: 150px, small: 480px, medium: 1024px, large: 1920px, original)
- WebP generation with JPEG fallback
- Automatic alt text from artwork metadata
- Lazy loading with blur-up placeholders

**5. Authentication and Authorization:**
- Session-based auth with HTTP-only cookies
- Single admin user (extendable to multiple in future)
- Protected API routes with middleware
- CSRF token validation for mutations

**6. Responsive Design System:**
- Mobile-first CSS with Tailwind breakpoints (sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px)
- Touch-optimized components for mobile (44x44px minimum touch targets)
- Adaptive layouts (stack on mobile, grid on desktop)
- Responsive images with `srcset` and `sizes` attributes

## Architecture

### System Components

The system consists of five primary subsystems:

**1. Public Gallery (Visitor-Facing Website)**
- Server-side rendered pages for SEO optimization
- Static generation for artwork and collection pages
- Client-side navigation for smooth transitions
- Lazy-loaded images with progressive enhancement

**2. Artist Dashboard (CMS Interface)**
- Client-side rendered admin interface
- Protected routes with authentication middleware
- Real-time preview capabilities
- Auto-save functionality

**3. Backend API Layer**
- RESTful API endpoints via Next.js API routes
- Input validation with Zod schemas
- Error handling with standardized responses
- Rate limiting for public endpoints

**4. Database Layer**
- PostgreSQL with Prisma ORM
- Optimistic locking for concurrent edits
- Soft deletes for recoverability
- Full-text search indexes

**5. Media Management System**
- CDN-hosted media assets
- Multi-resolution image generation
- Upload validation and size limits
- Unused asset cleanup

### Data Flow Patterns

**Public Gallery Request Flow:**
```
Visitor → Next.js Page → getStaticProps → Prisma Query → PostgreSQL
                                                          ↓
                                                    Transform Data
                                                          ↓
                                                   Render HTML (SSG)
                                                          ↓
                                                     Cache (CDN)
                                                          ↓
                                                  Serve to Visitor
```

**Dashboard Content Update Flow:**
```
Sameeksha → Dashboard Form → Validation (Zod) → API Route → Authentication Check
                                                                    ↓
                                                            Prisma Mutation
                                                                    ↓
                                                              PostgreSQL
                                                                    ↓
                                                         Revalidate SSG Cache
                                                                    ↓
                                                        Success Response
```

**Image Upload Flow:**
```
Sameeksha → File Upload → Size Validation → Sharp Processing → Generate Sizes
                                                                      ↓
                                                                 WebP + JPEG
                                                                      ↓
                                                              Upload to CDN
                                                                      ↓
                                                        Store URLs in Database
                                                                      ↓
                                                          Return Asset Record
```

### Security Architecture

**Authentication:**
- NextAuth.js with Credentials provider
- Argon2 password hashing (more secure than bcrypt)
- Session tokens stored in HTTP-only cookies
- 24-hour session expiration with sliding window

**Authorization:**
- Middleware protecting `/admin/*` routes
- API route guards checking session validity
- Role-based access control (future: multiple admin levels)

**Input Validation:**
- Client-side validation with React Hook Form
- Server-side validation with Zod schemas
- SQL injection prevention via Prisma ORM
- XSS prevention via React's automatic escaping

**File Upload Security:**
- MIME type validation (JPEG, PNG, WebP only)
- File size limits (10MB per file)
- Filename sanitization
- Virus scanning (optional, via third-party service)

**CSRF Protection:**
- NextAuth.js automatic CSRF token generation
- Token validation on all mutations
- SameSite cookie attribute

## Components and Interfaces

### Public Gallery Components

**Page Components:**

1. **HomePage** (`/pages/index.tsx`)
   - Hero section with featured artwork
   - Artist introduction
   - Selected works grid (6-9 pieces)
   - Artist's world context section
   - Commission invitation
   - Recognition highlights
   - Testimonials carousel
   - Contact invitation

2. **AboutPage** (`/pages/about.tsx`)
   - Artist biography with portrait
   - Philosophy and approach
   - Studio information

3. **WorkPage** (`/pages/work.tsx`)
   - All collections overview
   - Collection filtering
   - Artwork grid with masonry layout

4. **ArtworkDetailPage** (`/pages/work/[slug].tsx`)
   - High-resolution image gallery
   - Artwork metadata (title, year, medium, dimensions, availability)
   - Story and description
   - Collection context
   - Related works

5. **CollectionPage** (`/pages/collections/[slug].tsx`)
   - Collection header with description
   - Filtered artwork grid
   - Collection-specific context

6. **CommissionsPage** (`/pages/commissions.tsx`)
   - Process overview
   - Commission examples
   - Client stories
   - Inquiry call-to-action

7. **RecognitionPage** (`/pages/recognition.tsx`)
   - Awards timeline
   - Exhibitions list
   - Institutional collaborations
   - Press mentions

8. **ContactPage** (`/pages/contact.tsx`)
   - Contact form
   - Email and social links
   - Expected response time

**Shared UI Components:**

1. **Navigation** (`/components/Navigation.tsx`)
   ```typescript
   interface NavigationProps {
     currentPath: string;
   }
   ```
   - Desktop: horizontal menu bar
   - Mobile: hamburger menu with slide-out drawer
   - Active state indication
   - Smooth scroll for anchor links

2. **ArtworkCard** (`/components/ArtworkCard.tsx`)
   ```typescript
   interface ArtworkCardProps {
     artwork: {
       id: string;
       title: string;
       slug: string;
       thumbnail: string;
       year: number;
       medium: string;
       availabilityStatus: AvailabilityStatus;
     };
     size?: 'small' | 'medium' | 'large';
   }
   ```
   - Responsive image with blur placeholder
   - Hover overlay with title and year
   - Availability badge
   - Link to detail page

3. **ImageGallery** (`/components/ImageGallery.tsx`)
   ```typescript
   interface ImageGalleryProps {
     images: Array<{
       url: string;
       alt: string;
       width: number;
       height: number;
     }>;
     autoPlay?: boolean;
   }
   ```
   - Lightbox modal on click
   - Thumbnail navigation
   - Keyboard controls (arrow keys, ESC)
   - Touch gestures (swipe)

4. **ContactForm** (`/components/ContactForm.tsx`)
   ```typescript
   interface ContactFormProps {
     onSuccess?: () => void;
   }
   
   interface ContactFormData {
     name: string;
     email: string;
     subject: string;
     message: string;
   }
   ```
   - Client-side validation
   - Loading states
   - Error and success messages
   - Honeypot field for spam prevention

5. **TestimonialCarousel** (`/components/TestimonialCarousel.tsx`)
   ```typescript
   interface TestimonialCarouselProps {
     testimonials: Array<{
       id: string;
       clientName: string;
       clientTitle?: string;
       text: string;
     }>;
   }
   ```
   - Auto-rotation every 5 seconds
   - Manual navigation controls
   - Pause on hover
   - Responsive layout

### Artist Dashboard Components

**Layout Components:**

1. **DashboardLayout** (`/components/admin/DashboardLayout.tsx`)
   ```typescript
   interface DashboardLayoutProps {
     children: React.ReactNode;
   }
   ```
   - Side navigation menu
   - Header with user info and logout
   - Breadcrumb navigation
   - Mobile: collapsible drawer menu

2. **DashboardSidebar** (`/components/admin/DashboardSidebar.tsx`)
   - Dashboard overview
   - Artwork management
   - Collections
   - Recognition
   - Testimonials
   - Inquiries
   - Media library
   - Content pages (Home, About, Commissions)
   - Settings

**Dashboard Pages:**

1. **DashboardOverview** (`/pages/admin/index.tsx`)
   - Content statistics cards
   - Recent inquiries list
   - Quick actions
   - Availability status breakdown chart

2. **ArtworkManager** (`/pages/admin/artwork/index.tsx`)
   - Artwork list with search and filters
   - Bulk selection and actions
   - Create new artwork button
   - Status indicators (published/draft)

3. **ArtworkEditor** (`/pages/admin/artwork/[id].tsx`)
   ```typescript
   interface ArtworkEditorProps {
     artworkId?: string; // undefined for new artwork
   }
   ```
   - Form with all artwork fields
   - Image upload and gallery manager
   - Collection selector dropdown
   - Availability status dropdown
   - Draft/Publish toggle
   - Preview button
   - Auto-save indicator

4. **CollectionManager** (`/pages/admin/collections/index.tsx`)
   - Collection list
   - Create new collection button
   - Edit and delete actions

5. **CollectionEditor** (`/pages/admin/collections/[id].tsx`)
   - Name and description fields
   - Preview button
   - Artwork count display

6. **RecognitionManager** (`/pages/admin/recognition/index.tsx`)
   - Recognition entries list grouped by type
   - Create new entry button
   - Edit and delete actions

7. **TestimonialManager** (`/pages/admin/testimonials/index.tsx`)
   - Testimonials list
   - Create, edit, delete actions
   - Reorder functionality

8. **InquiryManager** (`/pages/admin/inquiries/index.tsx`)
   - Inquiries list with filters (all, unread, read, archived)
   - Unread count badge
   - Mark as read/archived actions
   - Inquiry detail view

9. **MediaLibrary** (`/pages/admin/media/index.tsx`)
   - Grid view of all uploaded images
   - Upload new media button
   - Search and filter by date
   - Bulk selection and delete
   - Usage indicator (shows which artworks use the image)

10. **ContentEditor** (`/pages/admin/content/[page].tsx`)
    - Rich text editor for biography, about, homepage sections
    - Preview mode
    - Auto-save
    - Publish button

11. **SettingsPage** (`/pages/admin/settings.tsx`)
    - Password change form
    - Profile information
    - Site configuration

**Form Components:**

1. **ImageUploader** (`/components/admin/ImageUploader.tsx`)
   ```typescript
   interface ImageUploaderProps {
     onUpload: (file: File) => Promise<MediaAsset>;
     accept?: string;
     maxSize?: number;
     multiple?: boolean;
   }
   ```
   - Drag-and-drop zone
   - File selection button
   - Upload progress indicator
   - Error handling
   - Preview thumbnails

2. **ImageGalleryEditor** (`/components/admin/ImageGalleryEditor.tsx`)
   ```typescript
   interface ImageGalleryEditorProps {
     images: MediaAsset[];
     onAdd: (files: File[]) => Promise<void>;
     onRemove: (imageId: string) => Promise<void>;
     onReorder: (imageIds: string[]) => Promise<void>;
   }
   ```
   - Drag-and-drop reordering
   - Add images button
   - Remove image button with confirmation
   - Primary image indicator

3. **RichTextEditor** (`/components/admin/RichTextEditor.tsx`)
   ```typescript
   interface RichTextEditorProps {
     content: string;
     onChange: (content: string) => void;
     placeholder?: string;
   }
   ```
   - Bold, italic, underline formatting
   - Paragraph and heading styles
   - Link insertion
   - Plain language toolbar
   - Word count display

4. **SelectField** (`/components/admin/SelectField.tsx`)
   ```typescript
   interface SelectFieldProps {
     label: string;
     value: string;
     options: Array<{ value: string; label: string }>;
     onChange: (value: string) => void;
     error?: string;
     required?: boolean;
   }
   ```
   - Styled dropdown
   - Search functionality for long lists
   - Error state display
   - Required field indicator

**Utility Components:**

1. **ConfirmDialog** (`/components/admin/ConfirmDialog.tsx`)
   ```typescript
   interface ConfirmDialogProps {
     isOpen: boolean;
     title: string;
     message: string;
     confirmLabel?: string;
     cancelLabel?: string;
     onConfirm: () => void;
     onCancel: () => void;
     variant?: 'warning' | 'danger';
   }
   ```

2. **LoadingSpinner** (`/components/admin/LoadingSpinner.tsx`)
   ```typescript
   interface LoadingSpinnerProps {
     size?: 'small' | 'medium' | 'large';
     message?: string;
   }
   ```

3. **Toast** (`/components/admin/Toast.tsx`)
   ```typescript
   interface ToastProps {
     type: 'success' | 'error' | 'warning' | 'info';
     message: string;
     duration?: number;
   }
   ```

### API Interfaces

**Public API Endpoints:**

1. `POST /api/contact`
   ```typescript
   // Request
   {
     name: string;
     email: string;
     subject: string;
     message: string;
     honeypot?: string; // spam prevention
   }
   
   // Response
   {
     success: boolean;
     message: string;
   }
   ```

2. `GET /api/artwork/[slug]`
   ```typescript
   // Response
   {
     id: string;
     title: string;
     slug: string;
     description: string;
     story: string;
     medium: string;
     dimensions: string;
     year: number;
     availabilityStatus: 'available' | 'sold' | 'on_commission' | 'not_for_sale';
     collection: {
       id: string;
       name: string;
       slug: string;
     };
     images: Array<{
       id: string;
       url: string;
       alt: string;
       width: number;
       height: number;
     }>;
   }
   ```

**Admin API Endpoints:**

1. `POST /api/auth/login`
   ```typescript
   // Request
   {
     email: string;
     password: string;
   }
   
   // Response
   {
     success: boolean;
     user?: {
       id: string;
       email: string;
       name: string;
     };
     error?: string;
   }
   ```

2. `POST /api/admin/artwork`
   ```typescript
   // Request
   {
     title: string;
     slug: string;
     description: string;
     story: string;
     medium: string;
     dimensions: string;
     year: number;
     collectionId: string;
     availabilityStatus: AvailabilityStatus;
     published: boolean;
     imageIds: string[];
   }
   
   // Response
   {
     success: boolean;
     artwork?: ArtworkRecord;
     error?: string;
   }
   ```

3. `PUT /api/admin/artwork/[id]`
   ```typescript
   // Request: Same as POST
   // Response: Same as POST
   ```

4. `DELETE /api/admin/artwork/[id]`
   ```typescript
   // Response
   {
     success: boolean;
     message: string;
   }
   ```

5. `POST /api/admin/media/upload`
   ```typescript
   // Request: multipart/form-data with file
   
   // Response
   {
     success: boolean;
     media?: {
       id: string;
       url: string;
       thumbnailUrl: string;
       filename: string;
       size: number;
       width: number;
       height: number;
       uploadedAt: string;
     };
     error?: string;
   }
   ```

6. `DELETE /api/admin/media/[id]`
   ```typescript
   // Response
   {
     success: boolean;
     warning?: string; // if media is used in artworks
   }
   ```

7. `POST /api/admin/collection`
8. `PUT /api/admin/collection/[id]`
9. `DELETE /api/admin/collection/[id]`

10. `POST /api/admin/recognition`
11. `PUT /api/admin/recognition/[id]`
12. `DELETE /api/admin/recognition/[id]`

13. `POST /api/admin/testimonial`
14. `PUT /api/admin/testimonial/[id]`
15. `DELETE /api/admin/testimonial/[id]`

16. `GET /api/admin/inquiries`
17. `PATCH /api/admin/inquiries/[id]` (mark as read/archived)

18. `PUT /api/admin/content/[page]`
    ```typescript
    // Request
    {
      content: Record<string, any>; // page-specific content structure
    }
    ```

19. `POST /api/admin/password`
    ```typescript
    // Request
    {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }
    
    // Response
    {
      success: boolean;
      message: string;
    }
    ```

## Data Models

### Database Schema

**User**
```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String
  passwordHash  String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

**Artwork**
```prisma
enum AvailabilityStatus {
  AVAILABLE
  SOLD
  ON_COMMISSION
  NOT_FOR_SALE
}

model Artwork {
  id                  String             @id @default(cuid())
  title               String
  slug                String             @unique
  description         String             @db.Text
  story               String             @db.Text
  medium              String
  dimensions          String
  year                Int
  availabilityStatus  AvailabilityStatus @default(AVAILABLE)
  published           Boolean            @default(false)
  collectionId        String?
  collection          Collection?        @relation(fields: [collectionId], references: [id], onDelete: SetNull)
  images              ArtworkImage[]
  createdAt           DateTime           @default(now())
  updatedAt           DateTime           @updatedAt
  
  @@index([collectionId])
  @@index([availabilityStatus])
  @@index([published])
  @@index([createdAt])
}
```

**Collection**
```prisma
model Collection {
  id          String    @id @default(cuid())
  name        String    @unique
  slug        String    @unique
  description String    @db.Text
  artworks    Artwork[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

**MediaAsset**
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

**ArtworkImage** (Join table with ordering)
```prisma
model ArtworkImage {
  id           String      @id @default(cuid())
  artworkId    String
  artwork      Artwork     @relation(fields: [artworkId], references: [id], onDelete: Cascade)
  mediaAssetId String
  mediaAsset   MediaAsset  @relation(fields: [mediaAssetId], references: [id], onDelete: Cascade)
  order        Int         @default(0)
  isPrimary    Boolean     @default(false)
  
  @@unique([artworkId, mediaAssetId])
  @@index([artworkId])
  @@index([order])
}
```

**Recognition**
```prisma
enum RecognitionType {
  AWARD
  EXHIBITION
  INSTITUTIONAL_COLLABORATION
  PRESS
}

model Recognition {
  id          String           @id @default(cuid())
  title       String
  type        RecognitionType
  date        DateTime
  description String           @db.Text
  published   Boolean          @default(true)
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  
  @@index([type])
  @@index([date])
}
```

**Testimonial**
```prisma
model Testimonial {
  id          String   @id @default(cuid())
  clientName  String
  clientTitle String?
  text        String   @db.Text
  order       Int      @default(0)
  published   Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([order])
}
```

**Inquiry**
```prisma
enum InquiryStatus {
  UNREAD
  READ
  ARCHIVED
}

model Inquiry {
  id        String        @id @default(cuid())
  name      String
  email     String
  subject   String
  message   String        @db.Text
  status    InquiryStatus @default(UNREAD)
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
  
  @@index([status])
  @@index([createdAt])
}
```

**PageContent** (Flexible content storage)
```prisma
model PageContent {
  id        String   @id @default(cuid())
  page      String   @unique // 'homepage', 'about', 'commissions'
  content   Json     // JSON structure for page-specific content
  updatedAt DateTime @updatedAt
}
```

### Content JSON Structures

**Homepage Content:**
```typescript
interface HomepageContent {
  hero: {
    artworkId: string; // reference to featured artwork
    heading: string;
    subheading: string;
  };
  introduction: {
    heading: string;
    text: string;
  };
  selectedWorks: {
    artworkIds: string[]; // ordered list of artwork IDs
  };
  artistWorld: {
    heading: string;
    text: string;
    imageUrl?: string;
  };
  commissionInvitation: {
    heading: string;
    text: string;
  };
  contactInvitation: {
    heading: string;
    text: string;
  };
}
```

**About Page Content:**
```typescript
interface AboutContent {
  biography: {
    text: string;
    portraitUrl?: string;
  };
  philosophy: {
    heading: string;
    text: string;
  };
  studio: {
    heading: string;
    text: string;
    imageUrl?: string;
  };
}
```

**Commission Page Content:**
```typescript
interface CommissionContent {
  process: {
    heading: string;
    steps: Array<{
      title: string;
      description: string;
    }>;
  };
  examples: {
    artworkIds: string[];
  };
  stories: Array<{
    id: string;
    title: string;
    text: string;
  }>;
  invitation: {
    heading: string;
    text: string;
  };
}
```

### Data Validation Schemas

**Artwork Validation:**
```typescript
const artworkSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  story: z.string().optional(),
  medium: z.string().min(1, "Medium is required"),
  dimensions: z.string().min(1, "Dimensions are required"),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  availabilityStatus: z.enum(['AVAILABLE', 'SOLD', 'ON_COMMISSION', 'NOT_FOR_SALE']),
  collectionId: z.string().cuid().optional(),
  published: z.boolean(),
  imageIds: z.array(z.string().cuid()).min(1, "At least one image is required"),
});
```

**Contact Form Validation:**
```typescript
const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters").max(200),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
  honeypot: z.string().optional(), // should be empty
});
```

**Password Validation:**
```typescript
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
```

**Image Upload Validation:**
```typescript
const imageUploadSchema = z.object({
  file: z.custom<File>()
    .refine((file) => file.size <= 10 * 1024 * 1024, "File size must be less than 10MB")
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      "Only JPEG, PNG, and WebP formats are supported"
    ),
});
```

## 
Error Handling

### Error Handling Strategy

The system implements comprehensive error handling at multiple layers to ensure reliability and provide clear feedback to users.

**Client-Side Error Handling:**

1. **Form Validation Errors**
   - Display field-specific error messages below each input
   - Highlight invalid fields with red borders
   - Prevent form submission until all errors are resolved
   - Show error summary at top of form for accessibility

2. **Network Errors**
   - Display user-friendly error messages for connection failures
   - Implement exponential backoff retry logic for transient failures
   - Show offline indicator when network is unavailable
   - Cache form data in localStorage to prevent data loss

3. **Image Upload Errors**
   - File size exceeded: "Image must be smaller than 10MB. Please compress or choose a different image."
   - Invalid format: "Only JPEG, PNG, and WebP formats are supported. Please convert your image."
   - Upload failed: "Upload failed. Please check your connection and try again."
   - Provide retry button with progress indication

**Server-Side Error Handling:**

1. **API Route Error Responses**
   ```typescript
   interface ErrorResponse {
     success: false;
     error: {
       code: string;
       message: string;
       field?: string; // for validation errors
       details?: any;
     };
   }
   
   // Common error codes:
   // - VALIDATION_ERROR: Input validation failed
   // - AUTHENTICATION_ERROR: Not authenticated or session expired
   // - AUTHORIZATION_ERROR: Insufficient permissions
   // - NOT_FOUND: Resource not found
   // - CONFLICT: Resource conflict (e.g., duplicate slug)
   // - RATE_LIMIT: Too many requests
   // - INTERNAL_ERROR: Unexpected server error
   ```

2. **Database Error Handling**
   - Wrap all Prisma operations in try-catch blocks
   - Log errors with context (user ID, operation, timestamp)
   - Return sanitized error messages to clients (never expose internal details)
   - Implement retry logic for transient database errors
   - Handle unique constraint violations gracefully (e.g., duplicate slugs)

3. **External Service Errors**
   - CDN upload failures: Retry up to 3 times with exponential backoff
   - Email service failures: Log error and queue for retry
   - Fallback strategies where possible (e.g., skip CDN, use local storage temporarily)

**Error Logging and Monitoring:**

1. **Structured Logging**
   ```typescript
   interface LogEntry {
     timestamp: string;
     level: 'info' | 'warn' | 'error' | 'fatal';
     message: string;
     context: {
       userId?: string;
       action?: string;
       resource?: string;
       error?: {
         name: string;
         message: string;
         stack?: string;
       };
     };
   }
   ```

2. **Error Tracking**
   - Use Sentry or similar service for production error tracking
   - Capture user context (authenticated user, browser, device)
   - Group similar errors to identify patterns
   - Alert on critical errors (authentication failures, data loss)

**Graceful Degradation:**

1. **Image Loading Failures**
   - Display placeholder image with error icon
   - Provide alt text for screen readers
   - Log failure for investigation

2. **Content Loading Failures**
   - Show cached content if available (stale-while-revalidate)
   - Display error message with retry button
   - Allow navigation to other sections

3. **Dashboard Auto-Save Failures**
   - Show warning indicator
   - Keep draft in local storage
   - Attempt retry on next user action
   - Prompt user before closing browser

**User-Facing Error Messages:**

All error messages follow these principles:
- **Clear**: Explain what went wrong in plain language
- **Actionable**: Tell user what they can do to fix it
- **Non-technical**: Avoid jargon and technical details
- **Empathetic**: Use friendly, supportive tone

Examples:
- ❌ "Database constraint violation: unique_slug_idx"
- ✅ "This artwork title is already used. Please choose a different title."

- ❌ "Network request failed with status 500"
- ✅ "We couldn't save your changes. Please check your internet connection and try again."

## Testing Strategy

### Testing Approach Overview

The Sameeksha Arts Website primarily consists of UI rendering, content management workflows, database operations, and integration with external services (CDN, email). **Property-based testing is NOT appropriate** for this feature because:

1. **UI Rendering and Layout**: The public gallery and dashboard are primarily concerned with visual presentation
2. **Content Management Workflows**: CRUD operations without complex transformation logic
3. **Database Operations**: Standard ORM queries and mutations
4. **Integration Points**: External service interactions (CDN, email, authentication)

Instead, the testing strategy focuses on:
- **Unit tests** for business logic, validation schemas, and utility functions
- **Integration tests** for API routes and database operations
- **End-to-end tests** for critical user workflows
- **Accessibility tests** for WCAG 2.1 compliance
- **Visual regression tests** for UI consistency

### Test Coverage by Layer

**1. Unit Tests (Jest + React Testing Library)**

Test pure functions and isolated components:

```typescript
// Validation schema tests
describe('artworkSchema', () => {
  it('accepts valid artwork data', () => {
    const valid = {
      title: 'Sunset Landscape',
      slug: 'sunset-landscape',
      description: 'A beautiful sunset over mountains',
      medium: 'Oil on canvas',
      dimensions: '24x36 inches',
      year: 2024,
      availabilityStatus: 'AVAILABLE',
      published: true,
      imageIds: ['cuid123'],
    };
    expect(artworkSchema.parse(valid)).toEqual(valid);
  });
  
  it('rejects title exceeding 200 characters', () => {
    const invalid = { /* ... */ title: 'a'.repeat(201) };
    expect(() => artworkSchema.parse(invalid)).toThrow();
  });
  
  it('rejects invalid slug format', () => {
    const invalid = { /* ... */ slug: 'Invalid Slug!' };
    expect(() => artworkSchema.parse(invalid)).toThrow('Slug must be lowercase with hyphens');
  });
  
  it('rejects year in the future', () => {
    const invalid = { /* ... */ year: 2030 };
    expect(() => artworkSchema.parse(invalid)).toThrow();
  });
});

// Utility function tests
describe('generateSlug', () => {
  it('converts title to lowercase with hyphens', () => {
    expect(generateSlug('Sunset Landscape')).toBe('sunset-landscape');
  });
  
  it('removes special characters', () => {
    expect(generateSlug('Art & Soul: Journey!')).toBe('art-soul-journey');
  });
  
  it('handles multiple spaces', () => {
    expect(generateSlug('Multiple   Spaces')).toBe('multiple-spaces');
  });
});

// Component tests
describe('ArtworkCard', () => {
  it('renders artwork title and year', () => {
    const artwork = {
      id: '1',
      title: 'Test Artwork',
      slug: 'test-artwork',
      thumbnail: '/image.jpg',
      year: 2024,
      medium: 'Oil',
      availabilityStatus: 'AVAILABLE' as const,
    };
    render(<ArtworkCard artwork={artwork} />);
    expect(screen.getByText('Test Artwork')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
  });
  
  it('displays availability badge', () => {
    const artwork = { /* ... */ availabilityStatus: 'SOLD' as const };
    render(<ArtworkCard artwork={artwork} />);
    expect(screen.getByText('Sold')).toBeInTheDocument();
  });
  
  it('links to artwork detail page', () => {
    const artwork = { /* ... */ slug: 'test-artwork' };
    render(<ArtworkCard artwork={artwork} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/work/test-artwork');
  });
});
```

**2. Integration Tests (Jest + Supertest + Test Database)**

Test API routes with real database operations:

```typescript
describe('POST /api/admin/artwork', () => {
  beforeEach(async () => {
    await setupTestDatabase();
    await authenticateTestUser();
  });
  
  afterEach(async () => {
    await cleanupTestDatabase();
  });
  
  it('creates new artwork with valid data', async () => {
    const artworkData = {
      title: 'Test Artwork',
      slug: 'test-artwork',
      description: 'Test description',
      story: 'Test story',
      medium: 'Oil on canvas',
      dimensions: '24x36',
      year: 2024,
      collectionId: 'collection-id',
      availabilityStatus: 'AVAILABLE',
      published: true,
      imageIds: ['image-1'],
    };
    
    const response = await request(app)
      .post('/api/admin/artwork')
      .send(artworkData)
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.artwork.title).toBe('Test Artwork');
    
    // Verify database persistence
    const artwork = await prisma.artwork.findUnique({
      where: { slug: 'test-artwork' },
    });
    expect(artwork).toBeDefined();
  });
  
  it('returns error for duplicate slug', async () => {
    await createTestArtwork({ slug: 'existing-slug' });
    
    const response = await request(app)
      .post('/api/admin/artwork')
      .send({ /* ... */ slug: 'existing-slug' })
      .expect(409);
    
    expect(response.body.error.code).toBe('CONFLICT');
  });
  
  it('requires authentication', async () => {
    await logoutTestUser();
    
    const response = await request(app)
      .post('/api/admin/artwork')
      .send({})
      .expect(401);
    
    expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
  });
});

describe('Image upload and optimization', () => {
  it('processes uploaded image and generates multiple sizes', async () => {
    const file = await readTestImage('test-artwork.jpg');
    
    const response = await request(app)
      .post('/api/admin/media/upload')
      .attach('file', file, 'test-artwork.jpg')
      .expect(200);
    
    const media = response.body.media;
    expect(media.thumbnailUrl).toBeDefined();
    expect(media.smallUrl).toBeDefined();
    expect(media.mediumUrl).toBeDefined();
    expect(media.largeUrl).toBeDefined();
    expect(media.originalUrl).toBeDefined();
    
    // Verify CDN upload
    const thumbnailExists = await checkCDNFile(media.thumbnailUrl);
    expect(thumbnailExists).toBe(true);
  });
  
  it('rejects files larger than 10MB', async () => {
    const largeFile = await generateLargeImage(11 * 1024 * 1024);
    
    const response = await request(app)
      .post('/api/admin/media/upload')
      .attach('file', largeFile, 'large.jpg')
      .expect(400);
    
    expect(response.body.error.message).toContain('10MB');
  });
});
```

**3. End-to-End Tests (Playwright or Cypress)**

Test critical user workflows across the full stack:

```typescript
describe('Visitor artwork browsing flow', () => {
  it('allows visitor to browse collections and view artwork details', async () => {
    await page.goto('/');
    
    // Navigate to work page
    await page.click('nav a:has-text("Work")');
    await expect(page).toHaveURL('/work');
    
    // Select a collection
    await page.click('text=Portraits');
    await expect(page.locator('h1')).toContainText('Portraits');
    
    // View artwork details
    await page.click('.artwork-card').first();
    await expect(page.locator('.artwork-title')).toBeVisible();
    await expect(page.locator('.artwork-image')).toBeVisible();
    await expect(page.locator('.artwork-description')).toBeVisible();
  });
  
  it('allows visitor to submit contact inquiry', async () => {
    await page.goto('/contact');
    
    await page.fill('input[name="name"]', 'John Doe');
    await page.fill('input[name="email"]', 'john@example.com');
    await page.fill('input[name="subject"]', 'Commission Inquiry');
    await page.fill('textarea[name="message"]', 'I would like to discuss a commission piece.');
    
    await page.click('button:has-text("Send Message")');
    
    await expect(page.locator('.success-message')).toContainText('Thank you');
  });
});

describe('Artist artwork management workflow', () => {
  beforeEach(async () => {
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', 'artist@example.com');
    await page.fill('input[name="password"]', 'testpassword');
    await page.click('button:has-text("Login")');
  });
  
  it('allows artist to create new artwork', async () => {
    await page.click('nav a:has-text("Artwork")');
    await page.click('button:has-text("Create New")');
    
    // Fill artwork form
    await page.fill('input[name="title"]', 'New Painting');
    await page.fill('textarea[name="description"]', 'A beautiful new painting');
    await page.fill('input[name="medium"]', 'Oil on canvas');
    await page.fill('input[name="dimensions"]', '24x36 inches');
    await page.fill('input[name="year"]', '2024');
    
    // Upload image
    const fileInput = await page.locator('input[type="file"]');
    await fileInput.setInputFiles('./test-images/artwork.jpg');
    
    // Wait for upload to complete
    await expect(page.locator('.image-preview')).toBeVisible();
    
    // Select collection
    await page.selectOption('select[name="collectionId"]', 'portraits');
    
    // Publish
    await page.check('input[name="published"]');
    await page.click('button:has-text("Save")');
    
    // Verify success
    await expect(page.locator('.success-toast')).toContainText('Artwork created');
    
    // Verify artwork appears in public gallery
    await page.goto('/work');
    await expect(page.locator('text=New Painting')).toBeVisible();
  });
  
  it('allows artist to edit existing artwork', async () => {
    // Navigate to artwork list
    await page.click('nav a:has-text("Artwork")');
    
    // Edit first artwork
    await page.click('.artwork-row:first-child button:has-text("Edit")');
    
    // Update title
    await page.fill('input[name="title"]', 'Updated Title');
    await page.click('button:has-text("Save")');
    
    // Verify update in public gallery
    const slug = await page.locator('input[name="slug"]').inputValue();
    await page.goto(`/work/${slug}`);
    await expect(page.locator('h1')).toContainText('Updated Title');
  });
  
  it('shows auto-save indicator while editing', async () => {
    await page.click('nav a:has-text("Content")');
    await page.click('text=Biography');
    
    await page.fill('textarea', 'Updated biography text');
    
    // Wait for auto-save
    await expect(page.locator('.auto-save-indicator')).toContainText('Saving...');
    await expect(page.locator('.auto-save-indicator')).toContainText('Saved');
  });
});
```

**4. Accessibility Tests**

```typescript
describe('Accessibility compliance', () => {
  it('passes axe accessibility checks on homepage', async () => {
    await page.goto('/');
    const results = await new AxePuppeteer(page).analyze();
    expect(results.violations).toEqual([]);
  });
  
  it('passes axe checks on artwork detail page', async () => {
    await page.goto('/work/test-artwork');
    const results = await new AxePuppeteer(page).analyze();
    expect(results.violations).toEqual([]);
  });
  
  it('supports keyboard navigation', async () => {
    await page.goto('/');
    
    // Tab through navigation
    await page.keyboard.press('Tab');
    const firstLink = await page.evaluate(() => document.activeElement?.tagName);
    expect(firstLink).toBe('A');
    
    // Verify focus visible
    const hasFocusOutline = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      const styles = window.getComputedStyle(el);
      return styles.outline !== 'none';
    });
    expect(hasFocusOutline).toBe(true);
  });
  
  it('provides alt text for all images', async () => {
    await page.goto('/work');
    const imagesWithoutAlt = await page.locator('img:not([alt])').count();
    expect(imagesWithoutAlt).toBe(0);
  });
});
```


**5. Visual Regression Tests (Percy or Chromatic)**

Capture screenshots and detect unintended visual changes:

```typescript
describe('Visual regression tests', () => {
  it('matches homepage snapshot', async () => {
    await page.goto('/');
    await percySnapshot(page, 'Homepage - Desktop');
  });
  
  it('matches homepage on mobile', async () => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await percySnapshot(page, 'Homepage - Mobile');
  });
  
  it('matches artwork detail page', async () => {
    await page.goto('/work/test-artwork');
    await percySnapshot(page, 'Artwork Detail - Desktop');
  });
  
  it('matches dashboard artwork editor', async () => {
    await loginAsArtist();
    await page.goto('/admin/artwork/new');
    await percySnapshot(page, 'Dashboard - Artwork Editor');
  });
});
```

**6. Performance Tests**

```typescript
describe('Performance requirements', () => {
  it('loads homepage within 3 seconds on broadband', async () => {
    await page.emulateNetworkConditions({
      downloadThroughput: 625 * 1024, // 5 Mbps
      uploadThroughput: 625 * 1024,
      latency: 20,
    });
    
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
  });
  
  it('implements lazy loading for below-fold images', async () => {
    await page.goto('/');
    
    const belowFoldImages = await page.locator('img[loading="lazy"]').count();
    expect(belowFoldImages).toBeGreaterThan(0);
  });
  
  it('generates responsive image srcsets', async () => {
    await page.goto('/work/test-artwork');
    
    const img = await page.locator('.artwork-image img').first();
    const srcset = await img.getAttribute('srcset');
    
    expect(srcset).toContain('480w');
    expect(srcset).toContain('1024w');
    expect(srcset).toContain('1920w');
  });
});
```

**7. Security Tests**

```typescript
describe('Security', () => {
  it('prevents SQL injection in search queries', async () => {
    const maliciousInput = "'; DROP TABLE artwork; --";
    
    const response = await request(app)
      .get('/api/search')
      .query({ q: maliciousInput });
    
    // Should not throw error, should sanitize input
    expect(response.status).not.toBe(500);
    
    // Verify table still exists
    const artworkCount = await prisma.artwork.count();
    expect(artworkCount).toBeGreaterThan(0);
  });
  
  it('prevents XSS in user-generated content', async () => {
    const xssPayload = '<script>alert("XSS")</script>';
    
    await request(app)
      .post('/api/contact')
      .send({
        name: 'Test',
        email: 'test@example.com',
        subject: 'Test',
        message: xssPayload,
      });
    
    const inquiry = await prisma.inquiry.findFirst({
      where: { email: 'test@example.com' },
    });
    
    // Verify script is stored but will be escaped on render
    expect(inquiry?.message).toBe(xssPayload);
    
    // Verify React escapes it on render
    await page.goto('/admin/inquiries');
    await page.click(`.inquiry-row:has-text("${xssPayload.slice(0, 20)}")`);
    
    const scriptElements = await page.locator('script').count();
    // Only count our own app scripts, not injected ones
    expect(scriptElements).toBeLessThan(10); // arbitrary safe number
  });
  
  it('requires authentication for admin routes', async () => {
    const response = await request(app)
      .get('/api/admin/artwork')
      .expect(401);
    
    expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
  });
  
  it('validates CSRF token on mutations', async () => {
    await authenticateTestUser();
    
    const response = await request(app)
      .post('/api/admin/artwork')
      .set('X-CSRF-Token', 'invalid-token')
      .send({})
      .expect(403);
    
    expect(response.body.error.code).toBe('CSRF_ERROR');
  });
});
```

### Test Data Management

**Fixtures for consistent test data:**

```typescript
// fixtures/artwork.ts
export const testArtwork = {
  title: 'Test Landscape',
  slug: 'test-landscape',
  description: 'A beautiful landscape painting for testing',
  story: 'This artwork was created to test the system',
  medium: 'Oil on canvas',
  dimensions: '24x36 inches',
  year: 2024,
  availabilityStatus: 'AVAILABLE' as const,
  published: true,
};

// fixtures/collection.ts
export const testCollection = {
  name: 'Test Collection',
  slug: 'test-collection',
  description: 'A collection for testing purposes',
};

// Setup function
export async function seedTestData() {
  const collection = await prisma.collection.create({
    data: testCollection,
  });
  
  const mediaAsset = await prisma.mediaAsset.create({
    data: {
      filename: 'test-image.jpg',
      originalUrl: 'https://cdn.example.com/test-image.jpg',
      thumbnailUrl: 'https://cdn.example.com/test-image-thumb.jpg',
      smallUrl: 'https://cdn.example.com/test-image-small.jpg',
      mediumUrl: 'https://cdn.example.com/test-image-medium.jpg',
      largeUrl: 'https://cdn.example.com/test-image-large.jpg',
      width: 1920,
      height: 1080,
      size: 500000,
      mimeType: 'image/jpeg',
    },
  });
  
  const artwork = await prisma.artwork.create({
    data: {
      ...testArtwork,
      collectionId: collection.id,
      images: {
        create: {
          mediaAssetId: mediaAsset.id,
          order: 0,
          isPrimary: true,
        },
      },
    },
  });
  
  return { collection, artwork, mediaAsset };
}
```

### Continuous Integration

**GitHub Actions workflow:**

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:unit
      
  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test
  
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
      
  accessibility-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:a11y
```

### Test Coverage Goals

- **Unit tests**: 80% code coverage for utility functions and validation logic
- **Integration tests**: 100% coverage of API routes
- **E2E tests**: Cover all critical user paths (browse artwork, submit inquiry, create/edit content)
- **Accessibility tests**: 100% of public pages pass axe checks
- **Performance tests**: All pages meet performance requirements (homepage < 3s, detail pages < 2s)

### Manual Testing Checklist

Before each release, manually verify:

- [ ] Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] Responsive design on actual devices (not just browser DevTools)
- [ ] Image quality and optimization across different screen sizes
- [ ] Email notifications deliver correctly
- [ ] CDN serving images correctly
- [ ] Search engine indexing (verify sitemap, robots.txt, meta tags)
- [ ] Keyboard navigation flows naturally
- [ ] Screen reader announces content correctly (test with NVDA or JAWS)
- [ ] Form validation messages are clear and helpful
- [ ] Auto-save functionality works reliably
- [ ] Session timeout behavior is graceful

## Implementation Notes

### Development Workflow

1. **Setup**
   - Initialize Next.js project with TypeScript
   - Configure Tailwind CSS with custom design tokens
   - Set up Prisma with PostgreSQL
   - Configure environment variables for development/staging/production

2. **Phase 1: Database and Backend**
   - Define Prisma schema
   - Create database migrations
   - Implement API routes with validation
   - Set up authentication with NextAuth.js
   - Implement image upload and CDN integration

3. **Phase 2: Public Gallery**
   - Build design system components (buttons, cards, typography)
   - Implement page layouts
   - Create artwork and collection pages with SSG
   - Implement navigation and routing
   - Add SEO meta tags and structured data
   - Optimize images and lazy loading

4. **Phase 3: Artist Dashboard**
   - Build dashboard layout and navigation
   - Implement authentication pages (login)
   - Create CRUD interfaces for artwork, collections, recognition, testimonials
   - Implement media library
   - Create content editors with rich text support
   - Add auto-save functionality
   - Implement preview mode

5. **Phase 4: Polish and Optimization**
   - Accessibility audit and fixes
   - Performance optimization (code splitting, caching)
   - Error handling and loading states
   - Mobile responsiveness refinement
   - Browser compatibility testing

6. **Phase 5: Deployment and Monitoring**
   - Set up production environment (Vercel or AWS)
   - Configure CDN for media assets
   - Set up error tracking (Sentry)
   - Configure email service (SendGrid or AWS SES)
   - Set up analytics (optional, respect user privacy)
   - Create deployment pipeline (CI/CD)

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/sameeksha_arts"

# Authentication
NEXTAUTH_URL="https://sameeekshaarts.com"
NEXTAUTH_SECRET="generate-secure-random-string"

# CDN/Storage
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Email
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="your-sendgrid-api-key"
NOTIFICATION_EMAIL="sameeksha@example.com"

# Error Tracking
SENTRY_DSN="https://your-sentry-dsn"

# Feature Flags (optional)
ENABLE_AUTO_SAVE="true"
AUTO_SAVE_INTERVAL="30000"
```

### Security Considerations

1. **Password Storage**
   - Use Argon2 for password hashing
   - Implement password strength requirements (min 8 chars, mixed case, number)
   - Consider adding "forgot password" functionality in future

2. **Session Management**
   - Use HTTP-only, secure, SameSite cookies
   - Implement sliding session expiration (24 hours)
   - Add "remember me" option for extended sessions

3. **Input Validation**
   - Validate all inputs on both client and server
   - Sanitize user-generated content (contact form messages)
   - Implement rate limiting on public endpoints (contact form: 5 submissions per hour per IP)

4. **File Upload Security**
   - Validate file types by content (not just extension)
   - Implement file size limits (10MB per file)
   - Scan for malware (optional, via third-party service)
   - Use signed URLs for CDN uploads

5. **HTTPS Enforcement**
   - Redirect all HTTP requests to HTTPS
   - Set HSTS headers (Strict-Transport-Security)
   - Use secure cookies in production

### Performance Optimization

1. **Image Optimization**
   - Generate WebP with JPEG fallback
   - Implement responsive images with srcset
   - Use blur-up placeholders (LQIP - Low Quality Image Placeholder)
   - Lazy load below-fold images
   - Serve images from CDN with proper cache headers

2. **Code Splitting**
   - Split dashboard code from public gallery
   - Lazy load dashboard components
   - Use dynamic imports for large dependencies (rich text editor)

3. **Caching Strategy**
   - Static pages: Cache for 1 hour with revalidation
   - Images: Cache for 1 year (immutable URLs)
   - API responses: No cache for admin, short cache for public
   - Implement stale-while-revalidate pattern

4. **Database Optimization**
   - Add indexes on frequently queried fields
   - Implement database connection pooling
   - Use select statements to fetch only needed fields
   - Consider Redis for session storage (if scaling needed)

### Accessibility Implementation

1. **Semantic HTML**
   - Use `<nav>`, `<main>`, `<article>`, `<section>`, `<header>`, `<footer>`
   - Proper heading hierarchy (h1 → h2 → h3)
   - Use `<button>` for actions, `<a>` for navigation

2. **ARIA Labels**
   - Label all form inputs
   - Provide ARIA labels for icon buttons
   - Use `aria-live` regions for dynamic content updates
   - Implement skip navigation links

3. **Keyboard Navigation**
   - Ensure all interactive elements are keyboard accessible
   - Implement visible focus indicators
   - Support ESC key to close modals/dialogs
   - Support arrow keys in image gallery

4. **Color Contrast**
   - Text: minimum 4.5:1 contrast ratio
   - Large text (18pt+): minimum 3:1 contrast ratio
   - Test with contrast checker tools
   - Avoid relying solely on color to convey information

### SEO Implementation

1. **Meta Tags**
   ```tsx
   <Head>
     <title>Sameeksha Arts | Contemporary Indian Artist</title>
     <meta name="description" content="Explore the portfolio of Sameeksha, a contemporary Indian artist specializing in..." />
     <meta property="og:title" content="Sameeksha Arts" />
     <meta property="og:description" content="..." />
     <meta property="og:image" content="/og-image.jpg" />
     <meta property="og:type" content="website" />
     <meta name="twitter:card" content="summary_large_image" />
   </Head>
   ```

2. **Structured Data**
   ```json
   {
     "@context": "https://schema.org",
     "@type": "Person",
     "name": "Sameeksha",
     "jobTitle": "Artist",
     "url": "https://sameekshaarts.com",
     "sameAs": [
       "https://instagram.com/sameekshaarts",
       "https://facebook.com/sameekshaarts"
     ]
   }
   
   {
     "@context": "https://schema.org",
     "@type": "VisualArtwork",
     "name": "Artwork Title",
     "creator": {
       "@type": "Person",
       "name": "Sameeksha"
     },
     "dateCreated": "2024",
     "artMedium": "Oil on canvas",
     "image": "https://cdn.example.com/artwork.jpg"
   }
   ```

3. **Sitemap Generation**
   - Auto-generate sitemap.xml with all artwork and collection pages
   - Update sitemap when content is published
   - Submit sitemap to Google Search Console

4. **Robots.txt**
   ```
   User-agent: *
   Allow: /
   Disallow: /admin/
   Disallow: /api/
   
   Sitemap: https://sameekshaarts.com/sitemap.xml
   ```

### Future Enhancements

Potential features for future iterations:

1. **Multi-language Support**
   - Add i18n for English and Hindi
   - Translatable content fields in CMS

2. **Advanced Search**
   - Full-text search across artwork descriptions
   - Filter by medium, year, availability
   - Search suggestions and autocomplete

3. **Newsletter Integration**
   - Mailing list signup
   - Newsletter management in dashboard
   - Email campaigns for new artwork announcements

4. **Social Media Integration**
   - Instagram feed display
   - Social sharing buttons
   - Open Graph optimization for shares

5. **Analytics Dashboard**
   - Page view statistics
   - Popular artworks tracking
   - Inquiry conversion tracking
   - Visitor geography and demographics

6. **Multiple Admin Users**
   - Role-based permissions (admin, editor, viewer)
   - Audit log of content changes
   - User management interface

7. **Advanced Media Management**
   - Video support for process videos
   - Artwork zoom functionality
   - 360° artwork views

8. **E-commerce Integration**
   - Shopping cart functionality
   - Payment processing (Stripe, PayPal)
   - Order management
   - Shipping integration

## Summary

The Sameeksha Arts Website design provides a comprehensive, production-ready architecture for an artist portfolio platform with integrated CMS. The system prioritizes:

- **User experience**: Museum-quality presentation for visitors, intuitive management for the artist
- **Performance**: Fast loading times, optimized images, efficient caching
- **Accessibility**: WCAG 2.1 compliant, keyboard navigable, screen reader friendly
- **Security**: Protected admin access, input validation, secure file uploads
- **Maintainability**: Well-structured codebase, comprehensive testing, clear documentation

The technology choices (Next.js, PostgreSQL, Prisma, TypeScript) provide a modern, scalable foundation that can grow with the artist's needs. The testing strategy ensures reliability without over-testing, focusing on integration tests, end-to-end workflows, and accessibility compliance rather than property-based testing (which is not appropriate for this UI-heavy application).

The design addresses all 30 requirements from the requirements document, providing detailed specifications for implementation while leaving room for developer judgment on specific implementation details.

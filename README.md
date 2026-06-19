# Sameeksha Arts Website

A museum-quality artist portfolio website with integrated content management system (CMS) for contemporary Indian artist Sameeksha.

## 🎨 Project Overview

This is an **artist-first** digital gallery platform that prioritizes the artist's identity, story, and philosophy over marketplace behavior. The website presents Sameeksha's work in an elegant, museum-like environment while providing her with complete control over all content.

### Key Principles

- **Artist-first over marketplace** - Focus on identity, story, and emotional connection
- **Museum-quality presentation** - Elegant, sophisticated, calm interface
- **Non-technical CMS** - Artist can manage everything without developer assistance
- **Mobile-first responsive design** - Beautiful on all devices
- **Accessibility compliant** - WCAG 2.1 standards

## 🚀 Current Status: Frontend Prototype

This is a **frontend-only prototype** with static mock data. The backend API, database, and CMS will be implemented in subsequent phases.

### What's Built (Phase 1 - Frontend)

✅ **Project Setup**
- Next.js 14+ with TypeScript
- Tailwind CSS with custom design system
- Elegant color palette and typography
- Responsive breakpoints

✅ **Design System**
- Custom color scheme (primary, accent, neutral)
- Typography (Inter, Crimson Pro, Playfair Display)
- Reusable UI components (Button, etc.)
- Consistent spacing and styling

✅ **Core Components**
- Navigation (desktop & mobile responsive)
- Footer with social links
- ArtworkCard with hover effects
- Mock data structure

✅ **Public Pages**
- **Homepage** - Hero, artist intro, selected works, testimonials
- **About** - Biography, philosophy, studio information
- **Work** - Artwork grid with collection filtering
- **Artwork Detail** - Full artwork page with metadata and related works
- **Commissions** - Process, examples, commission types
- **Recognition** - Awards, exhibitions, collaborations
- **Contact** - Contact form and information

## 🛠️ Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Fonts**: Google Fonts (Inter, Crimson Pro, Playfair Display)
- **Images**: Next.js Image optimization

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The website will be available at [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm run start
```

## 📁 Project Structure

```
sameeksha-arts/
├── app/                      # Next.js App Router
│   ├── about/               # About page
│   ├── commissions/         # Commissions page
│   ├── contact/             # Contact page
│   ├── recognition/         # Recognition page
│   ├── work/                # Work listing & detail pages
│   │   └── [slug]/         # Dynamic artwork detail page
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Homepage
├── components/               # React components
│   ├── ui/                  # Base UI components
│   │   └── Button.tsx
│   ├── ArtworkCard.tsx      # Artwork display card
│   ├── Footer.tsx           # Site footer
│   └── Navigation.tsx       # Site navigation
├── lib/                      # Utilities and data
│   └── mockData.ts          # Mock data for prototype
├── public/                   # Static assets
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## 🎨 Design System

### Colors

**Primary Palette** (Museum-like beiges and taupes)
- `primary-50` to `primary-900`

**Accent Palette** (Warm earth tones)
- `accent-50` to `accent-900`

**Neutral Palette** (Grays)
- `neutral-50` to `neutral-900`

### Typography

- **Display**: Playfair Display (headings, titles)
- **Serif**: Crimson Pro (body text for elegant sections)
- **Sans**: Inter (UI elements, navigation)

### Responsive Breakpoints

- Mobile: `320px - 767px`
- Tablet: `768px - 1023px`
- Desktop: `1024px+`

## 📝 Mock Data

All content is currently using placeholder data defined in `lib/mockData.ts`:

- **Artworks**: 6 sample artworks with placeholder images
- **Collections**: 4 collections (Portraits, Landscapes, Madhubani, Spiritual Works)
- **Recognition**: Sample awards, exhibitions, collaborations
- **Testimonials**: Placeholder client testimonials
- **Homepage/About/Commission Content**: Placeholder text in brackets `[...]`

**Important**: Placeholder images use [placehold.co](https://placehold.co) service. Replace with real artwork images when available.

## 🔄 What's Next (Not Yet Implemented)

### Phase 2: Backend & Database
- PostgreSQL database setup
- Prisma ORM configuration
- API routes for CRUD operations
- NextAuth.js authentication
- Image upload & optimization pipeline (Sharp + Cloudinary/S3)

### Phase 3: Artist Dashboard (CMS)
- Admin authentication
- Artwork management (create, edit, delete, reorder)
- Collection management
- Recognition & testimonial management
- Media library
- Content editors for homepage, about, commissions
- Inquiry management
- Auto-save functionality

### Phase 4: Advanced Features
- Contact form email notifications
- SEO optimization (sitemap, structured data)
- Accessibility audit & improvements
- Performance optimization
- Testing suite

### Phase 5: Deployment
- Production environment setup
- CDN configuration
- Monitoring & error tracking

## 🎯 Key Features (Design Goals)

### For Visitors
- ✨ Beautiful, museum-like browsing experience
- 📱 Fully responsive on all devices
- ♿ Accessible navigation and content
- 🎨 Rich artwork presentation with context
- 💌 Easy contact and commission inquiry

### For the Artist (CMS - Not Yet Built)
- 🖼️ Upload and manage artwork independently
- 📝 Edit all website content without coding
- 📊 View and manage client inquiries
- 🔄 Auto-save to prevent data loss
- 👁️ Preview before publishing
- 📱 Manage from mobile or desktop

## 🎨 Design Philosophy

This website follows the master project brief's core principles:

1. **The website is about Sameeksha** - The artist comes before the inventory
2. **Museum-like presentation** - Elegant, sophisticated, intentional
3. **No marketplace behavior** - Focus on story, trust, and philosophy
4. **Complete artist independence** - Non-technical CMS for self-management

### Three Questions the Website Answers

1. **Who is Sameeksha?** (About page, artist introduction)
2. **Why should I trust her?** (Recognition, testimonials)
3. **Can she create something meaningful for me?** (Commissions, portfolio)

## 📋 Content Guidelines

When replacing placeholder content:

### DO
- Use structured placeholders in brackets `[Content]`
- Keep artist-first philosophy
- Focus on storytelling and emotional connection
- Emphasize quality over quantity

### DON'T
- Invent fake awards, exhibitions, or testimonials
- Add marketplace language ("buy now", "add to cart")
- Use sales-heavy copy
- Add cluttered or busy elements

## 🔗 Navigation Structure

```
├── Home (/)
├── About (/about)
├── Work (/work)
│   ├── Collection Filter
│   └── Artwork Detail (/work/[slug])
├── Commissions (/commissions)
├── Recognition (/recognition)
└── Contact (/contact)
```

## 📱 Responsive Design

The website is fully responsive with careful attention to:

- **Mobile** (320px - 767px): Stacked layouts, hamburger menu, touch-friendly
- **Tablet** (768px - 1023px): Adaptive grid layouts
- **Desktop** (1024px+): Full multi-column layouts

## ♿ Accessibility

Following WCAG 2.1 AA standards:

- Semantic HTML structure
- Keyboard navigation support
- Focus indicators
- Color contrast ratios (4.5:1 for text)
- Alt text for images
- ARIA labels where needed

## 📄 License

This project is private and proprietary. All rights reserved.

## 👤 About

Created for Sameeksha, a contemporary Indian artist specializing in portraits, landscapes, and traditional art forms.

---

**Note**: This is currently a frontend prototype. Backend functionality, database, and CMS will be implemented in subsequent development phases.

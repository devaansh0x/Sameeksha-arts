# Sameeksha Arts

Portfolio website and artist CMS for Sameeksha, a contemporary Indian painter based in Delhi.

---

## What this is

Two things in one project:

- **Public gallery** — the visitor-facing website at `/`
- **Artist dashboard** — a private CMS at `/admin` where Sameeksha manages all content

The public site is fully built and running on mock data. The admin portal is fully built with mock data. Both are ready to connect to a real database when content is provided.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS with custom museum palette |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth.js (credentials, JWT) |
| Password hashing | Argon2 |
| Media storage | Cloudinary |
| Image processing | Sharp |
| Email | Nodemailer |
| Validation | Zod |

---

## Project structure

```
app/
  page.tsx                  Homepage
  about/                    About the artist
  work/                     Gallery + individual artwork pages
  commissions/              Commission information
  recognition/              Awards and exhibitions
  contact/                  Contact form
  admin/                    Artist dashboard (protected)
    login/                  Login page
    artworks/               Manage paintings
    collections/            Manage collections
    media/                  Image library
    inquiries/              Contact form inbox
    content/                Edit page text and quotes
    recognition/            Manage awards/exhibitions
    testimonials/           Manage testimonials
    settings/               Password change
  api/
    admin/*                 Protected API routes
    artwork/                Public artwork endpoint
    contact/                Contact form submission
    content/                Public page content
    auth/                   NextAuth handler

components/
  gallery/                  Public-facing components
  admin/                    Admin layout and shared components
  ui/                       Button, etc.
  common/                   Reveal animation, ScrollProgress, ThemeToggle

lib/
  admin/mockAdminData.ts    Admin mock data (replace with API calls)
  utils/mockData.ts         Public mock data (replace with DB queries)
  auth/                     Session helpers
  database/                 Prisma singleton
  media/                    Cloudinary + Sharp pipeline
  validation/               Zod schemas

prisma/
  schema.prisma             Full database schema
  seed.ts                   Seed script with sample data
```

---

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — public site.
Open [http://localhost:3000/admin](http://localhost:3000/admin) — admin dashboard.

No database is needed to view the frontend. Both the public site and admin portal run entirely on mock data.

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

```env
# Required for auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=any-random-string-here

# Required when connecting the database
DATABASE_URL=postgresql://user:password@host:5432/sameeksha_arts

# Required for media uploads
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Required for contact form emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@sameekshaarts.com
CONTACT_EMAIL_TO=
```

---

## Database setup

Once a PostgreSQL database is available:

```bash
npx prisma generate       # generate the client
npx prisma migrate dev    # run migrations
npm run db:seed           # seed with sample data
```

Default admin login after seeding:
- Email: `admin@sameekshaarts.com`
- Password: `changeme123` ← change this immediately

---

## Deploying to Vercel

The quickest path to a live URL:

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project
3. Add environment variables (at minimum `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`)
4. For a free PostgreSQL database, use [Neon](https://neon.tech) — takes about 2 minutes to set up
5. Deploy

Vercel automatically runs `npm install` (which triggers `prisma generate` via the `postinstall` script) then `npm run build`.

---

## Current status

**Done:**
- Full public gallery — homepage, about, work, commissions, recognition, contact
- Gallery filtering by collection and tags (medium, subject, style, availability)
- Full admin portal — all CRUD screens, media library, inquiry inbox, page content editor
- All backend API routes
- Authentication middleware

**Pending (requires real data):**
- Wire public pages to live database instead of mock data
- Wire admin actions to real API calls instead of local state
- Upload real artwork images and content
- Connect `getUserByEmail` in auth to Prisma query

---

## Pages

| URL | Description |
|---|---|
| `/` | Homepage — hero, artist intro, selected works, commissions, recognition, testimonials, contact |
| `/about` | Artist biography, philosophy, studio |
| `/work` | Full gallery with collection + tag filtering |
| `/work/[slug]` | Individual artwork detail |
| `/commissions` | Commission types, process, examples |
| `/recognition` | Awards, exhibitions, collaborations, press |
| `/contact` | Contact form |
| `/admin` | Dashboard overview (requires login) |
| `/admin/login` | Admin login |

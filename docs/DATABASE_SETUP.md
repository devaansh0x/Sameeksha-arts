# Database Setup Guide — Sameeksha Arts Website

## Quick Start

Once you have a PostgreSQL database (local or cloud), the whole setup runs in one command:

```bash
npm run db:setup
```

That command runs `db:generate` → `db:push` → `db:seed` in sequence.

---

## Step 1 — Get a PostgreSQL Database

### Option A: Cloud (easiest, free tiers available)

| Provider | Free tier | Notes |
|----------|-----------|-------|
| [Supabase](https://supabase.com) | ✅ | Settings → Database → Connection string |
| [Neon](https://neon.tech) | ✅ | Branch-based, serverless-friendly |
| [Railway](https://railway.app) | ✅ | Add PostgreSQL service, copy DATABASE_URL |

### Option B: Local PostgreSQL

```bash
# macOS
brew install postgresql@16 && brew services start postgresql@16

# Ubuntu/Debian
sudo apt install postgresql && sudo systemctl start postgresql
```

Create the database:

```sql
CREATE DATABASE sameeksha_arts;
CREATE USER sameeksha_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE sameeksha_arts TO sameeksha_user;
```

### Option C: Docker (no installation needed)

```bash
docker run --name sameeksha-db \
  -e POSTGRES_PASSWORD=mypassword \
  -e POSTGRES_DB=sameeksha_arts \
  -p 5432:5432 \
  -d postgres:16
```

---

## Step 2 — Configure DATABASE_URL

Edit `.env` and set `DATABASE_URL`:

```env
# Local PostgreSQL
DATABASE_URL="postgresql://sameeksha_user:your_password@localhost:5432/sameeksha_arts"

# Cloud (Supabase, Neon, etc.) — always add sslmode=require
DATABASE_URL="postgresql://user:password@host:5432/db?sslmode=require"

# Docker (from Step 1C)
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/sameeksha_arts"
```

> **Note:** The `prisma.config.ts` file reads `DATABASE_URL` from the environment.
> Make sure `.env` is updated — `.env.local` is loaded by Next.js but **not** by the Prisma CLI.

---

## Step 3 — Run Setup

```bash
npm run db:setup
```

This single command:
1. Generates the Prisma Client (`db:generate`)
2. Creates all database tables and indexes (`db:push`)
3. Seeds the database with sample data (`db:seed`)

Or run each step manually:

```bash
npm run db:generate    # Generate Prisma Client
npm run db:migrate     # Create migration + apply (alternative to db:push)
npm run db:seed        # Insert sample data
```

---

## What Gets Seeded

| Table | Records created |
|-------|----------------|
| User | 1 admin user |
| Collection | Portraits, Landscapes, Spiritual Works |
| Artwork | 5 sample artworks (published) |
| Recognition | 5 entries (award, 2 exhibitions, press, residency) |
| Testimonial | 4 client testimonials |
| PageContent | Homepage, About, Commissions |

**Admin credentials:**
- Email: `admin@sameekshaarts.com`
- Password: `changeme123`

⚠️ **Change the password immediately after your first login.**

---

## Database Schema

9 tables covering all content types:

- **User** — Admin authentication (Argon2 password hashing)
- **Artwork** — Portfolio entries with metadata
- **Collection** — Groupings of artworks
- **MediaAsset** — Uploaded images with multi-resolution URLs
- **ArtworkImage** — Join table (artwork ↔ media, with ordering)
- **Recognition** — Awards, exhibitions, press, collaborations
- **Testimonial** — Client testimonials with display ordering
- **Inquiry** — Contact form submissions
- **PageContent** — Flexible JSON content for homepage, about, commissions

---

## Management Commands

```bash
npm run db:generate       # Regenerate Prisma Client after schema changes
npm run db:migrate        # Create a new migration and apply it
npm run db:push           # Push schema changes without migration history
npm run db:seed           # Reseed the database
npm run db:reset          # ⚠️ Drop and recreate database (loses all data)
npm run db:studio         # Open Prisma Studio (visual data browser)
npm run db:migrate:prod   # Deploy migrations to production
```

---

## Prisma Client Usage

```typescript
import prisma from '@/lib/prisma';

// Get all published artworks with images
const artworks = await prisma.artwork.findMany({
  where: { published: true },
  include: {
    collection: true,
    images: {
      include: { mediaAsset: true },
      orderBy: { order: 'asc' },
    },
  },
});

// Create an artwork
const artwork = await prisma.artwork.create({
  data: {
    title: 'New Work',
    slug: 'new-work',
    description: '...',
    story: '...',
    medium: 'Oil on canvas',
    dimensions: '60 × 80 cm',
    year: 2024,
    availabilityStatus: 'AVAILABLE',
    published: false,
  },
});
```

---

## Troubleshooting

**"Can't reach database server"**
- Check `DATABASE_URL` in `.env` (not `.env.local`)
- For cloud databases, check if your IP is whitelisted
- For local PostgreSQL, check the service is running: `pg_isready`

**"SSL connection error"**
- Add `?sslmode=require` to `DATABASE_URL`

**"Authentication failed"**
- Verify username/password in `DATABASE_URL` match what you created

**"Prisma Client not generated"**
- Run `npm run db:generate`, then restart your editor's TypeScript server

**"P1012 url not supported in schema"**
- This project uses Prisma 7 — the `url` field lives in `prisma.config.ts`, not `schema.prisma`. Do not add `url =` to the datasource block.

---

## Production Checklist

- [ ] `DATABASE_URL` points to production database with `sslmode=require`
- [ ] Run `npm run db:migrate:prod` (not `db:push`) for production deploys
- [ ] Admin password changed from default
- [ ] `.env` not committed to version control (already in `.gitignore`)
- [ ] Database backups enabled on your cloud provider

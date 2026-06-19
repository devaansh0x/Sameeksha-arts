# Task 2.3: Run Prisma Migrations and Seed Database - Completion Guide

## Task Overview

**Task ID**: 2.3  
**Task Name**: Run Prisma migrations and seed database  
**Status**: Ready to execute (requires database connection)  
**Phase**: Phase 1 - Project Setup & Infrastructure

### Task Details

- Run Prisma migrations to create database tables
- Create database seeding script with initial data (admin user, sample content)
- Test database connectivity
- Follow the database setup specifications from the design document

## Prerequisites Completed

✅ **Prisma schema defined** (`prisma/schema.prisma`)
  - All 9 data models defined (User, Artwork, Collection, MediaAsset, ArtworkImage, Recognition, Testimonial, Inquiry, PageContent)
  - All enums defined (AvailabilityStatus, RecognitionType, InquiryStatus)
  - All indexes configured for performance

✅ **Seed script created** (`prisma/seed.ts`)
  - Creates default admin user (admin@sameekshaarts.com / changeme123)
  - Creates default page content (homepage, about, commissions)
  - Creates sample collection
  - Uses placeholder content in [brackets]

✅ **Migration automation script** (`scripts/run-migrations.ts`)
  - Automated 5-step setup process
  - Connection testing
  - Client generation
  - Migration execution
  - Database seeding
  - Setup verification

✅ **Package.json scripts**
  - `npm run db:setup` - Complete automated setup
  - `npm run db:generate` - Generate Prisma Client
  - `npm run db:migrate` - Run migrations
  - `npm run db:seed` - Seed initial data
  - `npm run db:test` - Test connection
  - `npm run db:studio` - Browse data in Prisma Studio

## Current Blocker

⚠️ **Database Connection Required**

The task cannot be completed without a working PostgreSQL database connection. The current DATABASE_URL in `.env` is configured for Prisma's local development server:

```
DATABASE_URL="prisma+postgres://localhost:51213/..."
```

This requires the Prisma Postgres server to be running, which is encountering startup issues due to network/npm certificate errors.

## How to Complete This Task

### Step 1: Set Up Database Connection

Choose one of these options:

#### Option A: Cloud Database (Easiest - Recommended)

**Supabase (Free Tier)**
1. Go to https://supabase.com
2. Sign up and create a new project
3. Wait for project initialization (2-3 minutes)
4. Go to Settings → Database
5. Copy the "Connection string" (use Pooler for serverless)
6. Update `.env`:
   ```env
   DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
   ```

**Railway (Free Tier)**
1. Go to https://railway.app
2. Create new project
3. Click "+ New" → Database → PostgreSQL
4. Click on the PostgreSQL service → Variables tab
5. Copy the DATABASE_URL value
6. Update `.env` with the copied URL

**Neon (Free Tier)**
1. Go to https://neon.tech
2. Create an account and new project
3. Copy the connection string shown
4. Update `.env`:
   ```env
   DATABASE_URL="postgresql://[user]:[password]@[host]/[dbname]?sslmode=require"
   ```

#### Option B: Local PostgreSQL

If you have PostgreSQL installed:

```bash
# Create database and user
psql -U postgres
```

```sql
CREATE DATABASE sameeksha_arts;
CREATE USER sameeksha_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE sameeksha_arts TO sameeksha_user;
\q
```

Update `.env`:
```env
DATABASE_URL="postgresql://sameeksha_user:your_secure_password@localhost:5432/sameeksha_arts"
```

#### Option C: Docker PostgreSQL

```bash
docker run --name sameeksha-postgres \
  -e POSTGRES_PASSWORD=mypassword \
  -e POSTGRES_DB=sameeksha_arts \
  -p 5432:5432 \
  -d postgres:16
```

Update `.env`:
```env
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/sameeksha_arts"
```

### Step 2: Run Automated Setup

Once you have a valid DATABASE_URL in `.env`, run the automated setup:

```bash
npm run db:setup
```

This single command will:
1. ✓ Test database connection
2. ✓ Generate Prisma Client
3. ✓ Run migrations (create all tables)
4. ✓ Seed initial data
5. ✓ Verify setup

**Expected output:**
```
============================================================
DATABASE MIGRATION AND SETUP
============================================================

[Step 1] Testing database connection...
✓ Database connection successful!

[Step 2] Generating Prisma Client...
✓ Prisma Client generated successfully!

[Step 3] Running database migrations...
✓ Migrations completed successfully!

[Step 4] Seeding database with initial data...
✓ Database seeded successfully!

[Step 5] Verifying database setup...
✓ Database setup verified successfully!

============================================================
✓ DATABASE SETUP COMPLETE!
============================================================
```

### Step 3: Verify Setup

#### View Data in Prisma Studio

```bash
npm run db:studio
```

This opens a web interface at http://localhost:5555 where you can:
- Browse all tables
- View seed data
- Edit records
- Test queries

#### Test Database Connection

```bash
npm run db:test
```

Or manually:
```bash
npx tsx test-db-connection.ts
```

#### Verify Tables Created

The following tables should exist:
- User
- Artwork
- Collection
- MediaAsset
- ArtworkImage
- Recognition
- Testimonial
- Inquiry
- PageContent

#### Verify Seed Data

**User table:**
- 1 record: admin@sameekshaarts.com

**PageContent table:**
- 3 records: homepage, about, commissions

**Collection table:**
- 1 record: Sample Collection

### Step 4: Test Admin Login

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to: http://localhost:3000/admin/login

3. Log in with default credentials:
   - Email: `admin@sameekshaarts.com`
   - Password: `changeme123`

4. **IMPORTANT**: Change the password immediately after first login!

## Alternative: Manual Step-by-Step Execution

If you prefer to run each step manually:

```bash
# 1. Test connection first
npm run db:test

# 2. Generate Prisma Client
npm run db:generate

# 3. Run migrations
npm run db:migrate

# 4. Seed database
npm run db:seed

# 5. Open Prisma Studio to verify
npm run db:studio
```

## What Gets Created

### Database Schema

**9 Tables Created:**

1. **User**
   - Admin authentication and user management
   - Argon2 password hashing

2. **Artwork**
   - Complete artwork records
   - Relationships to Collection and Images
   - Indexes on collectionId, availabilityStatus, published, createdAt

3. **Collection**
   - Artwork groupings/categories
   - Unique name and slug

4. **MediaAsset**
   - Uploaded images with multiple resolutions
   - Stores: thumbnail, small, medium, large, original URLs
   - Dimensions, file size, MIME type

5. **ArtworkImage**
   - Join table linking Artwork to MediaAsset
   - Ordering and primary image tracking

6. **Recognition**
   - Awards, exhibitions, press mentions, collaborations
   - Type enum: AWARD, EXHIBITION, INSTITUTIONAL_COLLABORATION, PRESS

7. **Testimonial**
   - Client testimonials with ordering
   - Optional client title

8. **Inquiry**
   - Contact form submissions
   - Status: UNREAD, READ, ARCHIVED

9. **PageContent**
   - Flexible JSON-based content storage
   - Pages: homepage, about, commissions

### Initial Data Seeded

**1 Admin User**
```
Email: admin@sameekshaarts.com
Password: changeme123 (MUST BE CHANGED!)
Name: Sameeksha Admin
```

**3 Page Content Records**

Homepage content with sections:
- Hero (artwork, heading, subheading)
- Introduction (heading, text)
- Selected works (artwork IDs)
- Artist's world (heading, text, image)
- Commission invitation (heading, text)
- Contact invitation (heading, text)

About page content:
- Biography (text, portrait URL)
- Philosophy (heading, text)
- Studio (heading, text, image URL)

Commissions page content:
- Process (heading, steps)
- Examples (artwork IDs)
- Stories (array)
- Invitation (heading, text)

All content uses `[placeholder notation]` to indicate it should be replaced with real content.

**1 Sample Collection**
```
Name: Sample Collection
Slug: sample-collection
Description: This is a placeholder collection. Replace with your actual collections.
```

### Migration Files Created

```
prisma/migrations/
├── [timestamp]_init/
│   └── migration.sql
└── migration_lock.toml
```

The migration file contains all SQL commands to create the tables, indexes, and constraints.

## Troubleshooting

### "Can't reach database server"

**Cause**: DATABASE_URL is incorrect or database isn't running

**Solution**:
1. Verify DATABASE_URL format in `.env`
2. Test connection: `npm run db:test`
3. For cloud databases, check if IP is whitelisted
4. For local databases, ensure PostgreSQL is running

### "SSL connection error"

**Cause**: Cloud database requires SSL

**Solution**: Add `?sslmode=require` to DATABASE_URL:
```env
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

### "Database does not exist"

**Cause**: Database not created

**Solution**: Create the database first (see Step 1 options above)

### "Authentication failed"

**Cause**: Incorrect username/password

**Solution**: Verify credentials in DATABASE_URL match created user

### "Prisma Client not generated"

**Cause**: Prisma Client generation failed or not run

**Solution**:
```bash
npm run db:generate
# Then restart your editor/TypeScript server
```

### "Migration failed"

**Cause**: Schema syntax error or database connection issue

**Solution**:
1. Check schema syntax: `npx prisma format`
2. Validate schema: `npx prisma validate`
3. Check database connection: `npm run db:test`
4. Reset if needed: `npm run db:reset` (WARNING: Deletes all data)

## Task Completion Checklist

This task (2.3) is complete when:

- [ ] DATABASE_URL is configured and working
- [ ] Prisma Client is generated (`node_modules/.prisma/client` exists)
- [ ] Migrations have run successfully (all 9 tables created)
- [ ] Seed data is inserted (1 user, 3 page contents, 1 collection)
- [ ] Database connectivity is verified (`npm run db:test` passes)
- [ ] Prisma Studio can connect and display data
- [ ] Admin login works with default credentials

## Security Reminder

⚠️ **CRITICAL SECURITY STEPS**

After completing setup:

1. **Change default admin password immediately**
   - Log in to http://localhost:3000/admin/login
   - Go to Settings → Change Password
   - Use a strong, unique password

2. **Never commit `.env` file**
   - Already in `.gitignore`
   - Contains sensitive database credentials

3. **Use strong DATABASE_URL password in production**
   - Mix of letters, numbers, symbols
   - At least 16 characters

4. **Enable SSL for production databases**
   - Add `?sslmode=require` to DATABASE_URL

## Next Steps

After completing Task 2.3:

**Immediate next task:** Task 4.3 - Create media upload API endpoint

**You can also:**
- View your data: `npm run db:studio`
- Test authentication: Log in to admin dashboard
- Start implementing API endpoints (Phase 2)
- Begin building UI components (Phase 3)

## Files Created/Modified

### Created
- ✅ `docs/DATABASE_MIGRATION_STATUS.md` - Current status and solutions
- ✅ `scripts/run-migrations.ts` - Automated setup script
- ✅ `test-db-connection.ts` - Connection testing utility
- ✅ `docs/TASK_2.3_COMPLETION_GUIDE.md` - This file

### Modified
- ✅ `package.json` - Added `db:setup` script

### Pre-existing (from Task 2.1 and 2.2)
- `prisma/schema.prisma` - Complete database schema
- `prisma/seed.ts` - Seeding script
- `.env` - DATABASE_URL configuration
- `docs/DATABASE_SETUP.md` - General database documentation

## Resources

- [Prisma Migrate Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Seeding Docs](https://www.prisma.io/docs/guides/database/seed-database)
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Detailed setup guide
- [DATABASE_MIGRATION_STATUS.md](./DATABASE_MIGRATION_STATUS.md) - Current status
- [Supabase Docs](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Railway Docs](https://docs.railway.app/databases/postgresql)
- [Neon Docs](https://neon.tech/docs/get-started-with-neon/connect-neon)

## Support

Need help?

1. Check documentation:
   - `docs/DATABASE_MIGRATION_STATUS.md`
   - `docs/DATABASE_SETUP.md`

2. Test connection: `npm run db:test`

3. Check Prisma logs in terminal

4. Prisma Community:
   - Discord: https://pris.ly/discord
   - GitHub: https://github.com/prisma/prisma/issues

## Summary

This task sets up the complete database infrastructure for the Sameeksha Arts Website. Once completed, you'll have:

- ✅ All database tables created and indexed
- ✅ Initial admin user for dashboard access
- ✅ Default page content structure
- ✅ Sample collection
- ✅ Ready for API development
- ✅ Ready for CMS implementation

The blocker is the database connection. Choose a database solution from Step 1, update the DATABASE_URL, and run `npm run db:setup` to complete the task.

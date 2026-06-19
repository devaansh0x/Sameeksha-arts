# Quick Start: Database Setup

## Current Status

⚠️ **Database connection required to complete Task 2.3**

## Fastest Path to Completion (5 minutes)

### Option 1: Supabase (Recommended - Free)

1. **Create account**: https://supabase.com
2. **Create project** → Wait 2-3 minutes
3. **Get connection string**: Settings → Database → Copy "Connection string (pooler)"
4. **Update `.env`**:
   ```env
   DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
   ```
5. **Run setup**:
   ```bash
   npm run db:setup
   ```
6. **Done!** → Log in at http://localhost:3000/admin/login
   - Email: admin@sameekshaarts.com
   - Password: changeme123

### Option 2: Railway (Alternative - Free)

1. **Visit**: https://railway.app
2. **New Project** → Add PostgreSQL
3. **Copy DATABASE_URL** from Variables tab
4. **Update `.env`** with copied URL
5. **Run setup**: `npm run db:setup`

### Option 3: Docker (Local)

```bash
# Start PostgreSQL
docker run --name sameeksha-postgres -e POSTGRES_PASSWORD=mypassword -e POSTGRES_DB=sameeksha_arts -p 5432:5432 -d postgres:16

# Update .env
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/sameeksha_arts"

# Run setup
npm run db:setup
```

## What Happens During Setup

```bash
npm run db:setup
```

Automatically runs:
1. ✓ Tests database connection
2. ✓ Generates Prisma Client
3. ✓ Creates all database tables (9 tables)
4. ✓ Seeds initial data (admin user, page content, sample collection)
5. ✓ Verifies setup

## Default Admin Credentials

**Email**: admin@sameekshaarts.com  
**Password**: changeme123  
⚠️ **CHANGE THIS IMMEDIATELY AFTER FIRST LOGIN**

## Verify Setup

```bash
# View data in browser
npm run db:studio

# Test connection
npm run db:test
```

## Troubleshooting

**Connection failed?**
- Check DATABASE_URL format in `.env`
- For cloud databases: Add `?sslmode=require` to URL
- Run: `npm run db:test` to diagnose

**Need help?**
- See: `docs/TASK_2.3_COMPLETION_GUIDE.md` (detailed guide)
- See: `docs/DATABASE_MIGRATION_STATUS.md` (troubleshooting)
- See: `docs/DATABASE_SETUP.md` (full documentation)

## Manual Steps (if needed)

```bash
npm run db:generate   # Generate Prisma Client
npm run db:migrate    # Create tables
npm run db:seed       # Add initial data
npm run db:test       # Verify
```

## Database Tables Created

✅ User, Artwork, Collection, MediaAsset, ArtworkImage, Recognition, Testimonial, Inquiry, PageContent

## Next Steps

1. Complete database setup (5 minutes)
2. Test admin login
3. Change default password
4. Continue with Task 4.3 (media upload API)

---

**Need detailed instructions?** → `docs/TASK_2.3_COMPLETION_GUIDE.md`

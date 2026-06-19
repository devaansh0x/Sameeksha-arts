# Database Migration Status - Task 2.3

## Current Status

**Task**: Run Prisma migrations and seed database  
**Status**: ⚠️ **Blocked - Database server not available**

## Issue

The current `DATABASE_URL` in `.env` is configured to use Prisma's local development database server:

```
DATABASE_URL="prisma+postgres://localhost:51213/..."
```

This requires the Prisma Postgres local development server to be running, which can be started with:
```bash
npx prisma dev
```

However, the Prisma dev server is encountering issues starting due to:
1. Network/certificate verification errors when downloading dependencies
2. The `@prisma/cli-dev` package installation is failing

## Solutions

### Option 1: Use Alternative PostgreSQL Database (Recommended)

Replace the DATABASE_URL with a connection to a different PostgreSQL instance:

#### A. Cloud PostgreSQL (Easiest - Free Tier Available)

**Supabase** (Recommended)
1. Visit https://supabase.com and create a free account
2. Create a new project
3. Go to Settings → Database
4. Copy the "Connection string" (pooler mode recommended for serverless)
5. Update `.env`:
   ```env
   DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
   ```

**Railway**
1. Visit https://railway.app
2. Create new project → Add PostgreSQL
3. Copy the connection string
4. Update `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:[password]@[host]:5432/railway"
   ```

**Neon**
1. Visit https://neon.tech
2. Create a new project
3. Copy the connection string
4. Update `.env`:
   ```env
   DATABASE_URL="postgresql://[user]:[password]@[host]/[dbname]?sslmode=require"
   ```

#### B. Local PostgreSQL

If you have PostgreSQL installed locally:

1. Create the database:
   ```sql
   CREATE DATABASE sameeksha_arts;
   CREATE USER sameeksha_user WITH ENCRYPTED PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE sameeksha_arts TO sameeksha_user;
   ```

2. Update `.env`:
   ```env
   DATABASE_URL="postgresql://sameeksha_user:your_secure_password@localhost:5432/sameeksha_arts"
   ```

#### C. Docker PostgreSQL

```bash
# Start PostgreSQL in Docker
docker run --name sameeksha-postgres -e POSTGRES_PASSWORD=mypassword -e POSTGRES_DB=sameeksha_arts -p 5432:5432 -d postgres:16

# Update .env
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/sameeksha_arts"
```

### Option 2: Fix Prisma Dev Server (Advanced)

If you want to continue using Prisma's local development server:

1. Try fixing npm certificate issues:
   ```bash
   npm config set strict-ssl false  # Temporary workaround
   npx prisma dev
   npm config set strict-ssl true   # Re-enable after
   ```

2. Or manually download and install the CLI:
   ```bash
   npm install -g @prisma/cli-dev@latest
   prisma dev
   ```

## Next Steps

Once you have a working DATABASE_URL:

### 1. Update Environment Variable
Edit `.env` file with the new DATABASE_URL

### 2. Generate Prisma Client
```bash
npm run db:generate
```

### 3. Run Migrations
```bash
npm run db:migrate
```

This will:
- Create all database tables
- Set up relationships and indexes
- Create migration history

### 4. Seed Initial Data
```bash
npm run db:seed
```

This creates:
- Default admin user: `admin@sameekshaarts.com` / `changeme123`
- Default page content (homepage, about, commissions)
- Sample collection

### 5. Verify Setup
```bash
npm run db:test
```

Or use Prisma Studio to browse the data:
```bash
npm run db:studio
```

## Migration Files

Once migrations run successfully, you'll see:

```
prisma/migrations/
├── 20240614_init/
│   └── migration.sql
└── migration_lock.toml
```

## Seed Data Created

The seed script (`prisma/seed.ts`) creates:

1. **Admin User**
   - Email: admin@sameekshaarts.com
   - Password: changeme123
   - ⚠️ **MUST be changed after first login**

2. **Page Content**
   - Homepage content (hero, introduction, sections)
   - About page content (biography, philosophy, studio)
   - Commissions page content (process, examples, stories)
   - All content uses `[bracket notation]` for placeholders

3. **Sample Collection**
   - Name: "Sample Collection"
   - Slug: "sample-collection"
   - Can be deleted and replaced with real collections

## Database Schema

Tables created by migrations:

- **User** - Admin authentication
- **Artwork** - Complete artwork records
- **Collection** - Artwork groupings
- **MediaAsset** - Uploaded images (multi-resolution)
- **ArtworkImage** - Artwork-to-image associations (with ordering)
- **Recognition** - Awards, exhibitions, press
- **Testimonial** - Client testimonials
- **Inquiry** - Contact form submissions
- **PageContent** - Flexible JSON-based content

## Testing Database Connection

After updating DATABASE_URL, test the connection:

```bash
npx tsx test-db-connection.ts
```

This will:
- Verify database connectivity
- Execute a test query
- List all tables
- Show any connection errors

## Troubleshooting

### "Can't reach database server"
- Verify DATABASE_URL is correct
- Ensure database server is running
- Check firewall/network settings
- For cloud databases, verify IP whitelist

### "SSL connection error"
- Add `?sslmode=require` to DATABASE_URL for cloud databases
- Or `?sslmode=no-verify` for self-signed certificates

### "Database does not exist"
- Create the database first (see solutions above)
- Ensure database name in URL matches created database

### "Authentication failed"
- Verify username and password in DATABASE_URL
- Check user has proper permissions

## Resources

- [Prisma Migrate Documentation](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Client Documentation](https://www.prisma.io/docs/concepts/components/prisma-client)
- [Database Setup Guide](./DATABASE_SETUP.md)
- [Supabase Quickstart](https://supabase.com/docs/guides/database/connecting-to-postgres)

## Task Completion

This task (2.3) will be complete once:
- ✅ Prisma Client is generated
- ✅ Migrations run successfully (all tables created)
- ✅ Seed data is inserted (admin user, page content, sample collection)
- ✅ Database connectivity is verified

## Contact

If you encounter issues not covered here, please refer to:
- Prisma Discord: https://pris.ly/discord
- GitHub Issues: https://github.com/prisma/prisma/issues

# Quick Start: Database Setup

Follow these steps to get the database running:

## 1. Install PostgreSQL

### Option A: Local Installation
- Download from https://www.postgresql.org/download/
- Install and start the service
- Create database: `createdb sameeksha_arts`

### Option B: Use Cloud Provider (Recommended)
- **Supabase**: https://supabase.com (Free tier)
- **Railway**: https://railway.app (Free tier)
- **Neon**: https://neon.tech (Free tier)

## 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your DATABASE_URL
# Example: DATABASE_URL="postgresql://user:pass@localhost:5432/sameeksha_arts"
```

## 3. Setup Database

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations (creates all tables)
npm run db:migrate

# Seed initial data
npm run db:seed

# Test connection
npm run db:test
```

## 4. Access Database

```bash
# Open Prisma Studio (database GUI)
npm run db:studio
```

Visit http://localhost:5555 to view and edit data.

## Default Admin Login

After seeding:
- Email: `admin@sameekshaarts.com`
- Password: `changeme123`

**⚠️ CHANGE THIS PASSWORD IMMEDIATELY!**

## Common Issues

### "Connection refused"
- Check PostgreSQL is running
- Verify DATABASE_URL in .env

### "Database does not exist"
- Create database: `createdb sameeksha_arts`
- Or use cloud provider dashboard

### "Module not found @prisma/client"
- Run: `npm run db:generate`
- Restart your IDE/terminal

## Next Steps

1. Change admin password
2. Start development server: `npm run dev`
3. Access admin panel at http://localhost:3000/admin
4. Begin adding content

## Full Documentation

See `docs/DATABASE_SETUP.md` for comprehensive guide.

## Need Help?

1. Run `npm run db:test` to diagnose issues
2. Check error messages carefully
3. Review `docs/DATABASE_SETUP.md` troubleshooting section

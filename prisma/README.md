# Database Setup Guide

This guide explains how to set up and configure the PostgreSQL database for the Sameeksha Arts Website.

## Prerequisites

- PostgreSQL 12 or higher installed
- Node.js and npm installed
- Access to a PostgreSQL database (local or cloud-hosted)

## Configuration Steps

### 1. Database Connection

Create a `.env` file in the project root (copy from `.env.example`):

```bash
cp .env.example .env
```

Update the `DATABASE_URL` with your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/sameeksha_arts?schema=public"
```

**Format breakdown:**
- `username`: Your PostgreSQL username
- `password`: Your PostgreSQL password
- `localhost`: Database host (use your cloud provider's host if using hosted DB)
- `5432`: PostgreSQL port (default)
- `sameeksha_arts`: Database name
- `schema=public`: PostgreSQL schema name

### 2. Create Database

If using a local PostgreSQL instance, create the database:

```sql
CREATE DATABASE sameeksha_arts;
```

If using a cloud provider (like Supabase, Railway, or Neon), create the database through their dashboard.

### 3. Run Migrations

Generate and apply the database schema:

```bash
npx prisma migrate dev --name init
```

This command will:
- Create the migration files
- Apply the schema to your database
- Generate the Prisma Client

### 4. Generate Prisma Client

The Prisma Client is auto-generated during migration, but you can regenerate it manually:

```bash
npx prisma generate
```

### 5. Verify Setup

Open Prisma Studio to verify the database setup:

```bash
npx prisma studio
```

This opens a web interface at `http://localhost:5555` where you can view and edit data.

## Database Schema Overview

The database includes the following tables:

- **User**: Admin authentication
- **Artwork**: Artwork records with metadata
- **Collection**: Artwork collections/categories
- **MediaAsset**: Uploaded images with multiple sizes
- **ArtworkImage**: Join table linking artworks to images
- **Recognition**: Awards, exhibitions, press mentions
- **Testimonial**: Client testimonials
- **Inquiry**: Contact form submissions
- **PageContent**: Flexible content storage for CMS pages

## Common Commands

### View Database
```bash
npx prisma studio
```

### Reset Database (WARNING: Deletes all data)
```bash
npx prisma migrate reset
```

### Create New Migration
```bash
npx prisma migrate dev --name description_of_change
```

### Apply Migrations in Production
```bash
npx prisma migrate deploy
```

### Pull Schema from Existing Database
```bash
npx prisma db pull
```

### Push Schema Without Migration
```bash
npx prisma db push
```

## Troubleshooting

### Connection Issues

If you get connection errors:

1. Verify PostgreSQL is running:
   ```bash
   pg_isready
   ```

2. Check your DATABASE_URL format

3. Ensure the database exists

4. Verify user permissions

### SSL/TLS Issues

For cloud databases requiring SSL, add to your DATABASE_URL:
```
?sslmode=require
```

Example:
```
postgresql://user:pass@host:5432/db?schema=public&sslmode=require
```

### Migration Conflicts

If migrations conflict:
```bash
npx prisma migrate resolve --rolled-back <migration_name>
```

## Cloud Database Providers

### Recommended Providers

1. **Supabase** (Free tier available)
   - https://supabase.com
   - Includes database, auth, and storage

2. **Railway** (Free tier available)
   - https://railway.app
   - Easy PostgreSQL deployment

3. **Neon** (Free tier available)
   - https://neon.tech
   - Serverless PostgreSQL

4. **PlanetScale** (Free tier available)
   - https://planetscale.com
   - MySQL-compatible (would require schema adjustments)

## Security Best Practices

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use strong passwords** for database users
3. **Enable SSL/TLS** for production connections
4. **Restrict database access** to specific IP addresses
5. **Use environment-specific credentials** (dev, staging, production)
6. **Rotate credentials regularly**
7. **Use read-only users** for analytics/reporting

## Backup and Recovery

### Create Backup
```bash
pg_dump -h localhost -U username -d sameeksha_arts > backup.sql
```

### Restore Backup
```bash
psql -h localhost -U username -d sameeksha_arts < backup.sql
```

### Automated Backups

Most cloud providers offer automated backups. Enable them in your provider's dashboard.

## Performance Optimization

The schema includes indexes on frequently queried fields:

- Artwork: `collectionId`, `availabilityStatus`, `published`, `createdAt`
- MediaAsset: `uploadedAt`
- ArtworkImage: `artworkId`, `order`
- Recognition: `type`, `date`
- Testimonial: `order`
- Inquiry: `status`, `createdAt`

Additional indexes can be added through migrations if needed.

## Support

For Prisma-specific issues, see:
- Documentation: https://www.prisma.io/docs
- Community: https://www.prisma.io/community
- GitHub: https://github.com/prisma/prisma

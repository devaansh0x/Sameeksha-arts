/**
 * Database Migration Runner
 * 
 * This script automates the complete database setup process:
 * 1. Tests database connectivity
 * 2. Generates Prisma Client
 * 3. Runs migrations to create tables
 * 4. Seeds initial data
 * 5. Verifies setup
 * 
 * Usage: npm run db:setup
 * Or: npx tsx scripts/run-migrations.ts
 */

import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

function log(message: string, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function step(number: number, message: string) {
    log(`\n${colors.bright}[Step ${number}]${colors.reset} ${message}`);
}

function success(message: string) {
    log(`✓ ${message}`, colors.green);
}

function error(message: string) {
    log(`✗ ${message}`, colors.red);
}

function warning(message: string) {
    log(`⚠ ${message}`, colors.yellow);
}

function info(message: string) {
    log(`ℹ ${message}`, colors.cyan);
}

async function testDatabaseConnection(): Promise<boolean> {
    step(1, 'Testing database connection...');

    try {
        await prisma.$connect();
        await prisma.$queryRaw`SELECT 1 as test`;
        success('Database connection successful!');
        return true;
    } catch (err) {
        error('Database connection failed!');
        console.error(err);
        return false;
    } finally {
        await prisma.$disconnect();
    }
}

function generatePrismaClient(): boolean {
    step(2, 'Generating Prisma Client...');

    try {
        execSync('npx prisma generate', {
            stdio: 'inherit',
            env: process.env,
        });
        success('Prisma Client generated successfully!');
        return true;
    } catch (err) {
        error('Failed to generate Prisma Client!');
        console.error(err);
        return false;
    }
}

function runMigrations(): boolean {
    step(3, 'Running database migrations...');

    try {
        execSync('npx prisma migrate deploy', {
            stdio: 'inherit',
            env: process.env,
        });
        success('Migrations completed successfully!');
        return true;
    } catch (err) {
        warning('Migrate deploy failed, trying migrate dev...');

        try {
            execSync('npx prisma migrate dev --name init', {
                stdio: 'inherit',
                env: process.env,
            });
            success('Migrations completed successfully!');
            return true;
        } catch (err2) {
            error('Failed to run migrations!');
            console.error(err2);
            return false;
        }
    }
}

function seedDatabase(): boolean {
    step(4, 'Seeding database with initial data...');

    try {
        execSync('npx tsx prisma/seed.ts', {
            stdio: 'inherit',
            env: process.env,
        });
        success('Database seeded successfully!');
        return true;
    } catch (err) {
        error('Failed to seed database!');
        console.error(err);
        return false;
    }
}

async function verifySetup(): Promise<boolean> {
    step(5, 'Verifying database setup...');

    try {
        const prismaVerify = new PrismaClient();
        await prismaVerify.$connect();

        // Count records in each table
        const userCount = await prismaVerify.user.count();
        const pageContentCount = await prismaVerify.pageContent.count();
        const collectionCount = await prismaVerify.collection.count();

        info(`Found ${userCount} user(s)`);
        info(`Found ${pageContentCount} page content record(s)`);
        info(`Found ${collectionCount} collection(s)`);

        if (userCount === 0) {
            warning('No users found! Seed may have failed.');
            return false;
        }

        if (pageContentCount === 0) {
            warning('No page content found! Seed may have failed.');
            return false;
        }

        success('Database setup verified successfully!');
        await prismaVerify.$disconnect();
        return true;
    } catch (err) {
        error('Failed to verify database setup!');
        console.error(err);
        return false;
    }
}

async function main() {
    log('\n' + '='.repeat(60), colors.bright);
    log('DATABASE MIGRATION AND SETUP', colors.bright);
    log('='.repeat(60), colors.bright);

    info(`DATABASE_URL: ${process.env.DATABASE_URL?.substring(0, 50)}...`);

    // Step 1: Test connection
    const connectionOk = await testDatabaseConnection();
    if (!connectionOk) {
        error('\n❌ Cannot proceed without database connection!');
        error('Please check your DATABASE_URL in .env file');
        error('See docs/DATABASE_MIGRATION_STATUS.md for solutions');
        process.exit(1);
    }

    // Step 2: Generate Prisma Client
    const clientOk = generatePrismaClient();
    if (!clientOk) {
        error('\n❌ Cannot proceed without Prisma Client!');
        process.exit(1);
    }

    // Step 3: Run migrations
    const migrationsOk = runMigrations();
    if (!migrationsOk) {
        error('\n❌ Migrations failed!');
        error('Check the error messages above');
        process.exit(1);
    }

    // Step 4: Seed database
    const seedOk = seedDatabase();
    if (!seedOk) {
        warning('\n⚠️  Seeding failed, but migrations completed');
        warning('You may need to run: npm run db:seed');
    }

    // Step 5: Verify setup
    const verifyOk = await verifySetup();
    if (!verifyOk) {
        warning('\n⚠️  Setup verification found issues');
        warning('Check the warnings above');
    }

    // Final summary
    log('\n' + '='.repeat(60), colors.bright);
    if (connectionOk && clientOk && migrationsOk && seedOk && verifyOk) {
        success('✓ DATABASE SETUP COMPLETE!', colors.bright);
        log('\n' + colors.bright + 'Next steps:' + colors.reset);
        log('1. Log in to admin dashboard: http://localhost:3000/admin/login');
        log('2. Default credentials:');
        log('   Email: admin@sameekshaarts.com');
        log('   Password: changeme123');
        log('3. ⚠️  CHANGE THE ADMIN PASSWORD IMMEDIATELY!');
        log('\nView your data:');
        log('   npm run db:studio\n');
    } else {
        warning('⚠️  SETUP COMPLETED WITH WARNINGS', colors.bright);
        log('\nSome steps failed. Review the output above.');
        log('See docs/DATABASE_MIGRATION_STATUS.md for troubleshooting.\n');
    }
    log('='.repeat(60), colors.bright);
}

main()
    .catch((err) => {
        error('\n❌ Unexpected error during setup:');
        console.error(err);
        process.exit(1);
    });

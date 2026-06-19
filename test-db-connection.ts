import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
});

async function testConnection() {
    try {
        console.log('Testing database connection...');
        console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');

        // Try to connect
        await prisma.$connect();
        console.log('✓ Database connected successfully!');

        // Try a simple query
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        console.log('✓ Query executed successfully:', result);

        // List tables
        const tables = await prisma.$queryRaw`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;
        console.log('\nDatabase tables:', tables);

    } catch (error) {
        console.error('✗ Database connection failed:');
        console.error(error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();

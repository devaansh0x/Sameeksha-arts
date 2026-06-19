/**
 * Cloudinary Configuration Test Script
 * 
 * This script tests the Cloudinary configuration and verifies that:
 * 1. Environment variables are properly set
 * 2. Connection to Cloudinary works
 * 3. Basic operations (list resources) are functional
 * 
 * Run with: npx tsx scripts/test-cloudinary.ts
 */

import cloudinary from '../lib/cloudinary';
import { checkConfiguration, printConfigCheck } from '../lib/config-check';

async function testCloudinaryConnection() {
    console.log('\n========================================');
    console.log('Testing Cloudinary Connection');
    console.log('========================================\n');

    // First, check configuration
    printConfigCheck();

    const configCheck = checkConfiguration();

    if (!configCheck.config.cloudinary) {
        console.error('❌ Cloudinary is not properly configured.');
        console.error('Please check your .env.local file and ensure all Cloudinary variables are set.\n');
        process.exit(1);
    }

    try {
        // Test 1: Ping Cloudinary API
        console.log('Test 1: Pinging Cloudinary API...');
        const pingResult = await cloudinary.api.ping();
        console.log('✅ Ping successful:', pingResult.status);
        console.log('');

        // Test 2: Get account usage
        console.log('Test 2: Fetching account usage...');
        const usage = await cloudinary.api.usage();
        console.log('✅ Account usage retrieved successfully:');
        console.log(`  Plan: ${usage.plan || 'Free'}`);
        console.log(`  Credits used: ${usage.credits?.used || 0} / ${usage.credits?.limit || 'N/A'}`);
        console.log(`  Storage: ${formatBytes(usage.storage?.used || 0)} / ${formatBytes(usage.storage?.limit || 0)}`);
        console.log(`  Bandwidth: ${formatBytes(usage.bandwidth?.used || 0)} / ${formatBytes(usage.bandwidth?.limit || 0)}`);
        console.log('');

        // Test 3: List resources in sameeksha-arts folder
        console.log('Test 3: Checking for existing resources...');
        try {
            const resources = await cloudinary.api.resources({
                type: 'upload',
                prefix: 'sameeksha-arts/',
                max_results: 10,
            });

            if (resources.resources.length === 0) {
                console.log('ℹ️  No resources found in sameeksha-arts/ folder (this is expected for a new setup)');
            } else {
                console.log(`✅ Found ${resources.resources.length} resources in sameeksha-arts/ folder:`);
                resources.resources.forEach((resource: any) => {
                    console.log(`  • ${resource.public_id} (${resource.format}, ${formatBytes(resource.bytes)})`);
                });
            }
        } catch (error: any) {
            if (error.error?.http_code === 404) {
                console.log('ℹ️  No resources found in sameeksha-arts/ folder (this is expected for a new setup)');
            } else {
                throw error;
            }
        }
        console.log('');

        // Test 4: Verify folder structure can be created
        console.log('Test 4: Verifying folder structure...');
        console.log('✅ Folder structure defined:');
        console.log('  • sameeksha-arts/artwork/');
        console.log('  • sameeksha-arts/portraits/');
        console.log('  • sameeksha-arts/general/');
        console.log('  (Folders will be created automatically on first upload)');
        console.log('');

        // Success summary
        console.log('========================================');
        console.log('✅ All Cloudinary tests passed!');
        console.log('========================================\n');
        console.log('Next steps:');
        console.log('1. Continue to Task 4.2: Create image processing service with Sharp');
        console.log('2. Implement Task 4.3: Create media upload API endpoint');
        console.log('3. Test image upload through the API\n');

    } catch (error: any) {
        console.error('\n❌ Cloudinary connection test failed:\n');

        if (error.error?.message) {
            console.error(`Error: ${error.error.message}`);
        } else if (error.message) {
            console.error(`Error: ${error.message}`);
        } else {
            console.error('Unknown error:', error);
        }

        console.error('\nTroubleshooting tips:');
        console.error('1. Verify your CLOUDINARY_CLOUD_NAME is correct (case-sensitive)');
        console.error('2. Verify your CLOUDINARY_API_KEY is correct');
        console.error('3. Verify your CLOUDINARY_API_SECRET is correct');
        console.error('4. Check that your Cloudinary account is active');
        console.error('5. Ensure you have an internet connection');
        console.error('\nRefer to docs/CLOUDINARY_SETUP.md for detailed setup instructions.\n');

        process.exit(1);
    }
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Run the test
testCloudinaryConnection().catch(error => {
    console.error('Unexpected error running tests:', error);
    process.exit(1);
});

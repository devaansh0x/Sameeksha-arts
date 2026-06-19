/**
 * Configuration Verification Utility
 * 
 * This utility checks if all required environment variables are properly configured.
 * Use this during development to quickly identify missing or invalid configuration.
 */

export interface ConfigCheckResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    config: {
        cloudinary: boolean;
        database: boolean;
        auth: boolean;
        email: boolean;
    };
}

/**
 * Check if Cloudinary is properly configured
 */
function checkCloudinaryConfig(): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    const requiredVars = [
        'CLOUDINARY_CLOUD_NAME',
        'CLOUDINARY_API_KEY',
        'CLOUDINARY_API_SECRET',
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        errors.push(
            `Missing Cloudinary environment variables: ${missingVars.join(', ')}. ` +
            'Please check your .env.local file.'
        );
        return { isValid: false, errors, warnings };
    }

    // Check if using placeholder values
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    if (cloudName?.includes('your_') || cloudName?.includes('placeholder')) {
        warnings.push(
            'Cloudinary cloud name appears to be a placeholder. ' +
            'Please replace with your actual Cloudinary credentials.'
        );
    }

    return { isValid: true, errors, warnings };
}

/**
 * Check if database is properly configured
 */
function checkDatabaseConfig(): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!process.env.DATABASE_URL) {
        warnings.push(
            'DATABASE_URL is not set. Database functionality will not work. ' +
            'This is expected during initial setup.'
        );
        return { isValid: false, errors, warnings };
    }

    // Check if using placeholder
    if (process.env.DATABASE_URL.includes('user:password@localhost')) {
        warnings.push(
            'DATABASE_URL appears to be a placeholder. ' +
            'Update with your actual database credentials when ready.'
        );
    }

    return { isValid: true, errors, warnings };
}

/**
 * Check if NextAuth is properly configured
 */
function checkAuthConfig(): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!process.env.NEXTAUTH_URL) {
        warnings.push(
            'NEXTAUTH_URL is not set. Authentication functionality will not work. ' +
            'This is expected during initial setup.'
        );
    }

    if (!process.env.NEXTAUTH_SECRET) {
        warnings.push(
            'NEXTAUTH_SECRET is not set. Authentication functionality will not work. ' +
            'This is expected during initial setup.'
        );
        return { isValid: false, errors, warnings };
    }

    // Check if using placeholder secret
    if (process.env.NEXTAUTH_SECRET.includes('change_this')) {
        warnings.push(
            'NEXTAUTH_SECRET appears to be a placeholder. ' +
            'Generate a secure random secret for production use.'
        );
    }

    return { isValid: true, errors, warnings };
}

/**
 * Check if email is properly configured
 */
function checkEmailConfig(): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    const requiredVars = [
        'EMAIL_SERVER_HOST',
        'EMAIL_SERVER_PORT',
        'EMAIL_SERVER_USER',
        'EMAIL_SERVER_PASSWORD',
        'EMAIL_FROM',
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        warnings.push(
            'Email configuration is incomplete. Contact form notifications will not work. ' +
            'This is expected during initial setup.'
        );
        return { isValid: false, errors, warnings };
    }

    // Check if using placeholder values
    if (process.env.EMAIL_SERVER_HOST?.includes('example.com')) {
        warnings.push(
            'Email configuration appears to use placeholder values. ' +
            'Update with your actual SMTP server details when ready.'
        );
    }

    return { isValid: true, errors, warnings };
}

/**
 * Run all configuration checks
 * 
 * @returns Configuration check result with details
 */
export function checkConfiguration(): ConfigCheckResult {
    const cloudinary = checkCloudinaryConfig();
    const database = checkDatabaseConfig();
    const auth = checkAuthConfig();
    const email = checkEmailConfig();

    const allErrors = [
        ...cloudinary.errors,
        ...database.errors,
        ...auth.errors,
        ...email.errors,
    ];

    const allWarnings = [
        ...cloudinary.warnings,
        ...database.warnings,
        ...auth.warnings,
        ...email.warnings,
    ];

    return {
        isValid: allErrors.length === 0,
        errors: allErrors,
        warnings: allWarnings,
        config: {
            cloudinary: cloudinary.isValid,
            database: database.isValid,
            auth: auth.isValid,
            email: email.isValid,
        },
    };
}

/**
 * Print configuration check results to console
 * Useful for development and debugging
 */
export function printConfigCheck(): void {
    console.log('\n========================================');
    console.log('Configuration Check');
    console.log('========================================\n');

    const result = checkConfiguration();

    console.log('Status:');
    console.log(`  Cloudinary: ${result.config.cloudinary ? '✓' : '✗'}`);
    console.log(`  Database:   ${result.config.database ? '✓' : '✗'}`);
    console.log(`  Auth:       ${result.config.auth ? '✓' : '✗'}`);
    console.log(`  Email:      ${result.config.email ? '✓' : '✗'}`);
    console.log('');

    if (result.errors.length > 0) {
        console.log('❌ Errors:');
        result.errors.forEach(error => console.log(`  • ${error}`));
        console.log('');
    }

    if (result.warnings.length > 0) {
        console.log('⚠️  Warnings:');
        result.warnings.forEach(warning => console.log(`  • ${warning}`));
        console.log('');
    }

    if (result.isValid && result.warnings.length === 0) {
        console.log('✅ All configuration checks passed!\n');
    } else if (result.warnings.length > 0 && result.errors.length === 0) {
        console.log('⚠️  Configuration has warnings but no critical errors.\n');
    } else {
        console.log('❌ Configuration has critical errors that must be fixed.\n');
    }

    console.log('========================================\n');
}

// Auto-run check in development mode
if (process.env.NODE_ENV === 'development' && typeof window === 'undefined') {
    // Only run on server-side in development
    printConfigCheck();
}

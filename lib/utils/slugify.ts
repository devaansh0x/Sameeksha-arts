/**
 * Generates a URL-safe slug from a string.
 * Converts to lowercase, replaces spaces with hyphens, strips special chars.
 */
export function generateBaseSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
}

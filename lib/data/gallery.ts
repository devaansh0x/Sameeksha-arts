/**
 * Server-side data fetching for public gallery pages.
 * All functions return empty arrays / null when the DB is not configured,
 * allowing every page to fall back to mock data silently.
 */

import prisma from '@/lib/database/prisma'

// ─── Artworks ────────────────────────────────────────────────────────────────

export async function getAllPublishedArtworks() {
    if (!prisma) return []
    return prisma.artwork.findMany({
        where: { published: true },
        orderBy: { createdAt: 'desc' },
        include: {
            collection: { select: { id: true, name: true, slug: true, description: true } },
            images: {
                orderBy: { order: 'asc' },
                include: { mediaAsset: true },
            },
        },
    })
}

export async function getArtworkBySlug(slug: string) {
    if (!prisma) return null
    return prisma.artwork.findFirst({
        where: { slug, published: true },
        include: {
            collection: { select: { id: true, name: true, slug: true, description: true } },
            images: {
                orderBy: { order: 'asc' },
                include: { mediaAsset: true },
            },
        },
    })
}

export async function getRelatedArtworks(collectionId: string, excludeId: string) {
    if (!prisma) return []
    return prisma.artwork.findMany({
        where: { collectionId, published: true, id: { not: excludeId } },
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: {
            collection: { select: { id: true, name: true, slug: true, description: true } },
            images: {
                orderBy: { order: 'asc' },
                take: 1,
                include: { mediaAsset: { select: { thumbnailUrl: true, mediumUrl: true } } },
            },
        },
    })
}

export async function getAllArtworkSlugs() {
    if (!prisma) return []
    const artworks = await prisma.artwork.findMany({
        where: { published: true },
        select: { slug: true },
    })
    return artworks.map(a => a.slug)
}

// ─── Collections ─────────────────────────────────────────────────────────────

export async function getAllCollections() {
    if (!prisma) return []
    return prisma.collection.findMany({
        orderBy: { name: 'asc' },
        include: { _count: { select: { artworks: true } } },
    })
}

// ─── Recognition ─────────────────────────────────────────────────────────────

export async function getAllPublishedRecognition() {
    if (!prisma) return []
    return prisma.recognition.findMany({
        where: { published: true },
        orderBy: { date: 'desc' },
    })
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

export async function getAllPublishedTestimonials() {
    if (!prisma) return []
    return prisma.testimonial.findMany({
        where: { published: true },
        orderBy: { order: 'asc' },
    })
}

// ─── Page content ─────────────────────────────────────────────────────────────

export async function getPageContent(page: 'homepage' | 'about' | 'commissions') {
    if (!prisma) return null
    const record = await prisma.pageContent.findUnique({ where: { page } })
    return record?.content ?? null
}

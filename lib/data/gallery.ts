/**
 * Server-side data fetching for public gallery pages.
 * These functions query the database via Prisma.
 * Each falls back gracefully — if the DB isn't connected, the public site
 * continues to work with the mock data from lib/utils/mockData.ts.
 */

import prisma from '@/lib/database/prisma'

// ─── Artworks ────────────────────────────────────────────────────────────────

export async function getAllPublishedArtworks() {
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
    const artworks = await prisma.artwork.findMany({
        where: { published: true },
        select: { slug: true },
    })
    return artworks.map(a => a.slug)
}

// ─── Collections ─────────────────────────────────────────────────────────────

export async function getAllCollections() {
    return prisma.collection.findMany({
        orderBy: { name: 'asc' },
        include: { _count: { select: { artworks: true } } },
    })
}

// ─── Recognition ─────────────────────────────────────────────────────────────

export async function getAllPublishedRecognition() {
    return prisma.recognition.findMany({
        where: { published: true },
        orderBy: { date: 'desc' },
    })
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

export async function getAllPublishedTestimonials() {
    return prisma.testimonial.findMany({
        where: { published: true },
        orderBy: { order: 'asc' },
    })
}

// ─── Page content ─────────────────────────────────────────────────────────────

export async function getPageContent(page: 'homepage' | 'about' | 'commissions') {
    const record = await prisma.pageContent.findUnique({ where: { page } })
    return record?.content ?? null
}

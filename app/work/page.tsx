import React from 'react'
import Navigation from '@/components/gallery/Navigation'
import Footer from '@/components/Footer'
import GalleryGrid from '@/components/gallery/GalleryGrid'
import { getAllPublishedArtworks, getAllCollections } from '@/lib/data/gallery'
import { mockArtworks, mockCollections } from '@/lib/utils/mockData'
import type { Artwork, Collection } from '@/lib/utils/mockData'

export const revalidate = 60

export const metadata = {
    title: 'Work | Sameeksha Arts',
    description: 'Browse the full gallery — paintings in oil, acrylic, watercolour, and traditional forms.',
}

/** Normalise a DB Artwork row to the shape ArtworkCard / GalleryGrid expect. */
function normaliseArtwork(a: Awaited<ReturnType<typeof getAllPublishedArtworks>>[number]): Artwork {
    return {
        id: a.id,
        title: a.title,
        slug: a.slug,
        description: a.description,
        story: a.story,
        medium: a.medium,
        dimensions: a.dimensions,
        year: a.year,
        // DB enum is uppercase (AVAILABLE) — normalise to lowercase
        availabilityStatus: a.availabilityStatus.toLowerCase() as Artwork['availabilityStatus'],
        collectionId: a.collectionId ?? '',
        collection: a.collection
            ? {
                id: a.collection.id,
                name: a.collection.name,
                slug: a.collection.slug,
                description: a.collection.description,
            }
            : { id: '', name: '', slug: '', description: '' },
        images: a.images.map(img => ({
            id: img.id,
            url: img.mediaAsset.originalUrl,
            thumbnailUrl: img.mediaAsset.thumbnailUrl,
            alt: a.title,
            width: img.mediaAsset.width,
            height: img.mediaAsset.height,
            isPrimary: img.isPrimary,
        })),
        // tags and colorPalette are not stored in the DB — default to empty
        tags: [],
        colorPalette: undefined,
        createdAt: a.createdAt.toISOString(),
    }
}

/** Normalise a DB Collection row to the shape GalleryGrid expects. */
function normaliseCollection(c: Awaited<ReturnType<typeof getAllCollections>>[number]): Collection {
    return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
    }
}

export default async function WorkPage() {
    let artworks: Artwork[] = mockArtworks
    let collections: Collection[] = mockCollections

    try {
        const [dbArtworks, dbCollections] = await Promise.all([
            getAllPublishedArtworks(),
            getAllCollections(),
        ])
        if (dbArtworks.length > 0) artworks = dbArtworks.map(normaliseArtwork)
        if (dbCollections.length > 0) collections = dbCollections.map(normaliseCollection)
    } catch {
        // DB unavailable — use mock fallback silently
    }

    return (
        <div className="min-h-screen flex flex-col bg-primary-50">
            <Navigation />
            <main className="flex-grow pt-24">
                <GalleryGrid artworks={artworks} collections={collections} />
            </main>
            <Footer />
        </div>
    )
}

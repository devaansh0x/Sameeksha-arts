import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Navigation from '@/components/gallery/Navigation'
import Footer from '@/components/Footer'
import ArtworkCard from '@/components/gallery/ArtworkCard'
import Button from '@/components/ui/Button'
import { mockArtworks } from '@/lib/mockData'
import { notFound } from 'next/navigation'

export default function ArtworkDetailPage({ params }: { params: { slug: string } }) {
    // Find artwork by slug
    const artwork = mockArtworks.find((a) => a.slug === params.slug)

    if (!artwork) {
        notFound()
    }

    // Get related artworks from same collection
    const relatedArtworks = mockArtworks
        .filter((a) => a.collectionId === artwork.collectionId && a.id !== artwork.id)
        .slice(0, 3)

    const availabilityLabels = {
        available: 'Available for Purchase',
        sold: 'Sold',
        on_commission: 'Currently on Commission',
        not_for_sale: 'Not for Sale',
    }

    const availabilityColors = {
        available: 'text-green-700 bg-green-50',
        sold: 'text-red-700 bg-red-50',
        on_commission: 'text-yellow-700 bg-yellow-50',
        not_for_sale: 'text-neutral-700 bg-neutral-100',
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navigation />

            <main className="flex-grow">
                {/* Breadcrumb */}
                <section className="py-6 bg-primary-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <nav className="flex text-sm">
                            <Link href="/work" className="text-accent-600 hover:text-accent-700">
                                Artwork
                            </Link>
                            <span className="mx-2 text-neutral-400">/</span>
                            <Link
                                href={`/collections/${artwork.collection.slug}`}
                                className="text-accent-600 hover:text-accent-700"
                            >
                                {artwork.collection.name}
                            </Link>
                            <span className="mx-2 text-neutral-400">/</span>
                            <span className="text-neutral-700">{artwork.title}</span>
                        </nav>
                    </div>
                </section>

                {/* Artwork Detail */}
                <section className="py-12 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Image Gallery */}
                            <div className="space-y-4">
                                <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-primary-100">
                                    <Image
                                        src={artwork.images[0].url}
                                        alt={artwork.images[0].alt}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                        priority
                                    />
                                </div>

                                {/* Thumbnail Gallery (if multiple images) */}
                                {artwork.images.length > 1 && (
                                    <div className="grid grid-cols-4 gap-3">
                                        {artwork.images.map((image) => (
                                            <div
                                                key={image.id}
                                                className="relative aspect-square rounded-md overflow-hidden cursor-pointer hover:opacity-75 transition-opacity"
                                            >
                                                <Image
                                                    src={image.thumbnailUrl}
                                                    alt={image.alt}
                                                    fill
                                                    className="object-cover"
                                                    sizes="150px"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Artwork Information */}
                            <div>
                                <h1 className="text-display-sm font-display font-bold text-neutral-900 mb-4">
                                    {artwork.title}
                                </h1>

                                <div className={`inline-block px-4 py-2 rounded-full font-medium mb-6 ${availabilityColors[artwork.availabilityStatus]}`}>
                                    {availabilityLabels[artwork.availabilityStatus]}
                                </div>

                                <div className="space-y-4 mb-8 pb-8 border-b border-primary-200">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-sm text-neutral-600 font-medium uppercase tracking-wide">
                                                Year
                                            </div>
                                            <div className="text-lg text-neutral-900">{artwork.year}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-neutral-600 font-medium uppercase tracking-wide">
                                                Medium
                                            </div>
                                            <div className="text-lg text-neutral-900">{artwork.medium}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-neutral-600 font-medium uppercase tracking-wide">
                                                Dimensions
                                            </div>
                                            <div className="text-lg text-neutral-900">{artwork.dimensions}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-neutral-600 font-medium uppercase tracking-wide">
                                                Collection
                                            </div>
                                            <Link
                                                href={`/collections/${artwork.collection.slug}`}
                                                className="text-lg text-accent-600 hover:text-accent-700"
                                            >
                                                {artwork.collection.name}
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <h2 className="text-xl font-display font-semibold text-neutral-900 mb-3">
                                        Description
                                    </h2>
                                    <p className="text-neutral-700 leading-relaxed">
                                        {artwork.description}
                                    </p>
                                </div>

                                {artwork.story && artwork.story !== '[The story behind this artwork will be shared by the artist]' && (
                                    <div className="mb-8">
                                        <h2 className="text-xl font-display font-semibold text-neutral-900 mb-3">
                                            Story
                                        </h2>
                                        <p className="text-neutral-700 leading-relaxed">
                                            {artwork.story}
                                        </p>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-4">
                                    {artwork.availabilityStatus === 'available' && (
                                        <Button href="/contact" variant="primary" size="lg">
                                            Inquire About This Artwork
                                        </Button>
                                    )}
                                    <Button href="/commissions" variant="outline" size="lg">
                                        Commission Similar Work
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Related Artworks */}
                {relatedArtworks.length > 0 && (
                    <section className="py-20 bg-primary-50">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <h2 className="text-display-sm font-display font-bold text-neutral-900 mb-8 text-center">
                                More from {artwork.collection.name}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {relatedArtworks.map((relatedArtwork) => (
                                    <ArtworkCard key={relatedArtwork.id} artwork={relatedArtwork} />
                                ))}
                            </div>

                            <div className="text-center mt-12">
                                <Button href={`/collections/${artwork.collection.slug}`} variant="ghost">
                                    View All {artwork.collection.name} →
                                </Button>
                            </div>
                        </div>
                    </section>
                )}
            </main>

            <Footer />
        </div>
    )
}

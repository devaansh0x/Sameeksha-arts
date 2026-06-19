'use client'

import React, { useState } from 'react'
import Navigation from '@/components/gallery/Navigation'
import Footer from '@/components/Footer'
import ArtworkCard from '@/components/gallery/ArtworkCard'
import { mockArtworks, mockCollections } from '@/lib/mockData'

export default function WorkPage() {
    const [selectedCollection, setSelectedCollection] = useState<string>('all')

    const filteredArtworks = selectedCollection === 'all'
        ? mockArtworks
        : mockArtworks.filter((a) => a.collectionId === selectedCollection)

    return (
        <div className="min-h-screen flex flex-col">
            <Navigation />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="py-24 md:py-32 bg-primary-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <p className="text-xs uppercase tracking-[0.3em] text-accent-600 font-medium mb-6">
                                Portfolio
                            </p>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-neutral-900 mb-8 leading-tight">
                                Collections
                            </h1>
                            <p className="text-xl md:text-2xl text-neutral-700 font-serif font-light leading-relaxed max-w-2xl mx-auto">
                                [Brief introduction to the body of work — what unites these pieces,
                                what the artist explores across different collections]
                            </p>
                        </div>

                        {/* Collection Filter */}
                        <div className="flex flex-wrap justify-center gap-3 mb-12">
                            <button
                                onClick={() => setSelectedCollection('all')}
                                className={`px-6 py-3 text-sm font-light uppercase tracking-[0.1em] transition-all ${selectedCollection === 'all'
                                    ? 'bg-accent-700 text-white'
                                    : 'bg-white text-neutral-600 hover:text-neutral-900 border border-primary-200 hover:border-accent-300'
                                    }`}
                            >
                                All Works
                            </button>
                            {mockCollections.map((collection) => (
                                <button
                                    key={collection.id}
                                    onClick={() => setSelectedCollection(collection.id)}
                                    className={`px-6 py-3 text-sm font-light uppercase tracking-[0.1em] transition-all ${selectedCollection === collection.id
                                        ? 'bg-accent-700 text-white'
                                        : 'bg-white text-neutral-600 hover:text-neutral-900 border border-primary-200 hover:border-accent-300'
                                        }`}
                                >
                                    {collection.name}
                                </button>
                            ))}
                        </div>

                        {/* Collection Description */}
                        {selectedCollection !== 'all' && (
                            <div className="max-w-3xl mx-auto text-center mb-12">
                                <p className="text-lg text-neutral-700 font-light leading-relaxed">
                                    {mockCollections.find((c) => c.id === selectedCollection)?.description}
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Artwork Grid */}
                <section className="py-16 md:py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {filteredArtworks.length > 0 ? (
                            <>
                                <div className="mb-12 text-center">
                                    <p className="text-sm text-neutral-500 uppercase tracking-[0.2em]">
                                        {filteredArtworks.length} {filteredArtworks.length === 1 ? 'Work' : 'Works'}
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {filteredArtworks.map((artwork) => (
                                        <ArtworkCard key={artwork.id} artwork={artwork} size="medium" />
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-20">
                                <p className="text-lg text-neutral-600 font-light">
                                    No artwork available in this collection yet.
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}

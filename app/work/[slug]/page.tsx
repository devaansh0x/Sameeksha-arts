import React from 'react'
import Link from 'next/link'
import Navigation from '@/components/gallery/Navigation'
import Footer from '@/components/Footer'
import ArtworkCard from '@/components/gallery/ArtworkCard'
import Button from '@/components/ui/Button'
import Reveal from '@/components/common/Reveal'
import { mockArtworks } from '@/lib/utils/mockData'
import { notFound } from 'next/navigation'

export default function ArtworkDetailPage({ params }: { params: { slug: string } }) {
    const artwork = mockArtworks.find((a) => a.slug === params.slug)
    if (!artwork) notFound()

    const relatedArtworks = mockArtworks
        .filter((a) => a.collectionId === artwork.collectionId && a.id !== artwork.id)
        .slice(0, 3)

    const availabilityLabel = {
        available:     'Available for Purchase',
        sold:          'Sold',
        on_commission: 'Currently on Commission',
        not_for_sale:  'Not for Sale',
    }[artwork.availabilityStatus]

    const availabilityStyle = {
        available:     'text-emerald-700 border-emerald-200 bg-emerald-50/60',
        sold:          'text-neutral-500 border-neutral-200 bg-neutral-50',
        on_commission: 'text-amber-700 border-amber-200 bg-amber-50/60',
        not_for_sale:  'text-neutral-500 border-neutral-200 bg-neutral-50',
    }[artwork.availabilityStatus]

    const gradientStyle = artwork.colorPalette
        ? { background: `linear-gradient(${artwork.colorPalette.direction ?? 'to bottom right'}, ${artwork.colorPalette.from}, ${artwork.colorPalette.to})` }
        : { background: '#f3f1ed' }

    return (
        <div className="min-h-screen flex flex-col bg-primary-50">
            <Navigation />

            <main className="flex-grow pt-24">

                {/* Breadcrumb */}
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-8 pb-0">
                    <nav className="flex items-center gap-2 text-xs text-neutral-400 font-light tracking-wide">
                        <Link href="/work" className="hover:text-accent-700 transition-colors">Work</Link>
                        <span>/</span>
                        <Link href={`/work?collection=${artwork.collection.slug}`} className="hover:text-accent-700 transition-colors">
                            {artwork.collection.name}
                        </Link>
                        <span>/</span>
                        <span className="text-neutral-600">{artwork.title}</span>
                    </nav>
                </div>

                {/* Main detail */}
                <section className="py-12 md:py-16">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

                            {/* Image */}
                            <Reveal direction="left" className="lg:col-span-7">
                                <div className="relative w-full aspect-[4/3] overflow-hidden shadow-luxe" style={gradientStyle} />
                                {/* Thumbnail strip (if multiple images — ready for real data) */}
                            </Reveal>

                            {/* Info */}
                            <Reveal direction="right" delay={120} className="lg:col-span-5 space-y-8">

                                {/* Collection eyebrow */}
                                <div className="flex items-center gap-4">
                                    <span className="h-px w-10 bg-accent-600/40" />
                                    <Link
                                        href={`/work?collection=${artwork.collection.slug}`}
                                        className="text-[0.65rem] uppercase tracking-[0.35em] text-accent-600 hover:text-accent-700 transition-colors"
                                        style={{ fontWeight: 500 }}
                                    >
                                        {artwork.collection.name}
                                    </Link>
                                </div>

                                {/* Title */}
                                <div>
                                    <h1 className="text-4xl md:text-5xl font-display text-neutral-900 leading-[1.08] tracking-tight" style={{ fontWeight: 400 }}>
                                        {artwork.title}
                                    </h1>
                                    <div className={`inline-flex items-center mt-4 px-4 py-2 border text-xs font-light tracking-wide ${availabilityStyle}`}>
                                        {availabilityLabel}
                                    </div>
                                </div>

                                {/* Metadata grid */}
                                <div className="grid grid-cols-2 gap-x-8 gap-y-5 pt-6 border-t border-primary-200">
                                    {[
                                        { l: 'Year',       v: String(artwork.year) },
                                        { l: 'Medium',     v: artwork.medium },
                                        { l: 'Dimensions', v: artwork.dimensions },
                                        { l: 'Collection', v: artwork.collection.name },
                                    ].map(({ l, v }) => (
                                        <div key={l}>
                                            <p className="text-[0.6rem] uppercase tracking-[0.25em] text-neutral-400 mb-1" style={{ fontWeight: 500 }}>{l}</p>
                                            <p className="text-neutral-800 font-light">{v}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Tags */}
                                {artwork.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {artwork.tags.map(tag => (
                                            <span
                                                key={tag}
                                                className="px-3 py-1 border border-primary-200 text-[0.6rem] uppercase tracking-[0.2em] text-neutral-500 font-light"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Description */}
                                <div className="space-y-3 text-neutral-600 leading-[1.9] font-light text-base border-t border-primary-200 pt-6">
                                    <p>{artwork.description}</p>
                                </div>

                                {/* CTAs */}
                                <div className="flex flex-wrap gap-3 pt-2">
                                    {artwork.availabilityStatus === 'available' && (
                                        <Button href="/contact" variant="primary">
                                            Enquire About This Work
                                        </Button>
                                    )}
                                    <Button href="/commissions" variant="outline">
                                        Commission Similar Work
                                    </Button>
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </section>

                {/* Related works */}
                {relatedArtworks.length > 0 && (
                    <section className="py-16 md:py-20 bg-white border-t border-primary-200/60">
                        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                            <Reveal>
                                <div className="flex items-center gap-4 mb-10">
                                    <span className="h-px w-10 bg-accent-600/40" />
                                    <span className="text-[0.65rem] uppercase tracking-[0.35em] text-accent-600" style={{ fontWeight: 500 }}>
                                        More from {artwork.collection.name}
                                    </span>
                                </div>
                            </Reveal>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {relatedArtworks.map((a, i) => (
                                    <Reveal key={a.id} delay={i * 60}>
                                        <ArtworkCard artwork={a} aspect="portrait" />
                                    </Reveal>
                                ))}
                            </div>

                            <Reveal className="mt-10">
                                <Link
                                    href="/work"
                                    className="inline-flex items-center gap-3 text-sm text-neutral-500 hover:text-accent-700 font-light transition-colors group"
                                >
                                    <span className="h-px w-8 bg-current transition-all group-hover:w-12" />
                                    View all {artwork.collection.name}
                                </Link>
                            </Reveal>
                        </div>
                    </section>
                )}
            </main>

            <Footer />
        </div>
    )
}

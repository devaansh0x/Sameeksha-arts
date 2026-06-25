import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Navigation from '@/components/gallery/Navigation'
import Footer from '@/components/Footer'
import ArtworkCard from '@/components/gallery/ArtworkCard'
import Button from '@/components/ui/Button'
import Reveal from '@/components/common/Reveal'
import { getArtworkBySlug, getRelatedArtworks, getAllArtworkSlugs } from '@/lib/data/gallery'
import { mockArtworks } from '@/lib/utils/mockData'

// ─── Static params for SSG ────────────────────────────────────────────────────

export async function generateStaticParams() {
    try {
        const slugs = await getAllArtworkSlugs()
        return slugs.map(slug => ({ slug }))
    } catch {
        return mockArtworks.map(a => ({ slug: a.slug }))
    }
}

export const revalidate = 60 // ISR: revalidate every 60 seconds

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    try {
        const artwork = await getArtworkBySlug(params.slug)
        if (!artwork) return { title: 'Artwork | Sameeksha Arts' }
        return {
            title: `${artwork.title} | Sameeksha Arts`,
            description: artwork.description,
            openGraph: { title: artwork.title, description: artwork.description, type: 'article' },
        }
    } catch {
        return { title: 'Artwork | Sameeksha Arts' }
    }
}

// ─── Normalise DB artwork to the shape the UI expects ────────────────────────

function normaliseArtwork(dbArtwork: Awaited<ReturnType<typeof getArtworkBySlug>>) {
    if (!dbArtwork) return null
    const status = dbArtwork.availabilityStatus.toLowerCase() as 'available' | 'sold' | 'on_commission' | 'not_for_sale'
    const primaryImage = dbArtwork.images[0]?.mediaAsset
    return {
        ...dbArtwork,
        availabilityStatus: status,
        collection: {
            id: dbArtwork.collection?.id ?? '',
            name: dbArtwork.collection?.name ?? 'Uncategorised',
            slug: dbArtwork.collection?.slug ?? '',
            description: dbArtwork.collection?.description ?? '',
        },
        tags: [] as string[],
        colorPalette: undefined as undefined,
        images: dbArtwork.images.map(img => ({
            id: img.id,
            url: img.mediaAsset.originalUrl,
            thumbnailUrl: img.mediaAsset.thumbnailUrl,
            alt: dbArtwork.title,
            width: img.mediaAsset.width,
            height: img.mediaAsset.height,
            isPrimary: img.isPrimary,
        })),
        createdAt: dbArtwork.createdAt.toISOString(),
        imageUrl: primaryImage?.mediumUrl ?? null,
    }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ArtworkDetailPage({ params }: { params: { slug: string } }) {
    // Try DB first, fall back to mock
    let artwork: ReturnType<typeof normaliseArtwork> | (typeof mockArtworks)[0] | null = null
    let relatedRaw: (typeof mockArtworks) = []

    try {
        const dbArtwork = await getArtworkBySlug(params.slug)
        if (dbArtwork) {
            artwork = normaliseArtwork(dbArtwork)
            if (dbArtwork.collectionId) {
                const dbRelated = await getRelatedArtworks(dbArtwork.collectionId, dbArtwork.id)
                relatedRaw = dbRelated.map(a => normaliseArtwork(a)).filter(Boolean) as typeof mockArtworks
            }
        }
    } catch {
        // DB unavailable — fall through to mock
    }

    if (!artwork) {
        const mock = mockArtworks.find(a => a.slug === params.slug)
        if (!mock) notFound()
        artwork = mock
        relatedRaw = mockArtworks.filter(a => a.collectionId === mock.collectionId && a.id !== mock.id).slice(0, 3)
    }

    if (!artwork) notFound()

    const availabilityLabel: Record<string, string> = {
        available: 'Available for Purchase',
        sold: 'Sold',
        on_commission: 'Currently on Commission',
        not_for_sale: 'Not for Sale',
        AVAILABLE: 'Available for Purchase',
        SOLD: 'Sold',
        ON_COMMISSION: 'Currently on Commission',
        NOT_FOR_SALE: 'Not for Sale',
    }

    const availabilityStyle: Record<string, string> = {
        available: 'text-emerald-700 border-emerald-200 bg-emerald-50/60',
        sold: 'text-neutral-500 border-neutral-200 bg-neutral-50',
        on_commission: 'text-amber-700 border-amber-200 bg-amber-50/60',
        not_for_sale: 'text-neutral-500 border-neutral-200 bg-neutral-50',
        AVAILABLE: 'text-emerald-700 border-emerald-200 bg-emerald-50/60',
        SOLD: 'text-neutral-500 border-neutral-200 bg-neutral-50',
        ON_COMMISSION: 'text-amber-700 border-amber-200 bg-amber-50/60',
        NOT_FOR_SALE: 'text-neutral-500 border-neutral-200 bg-neutral-50',
    }

    const cp = (artwork as any).colorPalette
    const primaryImage = artwork.images[0]
    const imageStyle = primaryImage
        ? {}
        : cp
            ? { background: `linear-gradient(${cp.direction ?? 'to bottom right'}, ${cp.from}, ${cp.to})` }
            : { background: '#f3f1ed' }

    const status = artwork.availabilityStatus as string
    const isAvailable = status === 'available' || status === 'AVAILABLE'

    return (
        <div className="min-h-screen flex flex-col bg-primary-50">
            <Navigation />
            <main className="flex-grow pt-24">
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

                <section className="py-12 md:py-16">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
                            <Reveal direction="left" className="lg:col-span-7">
                                {primaryImage ? (
                                    <img
                                        src={primaryImage.url}
                                        alt={primaryImage.alt || artwork.title}
                                        className="w-full shadow-luxe object-cover aspect-[4/3]"
                                    />
                                ) : (
                                    <div className="relative w-full aspect-[4/3] overflow-hidden shadow-luxe" style={imageStyle} />
                                )}
                            </Reveal>

                            <Reveal direction="right" delay={120} className="lg:col-span-5 space-y-8">
                                <div className="flex items-center gap-4">
                                    <span className="h-px w-10 bg-accent-600/40" />
                                    <Link href={`/work?collection=${artwork.collection.slug}`}
                                        className="text-[0.65rem] uppercase tracking-[0.35em] text-accent-600 hover:text-accent-700 transition-colors"
                                        style={{ fontWeight: 500 }}>
                                        {artwork.collection.name}
                                    </Link>
                                </div>

                                <div>
                                    <h1 className="text-4xl md:text-5xl font-display text-neutral-900 leading-[1.08] tracking-tight" style={{ fontWeight: 400 }}>
                                        {artwork.title}
                                    </h1>
                                    <div className={`inline-flex items-center mt-4 px-4 py-2 border text-xs font-light tracking-wide ${availabilityStyle[status] ?? 'text-neutral-500 border-neutral-200 bg-neutral-50'}`}>
                                        {availabilityLabel[status] ?? status}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-x-8 gap-y-5 pt-6 border-t border-primary-200">
                                    {[
                                        { l: 'Year', v: String(artwork.year) },
                                        { l: 'Medium', v: artwork.medium },
                                        { l: 'Dimensions', v: artwork.dimensions },
                                        { l: 'Collection', v: artwork.collection.name },
                                    ].map(({ l, v }) => (
                                        <div key={l}>
                                            <p className="text-[0.6rem] uppercase tracking-[0.25em] text-neutral-400 mb-1" style={{ fontWeight: 500 }}>{l}</p>
                                            <p className="text-neutral-800 font-light">{v}</p>
                                        </div>
                                    ))}
                                </div>

                                {(artwork as any).tags?.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {(artwork as any).tags.map((tag: string) => (
                                            <span key={tag} className="px-3 py-1 border border-primary-200 text-[0.6rem] uppercase tracking-[0.2em] text-neutral-500 font-light">{tag}</span>
                                        ))}
                                    </div>
                                )}

                                <div className="space-y-3 text-neutral-600 leading-[1.9] font-light text-base border-t border-primary-200 pt-6">
                                    <p>{artwork.description}</p>
                                </div>

                                <div className="flex flex-wrap gap-3 pt-2">
                                    {isAvailable && <Button href="/contact" variant="primary">Enquire About This Work</Button>}
                                    <Button href="/commissions" variant="outline">Commission Similar Work</Button>
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </section>

                {relatedRaw.length > 0 && (
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
                                {relatedRaw.map((a, i) => (
                                    <Reveal key={a.id} delay={i * 60}>
                                        <ArtworkCard artwork={a as any} aspect="portrait" />
                                    </Reveal>
                                ))}
                            </div>
                            <Reveal className="mt-10">
                                <Link href="/work" className="inline-flex items-center gap-3 text-sm text-neutral-500 hover:text-accent-700 font-light transition-colors group">
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

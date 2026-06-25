import React from 'react'
import Navigation from '@/components/gallery/Navigation'
import Footer from '@/components/Footer'
import ArtworkCard from '@/components/gallery/ArtworkCard'
import Button from '@/components/ui/Button'
import Reveal from '@/components/common/Reveal'
import { getAllPublishedArtworks, getPageContent } from '@/lib/data/gallery'
import { mockArtworks } from '@/lib/utils/mockData'
import type { Artwork } from '@/lib/utils/mockData'

export const revalidate = 60

export const metadata = {
    title: 'Commissions | Sameeksha Arts',
    description: 'Commission a painting — portraits, celebrations, devotional works, and institutional pieces.',
}

/** Normalise a DB Artwork row to the shape ArtworkCard expects. */
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
        tags: [],
        colorPalette: undefined,
        createdAt: a.createdAt.toISOString(),
    }
}

const defaultSteps = [
    {
        n: 'I',
        title: 'The Conversation',
        body: 'Every commission begins with listening — to the story you want to hold, the feeling you want to live with, the occasion or person it honours.',
    },
    {
        n: 'II',
        title: 'Concept & Sketches',
        body: 'Composition, scale, palette — explored through rough studies before a brushstroke of paint is laid. You stay close to every decision.',
    },
    {
        n: 'III',
        title: 'The Painting',
        body: 'The slow work. Progress photographs shared at key stages. The canvas is built up in layers, with time given to each one.',
    },
    {
        n: 'IV',
        title: 'Delivery',
        body: 'Finished, dry, and documented. Shipped with care or collected from the studio. A record of the work accompanies it.',
    },
]

const types = [
    { n: 'I',   t: 'Portraits',    d: 'The face held still long enough to reveal who lives behind it — individuals, couples, families.' },
    { n: 'II',  t: 'Celebrations', d: 'Weddings, milestones, and the days a family wants to keep forever.' },
    { n: 'III', t: 'Devotional',   d: 'Sacred subjects rendered in the old symbols and the old patience — oil or Madhubani.' },
    { n: 'IV',  t: 'Institutional',d: 'Large-format works for corporate collections, public spaces, and institutional walls.' },
]

export default async function CommissionsPage() {
    // ── Data fetching with mock fallbacks ──────────────────────────────────────
    let artworks: Artwork[] = mockArtworks
    let steps = defaultSteps
    let invitationHeading: string | null = null
    let invitationText: string | null = null

    try {
        const [dbArtworks, pageContent] = await Promise.all([
            getAllPublishedArtworks(),
            getPageContent('commissions'),
        ])
        if (dbArtworks.length > 0) artworks = dbArtworks.map(normaliseArtwork)

        if (pageContent && typeof pageContent === 'object') {
            const content = pageContent as Record<string, unknown>

            // Override process steps if provided in CMS
            if (Array.isArray(content.steps) && content.steps.length > 0) {
                steps = (content.steps as Array<Record<string, unknown>>).map((s, i) => ({
                    n: ['I', 'II', 'III', 'IV'][i] ?? String(i + 1),
                    title: typeof s.title === 'string' ? s.title : defaultSteps[i]?.title ?? '',
                    body:  typeof s.body === 'string' ? s.body : defaultSteps[i]?.body ?? '',
                }))
            }
            // Override invitation section if provided
            if (content.invitation && typeof content.invitation === 'object') {
                const inv = content.invitation as Record<string, unknown>
                if (typeof inv.heading === 'string') invitationHeading = inv.heading
                if (typeof inv.text === 'string') invitationText = inv.text
            }
        }
    } catch {
        // DB unavailable — use mock fallback silently
    }

    const examples = artworks.filter(a => a.availabilityStatus !== 'sold').slice(0, 3)

    return (
        <div className="min-h-screen flex flex-col bg-primary-50">
            <Navigation />

            <main className="flex-grow pt-24">

                {/* ── Hero ── */}
                <section className="py-16 md:py-24 bg-accent-50 paper-texture">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <Reveal>
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-sm font-display italic text-accent-600" style={{ fontWeight: 500 }}>03</span>
                                <span className="h-px w-10 bg-accent-600/40" />
                                <span className="text-[0.65rem] uppercase tracking-[0.35em] text-accent-600" style={{ fontWeight: 500 }}>Commissions</span>
                            </div>
                            <h1 className="text-4xl md:text-[3.5rem] font-display text-neutral-900 tracking-tight leading-[1.05] max-w-2xl" style={{ fontWeight: 400 }}>
                                {invitationHeading ?? 'Have a Painting Made'}
                            </h1>
                            <p className="mt-5 text-2xl font-display italic text-accent-700 max-w-xl leading-[1.3]" style={{ fontWeight: 400 }}>
                                Every commission begins with listening.
                            </p>
                            <p className="mt-5 text-lg font-serif italic text-neutral-500 max-w-xl leading-relaxed">
                                {invitationText ?? 'A canvas grown from your story — beginning, as always, with a conversation and no obligation.'}
                            </p>
                            <div className="mt-10">
                                <Button href="/contact" variant="primary" size="lg">Begin the Conversation</Button>
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* ── Process ── */}
                <section className="py-16 md:py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <Reveal>
                            <div className="flex items-center gap-4 mb-12">
                                <span className="h-px w-10 bg-accent-600/40" />
                                <span className="text-[0.65rem] uppercase tracking-[0.35em] text-accent-600" style={{ fontWeight: 500 }}>How We&apos;ll Work Together</span>
                            </div>
                        </Reveal>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                            {steps.map((s, i) => (
                                <Reveal key={s.n} delay={i * 80}>
                                    <div className="bg-primary-50 p-8 h-full border border-primary-200/60 hover:border-accent-300 hover:shadow-luxe transition-all duration-500 ease-luxe group">
                                        <div className="text-2xl font-display italic text-accent-600 mb-4 group-hover:text-accent-700 transition-colors" style={{ fontWeight: 500 }}>{s.n}</div>
                                        <h3 className="font-display text-neutral-900 text-lg mb-3 tracking-tight" style={{ fontWeight: 500 }}>{s.title}</h3>
                                        <p className="text-neutral-500 text-sm font-light leading-relaxed">{s.body}</p>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Types ── */}
                <section className="py-16 md:py-24 bg-primary-50 paper-texture">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <Reveal>
                            <div className="flex items-center gap-4 mb-4">
                                <span className="h-px w-10 bg-accent-600/40" />
                                <span className="text-[0.65rem] uppercase tracking-[0.35em] text-accent-600" style={{ fontWeight: 500 }}>Types of Commission</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-display text-neutral-900 tracking-tight leading-[1.1] mb-12" style={{ fontWeight: 400 }}>
                                What Can Be Made
                            </h2>
                        </Reveal>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {types.map((c, i) => (
                                <Reveal key={c.n} delay={i * 70}>
                                    <div className="bg-white p-8 h-full border border-primary-200/60 hover:border-accent-300 hover:shadow-luxe transition-all duration-500 ease-luxe group">
                                        <div className="text-2xl font-display italic text-accent-600 mb-4 group-hover:text-accent-700 transition-colors" style={{ fontWeight: 500 }}>{c.n}</div>
                                        <h3 className="font-display text-neutral-900 text-lg mb-3 tracking-tight" style={{ fontWeight: 500 }}>{c.t}</h3>
                                        <p className="text-neutral-500 text-sm font-light leading-relaxed">{c.d}</p>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Examples ── */}
                <section className="py-16 md:py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <Reveal>
                            <div className="flex items-center gap-4 mb-4">
                                <span className="h-px w-10 bg-accent-600/40" />
                                <span className="text-[0.65rem] uppercase tracking-[0.35em] text-accent-600" style={{ fontWeight: 500 }}>Previous Work</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-display text-neutral-900 tracking-tight leading-[1.1] mb-12" style={{ fontWeight: 400 }}>
                                Examples of<br />
                                <span className="italic">Commissioned Work</span>
                            </h2>
                        </Reveal>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {examples.map((artwork, i) => (
                                <Reveal key={artwork.id} delay={i * 60}>
                                    <ArtworkCard artwork={artwork} aspect="portrait" />
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Artist quote ── */}
                <section className="py-16 md:py-20 bg-primary-800 text-white relative overflow-hidden paper-texture">
                    <div className="absolute -top-32 -left-20 w-[32rem] h-[32rem] rounded-full bg-accent-600/15 blur-3xl" />
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
                        <Reveal>
                            <div className="lg:max-w-2xl lg:ml-[10%]">
                                <p className="text-3xl md:text-[2.4rem] font-display italic text-primary-50 leading-[1.4]" style={{ fontWeight: 400 }}>
                                    &ldquo;[A quote from the artist about the commission process — what it means to create
                                    for someone, the joy of that collaboration]&rdquo;
                                </p>
                                <div className="hairline w-16 my-8 bg-white/20" />
                                <p className="text-accent-200/70 font-light text-sm">— Sameeksha</p>
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* ── CTA ── */}
                <section className="py-16 md:py-20 bg-accent-700 text-white relative overflow-hidden paper-texture">
                    <div className="absolute -bottom-32 -right-20 w-[32rem] h-[32rem] rounded-full bg-accent-600/30 blur-3xl" />
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
                        <Reveal>
                            <div className="max-w-xl">
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="h-px w-10 bg-white/30" />
                                    <span className="text-[0.65rem] uppercase tracking-[0.35em] text-accent-200" style={{ fontWeight: 500 }}>Ready to Begin</span>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-display text-white leading-[1.1] tracking-tight mb-5" style={{ fontWeight: 400 }}>
                                    The first step is simply<br />
                                    <span className="italic">to reach out</span>
                                </h2>
                                <p className="text-accent-100/80 font-light leading-[1.9] mb-8 max-w-sm text-sm">
                                    No obligation. Just a conversation about what you have in mind and whether the collaboration feels right.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <Button href="/contact" variant="secondary">Start a Conversation</Button>
                                    <Button href="/work" variant="outline" className="border-white/40 text-white hover:bg-white/10">View Portfolio</Button>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}

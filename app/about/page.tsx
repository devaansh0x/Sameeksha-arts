import React from 'react'
import Image from 'next/image'
import Navigation from '@/components/gallery/Navigation'
import Footer from '@/components/Footer'
import Button from '@/components/ui/Button'

export const metadata = {
    title: 'About | Sameeksha Arts',
    description: 'Learn about Sameeksha, her artistic journey, philosophy, and approach to creating meaningful artwork.',
}

export default function AboutPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navigation />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="py-24 md:py-32 bg-primary-50">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <p className="text-xs uppercase tracking-[0.3em] text-accent-600 font-medium mb-6">
                            About the Artist
                        </p>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-neutral-900 mb-8 leading-tight">
                            The Story Behind<br />the Canvas
                        </h1>
                        <p className="text-xl md:text-2xl text-neutral-700 font-serif font-light leading-relaxed max-w-2xl mx-auto">
                            [Brief introduction that sets the tone — what drives the artist,
                            what they believe about art, and what they hope to achieve]
                        </p>
                    </div>
                </section>

                {/* Biography Section */}
                <section className="py-24 md:py-32 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
                            <div className="lg:col-span-2">
                                <div className="relative aspect-[3/4] rounded-sm overflow-hidden bg-primary-100 sticky top-32">
                                    <Image
                                        src="https://placehold.co/600x800/ebe8df/9a7865?text=Artist+Portrait"
                                        alt="Artist portrait"
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 1024px) 100vw, 40vw"
                                    />
                                </div>
                            </div>

                            <div className="lg:col-span-3 space-y-12">
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-8 leading-tight">
                                        Biography
                                    </h2>
                                    <div className="space-y-6 text-neutral-700 leading-relaxed text-lg font-light">
                                        <p>
                                            [Early life and background — where the artist grew up, early influences,
                                            and the formative experiences that shaped their worldview]
                                        </p>

                                        <p>
                                            [Journey into art — what drew them to painting, early training or
                                            self-discovery, pivotal moments that defined their path]
                                        </p>

                                        <p className="font-serif italic text-xl text-neutral-600">
                                            "[A meaningful quote from the artist about a turning point in their
                                            artistic journey or a defining realization about their practice]"
                                        </p>

                                        <p>
                                            [Artistic evolution — how their work has developed over time, key
                                            influences, mentors, or experiences that shaped their current approach]
                                        </p>

                                        <p>
                                            [Current practice — what drives their work today, the themes they
                                            explore, and what they hope to achieve through their art]
                                        </p>
                                    </div>
                                </div>

                                <div className="border-l-4 border-accent-600 pl-8 py-2">
                                    <p className="text-2xl md:text-3xl font-display font-semibold text-neutral-800 leading-snug">
                                        Art is not about what<br />
                                        you see, but what<br />
                                        you remember
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Philosophy Section */}
                <section className="py-24 md:py-32 bg-primary-50">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <p className="text-xs uppercase tracking-[0.3em] text-accent-600 font-medium mb-6">
                                Artistic Philosophy
                            </p>
                            <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-8 leading-tight">
                                What I Believe<br />About Making Art
                            </h2>
                        </div>

                        <div className="max-w-3xl mx-auto space-y-8 text-neutral-700 leading-relaxed text-lg font-light mb-16">
                            <p>
                                [Core philosophy — what the artist believes art should be, their approach
                                to creating, and the values that guide their work]
                            </p>

                            <p>
                                [On process and patience — thoughts about the creative process, the importance
                                of time, and the relationship between technique and vision]
                            </p>

                            <p>
                                [On subject and meaning — how the artist chooses subjects, what they look for,
                                and what they hope to capture or express]
                            </p>

                            <p>
                                [On tradition and innovation — relationship to art history, classical techniques,
                                and contemporary expression]
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
                            <div>
                                <h3 className="text-2xl font-display font-semibold text-neutral-900 mb-4">
                                    On the Role of the Artist
                                </h3>
                                <p className="text-neutral-700 leading-relaxed font-light">
                                    [The artist's view on their role — are they a witness, translator,
                                    storyteller? What responsibility do they feel toward their subjects
                                    and viewers?]
                                </p>
                            </div>

                            <div>
                                <h3 className="text-2xl font-display font-semibold text-neutral-900 mb-4">
                                    On Beauty and Truth
                                </h3>
                                <p className="text-neutral-700 leading-relaxed font-light">
                                    [What the artist believes about beauty, honesty in art, and the
                                    relationship between aesthetic quality and emotional truth]
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Studio / Process Section */}
                <section className="py-24 md:py-32 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                            <div className="space-y-8">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.3em] text-accent-600 font-medium mb-4">
                                        Inside the Studio
                                    </p>
                                    <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-6 leading-tight">
                                        Where the Work<br />Comes to Life
                                    </h2>
                                </div>

                                <div className="space-y-6 text-neutral-700 leading-relaxed text-lg font-light">
                                    <p>
                                        [Description of the studio space — the environment where the artist works,
                                        what makes it special or conducive to creation]
                                    </p>

                                    <p>
                                        [Daily practice — typical working process, rituals, the rhythm of a
                                        day in the studio, how paintings develop over time]
                                    </p>

                                    <p>
                                        [Materials and technique — preferred mediums, tools, and approaches
                                        that define the artist's practice]
                                    </p>
                                </div>

                                <div className="pt-6">
                                    <Button href="/work" variant="outline">
                                        See the Results →
                                    </Button>
                                </div>
                            </div>

                            <div className="relative aspect-[4/3] rounded-sm overflow-hidden bg-primary-100">
                                <Image
                                    src="https://placehold.co/800x600/ebe8df/9a7865?text=Studio+Space"
                                    alt="Artist studio"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Call to Action */}
                <section className="py-24 md:py-32 bg-accent-700 text-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                            Let's Create Something<br />Meaningful Together
                        </h2>
                        <p className="text-lg text-accent-100 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
                            [Invitation to connect — whether interested in a commission, purchasing
                            existing work, or simply learning more about the practice]
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <a
                                href="/commissions"
                                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium bg-white text-accent-700 rounded-lg hover:bg-primary-50 transition-colors"
                            >
                                Commission Work
                            </a>
                            <a
                                href="/contact"
                                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium border-2 border-white text-white rounded-lg hover:bg-accent-800 transition-colors"
                            >
                                Get In Touch
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}

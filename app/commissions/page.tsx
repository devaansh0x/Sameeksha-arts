import React from 'react'
import Image from 'next/image'
import Navigation from '@/components/gallery/Navigation'
import Footer from '@/components/Footer'
import ArtworkCard from '@/components/gallery/ArtworkCard'
import Button from '@/components/ui/Button'
import { mockArtworks } from '@/lib/mockData'

export const metadata = {
    title: 'Commissions | Sameeksha Arts',
    description: 'Commission a custom painting. Learn about the collaborative process and explore possibilities.',
}

export default function CommissionsPage() {
    const commissionExamples = mockArtworks.slice(0, 3)

    return (
        <div className="min-h-screen flex flex-col">
            <Navigation />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="py-24 md:py-32 bg-accent-50">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <p className="text-xs uppercase tracking-[0.3em] text-accent-700 font-medium mb-6">
                            Commissions
                        </p>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-neutral-900 mb-8 leading-tight">
                            Let's Create<br />Something Together
                        </h1>
                        <p className="text-2xl md:text-3xl font-display font-semibold text-accent-700 max-w-2xl mx-auto leading-snug mb-8">
                            Every commission<br />
                            begins with listening
                        </p>
                        <p className="text-lg text-neutral-700 font-light leading-relaxed max-w-2xl mx-auto mb-12">
                            [Brief introduction to commissions — what makes the process special,
                            the collaborative nature, and what clients can expect]
                        </p>
                        <Button href="/contact" variant="primary" size="lg">
                            Begin the Conversation
                        </Button>
                    </div>
                </section>

                {/* The Approach */}
                <section className="py-24 md:py-32 bg-white">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-8">
                                How We'll Work Together
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
                            <div>
                                <div className="text-5xl font-display text-accent-600 mb-4">I</div>
                                <h3 className="text-2xl font-display font-semibold text-neutral-900 mb-4">
                                    Understanding
                                </h3>
                                <p className="text-neutral-700 leading-relaxed font-light">
                                    [Description of the initial consultation — conversation about vision,
                                    purpose, emotions, and what the artwork should capture or express]
                                </p>
                            </div>

                            <div>
                                <div className="text-5xl font-display text-accent-600 mb-4">II</div>
                                <h3 className="text-2xl font-display font-semibold text-neutral-900 mb-4">
                                    Development
                                </h3>
                                <p className="text-neutral-700 leading-relaxed font-light">
                                    [Description of concept development — sketches, composition planning,
                                    color exploration, and collaborative refinement]
                                </p>
                            </div>

                            <div>
                                <div className="text-5xl font-display text-accent-600 mb-4">III</div>
                                <h3 className="text-2xl font-display font-semibold text-neutral-900 mb-4">
                                    Creation
                                </h3>
                                <p className="text-neutral-700 leading-relaxed font-light">
                                    [Description of the painting process — time investment, updates,
                                    the artist's approach to bringing the vision to life]
                                </p>
                            </div>

                            <div>
                                <div className="text-5xl font-display text-accent-600 mb-4">IV</div>
                                <h3 className="text-2xl font-display font-semibold text-neutral-900 mb-4">
                                    Completion
                                </h3>
                                <p className="text-neutral-700 leading-relaxed font-light">
                                    [Description of final review, delivery, and beginning the relationship
                                    between the client and their new artwork]
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* What Can Be Commissioned */}
                <section className="py-24 md:py-32 bg-primary-50">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-4">
                                Types of Commissions
                            </h2>
                            <p className="text-lg text-neutral-700 font-light max-w-2xl mx-auto">
                                [Brief explanation of commission types available]
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white p-6 text-center">
                                <div className="text-4xl mb-4">I</div>
                                <h3 className="text-lg font-display font-semibold text-neutral-900 mb-2">
                                    Portraits
                                </h3>
                                <p className="text-sm text-neutral-600 font-light">
                                    [Brief description of portrait commissions — individuals,
                                    families, capturing essence and personality]
                                </p>
                            </div>

                            <div className="bg-white p-6 text-center">
                                <div className="text-4xl mb-4">II</div>
                                <h3 className="text-lg font-display font-semibold text-neutral-900 mb-2">
                                    Celebrations
                                </h3>
                                <p className="text-sm text-neutral-600 font-light">
                                    [Brief description of wedding/celebration art — commemorating
                                    special moments and milestones]
                                </p>
                            </div>

                            <div className="bg-white p-6 text-center">
                                <div className="text-4xl mb-4">III</div>
                                <h3 className="text-lg font-display font-semibold text-neutral-900 mb-2">
                                    Spiritual Works
                                </h3>
                                <p className="text-sm text-neutral-600 font-light">
                                    [Brief description of devotional art — creating meaningful
                                    spiritual and meditative pieces]
                                </p>
                            </div>

                            <div className="bg-white p-6 text-center">
                                <div className="text-4xl mb-4">IV</div>
                                <h3 className="text-lg font-display font-semibold text-neutral-900 mb-2">
                                    Institutions
                                </h3>
                                <p className="text-sm text-neutral-600 font-light">
                                    [Brief description of large-format works — corporate collections,
                                    public spaces, institutional collaborations]
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Commission Examples */}
                <section className="py-24 md:py-32 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <p className="text-xs uppercase tracking-[0.3em] text-accent-600 font-medium mb-4">
                                Previous Work
                            </p>
                            <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-4">
                                Examples of<br />Commissioned Work
                            </h2>
                            <p className="text-lg text-neutral-700 font-light max-w-2xl mx-auto">
                                [Brief context about past commissions]
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {commissionExamples.map((artwork) => (
                                <ArtworkCard key={artwork.id} artwork={artwork} size="medium" />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonial / Quote */}
                <section className="py-24 md:py-32 bg-primary-50">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="text-5xl text-accent-300 mb-6">"</div>
                        <p className="text-2xl md:text-3xl font-display font-semibold text-neutral-800 leading-snug mb-8">
                            [A quote from the artist about the commission process —<br />
                            what it means to create for someone, the joy of collaboration,<br />
                            or the responsibility of capturing what matters most]
                        </p>
                        <p className="text-neutral-600 font-light">— [Artist Name]</p>
                    </div>
                </section>

                {/* Begin Your Commission CTA */}
                <section className="py-24 md:py-32 bg-accent-700 text-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl md:text-4xl font-display font-bold mb-8">
                            Ready to Begin?
                        </h2>
                        <p className="text-2xl md:text-3xl font-display font-semibold text-accent-100 mb-8 leading-snug">
                            The first step is<br />
                            simply to reach out
                        </p>
                        <p className="text-lg text-accent-50 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
                            [Invitation to start the conversation — no obligation, just an opportunity
                            to discuss possibilities and see if the collaboration feels right]
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <a
                                href="/contact"
                                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium bg-white text-accent-700 rounded-lg hover:bg-primary-50 transition-colors"
                            >
                                Start a Conversation
                            </a>
                            <a
                                href="/work"
                                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium border-2 border-white text-white rounded-lg hover:bg-accent-800 transition-colors"
                            >
                                View Portfolio
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}

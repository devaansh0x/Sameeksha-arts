import React from 'react'
import Navigation from '@/components/gallery/Navigation'
import Footer from '@/components/Footer'
import Button from '@/components/ui/Button'
import Reveal from '@/components/common/Reveal'
import { portraitSwatch, studioSwatch } from '@/lib/utils/mockData'

export const metadata = {
    title: 'About | Sameeksha Arts',
    description: 'The story of Sameeksha — painter, Delhi studio, Madhubani lineage meets oil.',
}

export default function AboutPage() {
    return (
        <div className="min-h-screen flex flex-col bg-primary-50">
            <Navigation />

            <main className="flex-grow pt-24">

                {/* ── Hero ── */}
                <section className="py-16 md:py-24 bg-primary-50 paper-texture">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <Reveal>
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-sm font-display italic text-accent-500" style={{ fontWeight: 500 }}>01</span>
                                <span className="h-px w-10 bg-accent-600/40" />
                                <span className="text-[0.65rem] uppercase tracking-[0.35em] text-accent-600" style={{ fontWeight: 500 }}>The Artist</span>
                            </div>
                            <h1 className="text-4xl md:text-[3.5rem] font-display text-neutral-900 tracking-tight leading-[1.05] max-w-2xl" style={{ fontWeight: 400 }}>
                                The Story Behind<br />
                                <span className="italic">the Canvas</span>
                            </h1>
                            <p className="mt-6 text-lg font-serif italic text-neutral-500 max-w-xl leading-relaxed">
                                [Brief introduction — what drives the work, what she believes about painting,
                                and what she hopes each canvas holds for whoever lives with it]
                            </p>
                        </Reveal>
                    </div>
                </section>

                {/* ── Biography ── */}
                <section className="py-16 md:py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

                            <Reveal direction="left" className="lg:col-span-4 lg:sticky lg:top-28">
                                <div
                                    className="relative aspect-[3/4] max-h-[480px] overflow-hidden shadow-luxe"
                                    style={{ background: portraitSwatch }}
                                >
                                    <span className="pointer-events-none absolute inset-5 border border-white/30" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <p className="text-white/40 text-xs uppercase tracking-[0.25em] font-light">Artist portrait</p>
                                    </div>
                                </div>
                                <p className="mt-4 text-xs text-neutral-400 font-light tracking-wide">
                                    In the studio, Delhi · 2024
                                </p>
                            </Reveal>

                            <Reveal direction="right" delay={120} className="lg:col-span-8 space-y-10">
                                <div>
                                    <div className="flex items-center gap-4 mb-8">
                                        <span className="h-px w-10 bg-accent-600/40" />
                                        <span className="text-[0.65rem] uppercase tracking-[0.35em] text-accent-600" style={{ fontWeight: 500 }}>Biography</span>
                                    </div>
                                    <div className="space-y-6 text-neutral-600 leading-[1.9] font-light text-base max-w-xl">
                                        <p>[Early life and background — where she grew up, early influences, and the formative experiences that shaped her worldview]</p>
                                        <p>[Journey into art — what drew her to painting, early training, pivotal moments that defined her path]</p>
                                        <p>[Artistic evolution — how the work has developed, key influences, the moments that shifted everything]</p>
                                        <p>[Current practice — what drives the work today, the themes she returns to, what she hopes to give the people who live with it]</p>
                                    </div>
                                </div>

                                <blockquote className="text-2xl md:text-[2rem] font-display italic text-neutral-700 leading-[1.35] border-l border-accent-600/40 pl-7 max-w-xl" style={{ fontWeight: 400 }}>
                                    Art is not about what you see,
                                    <br />but what you remember.
                                </blockquote>

                                <div className="pt-2">
                                    <Button href="/work" variant="outline">See the work</Button>
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </section>

                {/* ── Philosophy ── */}
                <section className="py-16 md:py-24 bg-primary-800 text-white relative overflow-hidden paper-texture">
                    <div className="absolute -top-40 -right-20 w-[36rem] h-[36rem] rounded-full bg-accent-600/15 blur-3xl" />
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
                        <div className="lg:max-w-3xl lg:ml-[8%]">
                            <Reveal>
                                <div className="flex items-center gap-4 mb-8">
                                    <span className="h-px w-10 bg-white/30" />
                                    <span className="text-[0.65rem] uppercase tracking-[0.35em] text-accent-200" style={{ fontWeight: 500 }}>Artistic Philosophy</span>
                                </div>
                                <h2 className="text-3xl md:text-[2.6rem] font-display text-white leading-[1.12] tracking-tight mb-8" style={{ fontWeight: 400 }}>
                                    What I Believe About<br />
                                    <span className="italic">Making Art</span>
                                </h2>
                                <div className="space-y-5 text-primary-200/80 leading-[1.9] font-light max-w-xl">
                                    <p>[Core philosophy — what she believes art should be, the values that guide the work]</p>
                                    <p>[On process and patience — the creative practice, the importance of slowness]</p>
                                    <p>[On tradition and invention — relationship to classical Indian forms and contemporary expression]</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-12 pt-10 border-t border-white/15">
                                    {[
                                        { h: 'On the Role of the Artist', t: '[The view on what the artist owes the subject, the viewer, and the work itself]' },
                                        { h: 'On Beauty and Truth',        t: '[What she believes about beauty, honesty, and the relationship between the two]' },
                                    ].map(({ h, t }) => (
                                        <div key={h}>
                                            <h3 className="font-display text-white text-xl mb-3 tracking-tight" style={{ fontWeight: 400 }}>{h}</h3>
                                            <p className="text-primary-300/70 font-light leading-[1.8] text-sm">{t}</p>
                                        </div>
                                    ))}
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </section>

                {/* ── Studio ── */}
                <section className="py-16 md:py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

                            <Reveal direction="left" className="lg:col-span-6 space-y-8">
                                <div>
                                    <div className="flex items-center gap-4 mb-6">
                                        <span className="h-px w-10 bg-accent-600/40" />
                                        <span className="text-[0.65rem] uppercase tracking-[0.35em] text-accent-600" style={{ fontWeight: 500 }}>Inside the Studio</span>
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-display text-neutral-900 leading-[1.1] tracking-tight" style={{ fontWeight: 400 }}>
                                        Where the Work<br />
                                        <span className="italic">Comes to Life</span>
                                    </h2>
                                </div>

                                <div className="space-y-5 text-neutral-600 leading-[1.9] font-light text-base max-w-lg">
                                    <p>[The studio — where it is, what it looks like, what makes it the right place to work]</p>
                                    <p>[Daily practice — the rituals, the rhythm of a working day, how a painting begins and how it ends]</p>
                                    <p>[Materials and tools — the mediums, the surfaces, the specific things she reaches for]</p>
                                </div>

                                <Button href="/work" variant="outline">See the results</Button>
                            </Reveal>

                            <Reveal direction="right" delay={120} className="lg:col-span-6">
                                <div
                                    className="relative w-full aspect-[4/3] overflow-hidden shadow-luxe"
                                    style={{ background: studioSwatch }}
                                >
                                    <span className="pointer-events-none absolute inset-5 border border-white/20" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <p className="text-white/30 text-xs uppercase tracking-[0.25em] font-light">Studio photograph</p>
                                    </div>
                                </div>
                            </Reveal>
                        </div>
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
                                    <span className="text-[0.65rem] uppercase tracking-[0.35em] text-accent-200" style={{ fontWeight: 500 }}>Work Together</span>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-display text-white leading-[1.1] tracking-tight mb-6" style={{ fontWeight: 400 }}>
                                    Let's Create Something<br />
                                    <span className="italic">Meaningful Together</span>
                                </h2>
                                <p className="text-accent-100/80 font-light leading-[1.9] mb-8 max-w-sm">
                                    [Invitation — whether it's a commission, a purchase, or simply curiosity, the door is open]
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <Button href="/commissions" variant="secondary">Commission a Work</Button>
                                    <Button href="/contact" variant="outline" className="border-white/40 text-white hover:bg-white/10">Get in Touch</Button>
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

import React from 'react'
import Navigation from '@/components/gallery/Navigation'
import Footer from '@/components/Footer'
import ArtworkCard from '@/components/gallery/ArtworkCard'
import Button from '@/components/ui/Button'
import Reveal from '@/components/common/Reveal'
import ContactForm from '@/components/gallery/ContactForm'
import { mockArtworks, mockRecognition, mockTestimonials } from '@/lib/utils/mockData'

/** Left-aligned, offset gallery-catalogue heading for asymmetric layouts */
function SectionHeading({
    index,
    eyebrow,
    title,
    subtitle,
    light = false,
    className = '',
}: {
    index: string
    eyebrow: string
    title: React.ReactNode
    subtitle?: React.ReactNode
    light?: boolean
    className?: string
}) {
    return (
        <div className={`mb-10 md:mb-14 ${className}`}>
            <div className="flex items-center gap-4 mb-5">
                <span className={`text-sm font-display italic ${light ? 'text-accent-300' : 'text-accent-500'}`} style={{ fontWeight: 500 }}>
                    {index}
                </span>
                <span className={`h-px w-10 ${light ? 'bg-white/40' : 'bg-accent-600/40'}`} />
                <span className={`text-[0.65rem] uppercase tracking-[0.35em] ${light ? 'text-white/60' : 'text-accent-600'}`} style={{ fontWeight: 500 }}>
                    {eyebrow}
                </span>
            </div>
            <h2
                className={`text-4xl md:text-[3.25rem] font-display tracking-tight leading-[1.08] ${light ? 'text-white' : 'text-neutral-900'}`}
                style={{ fontWeight: 400 }}
            >
                {title}
            </h2>
            {subtitle && (
                <p className={`mt-5 text-lg font-serif italic max-w-xl leading-relaxed ${light ? 'text-white/70' : 'text-neutral-500'}`}>
                    {subtitle}
                </p>
            )}
        </div>
    )
}

export default function HomePage() {
    const featuredArtwork = mockArtworks[0]
    const works = mockArtworks.slice(0, 6)

    return (
        <div className="min-h-screen flex flex-col bg-primary-50 overflow-x-hidden">
            <Navigation />

            <main className="flex-grow">
                {/* ───────────────────────── HERO ───────────────────────── */}
                <section id="home" className="relative h-screen min-h-[660px] flex items-center overflow-hidden">
                    <div className="absolute inset-0">
                        <div
                            className="absolute inset-0 animate-kenburns"
                            style={{
                                background: featuredArtwork.colorPalette
                                    ? `linear-gradient(${featuredArtwork.colorPalette.direction || 'to bottom right'}, ${featuredArtwork.colorPalette.from}, ${featuredArtwork.colorPalette.to})`
                                    : 'linear-gradient(to bottom right, #e8d5c4, #8b7d6b)',
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/70 via-neutral-900/35 to-neutral-900/5" />
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/55 via-transparent to-neutral-900/15" />
                    </div>

                    {/* Floating caption — offset right */}
                    <div className="absolute bottom-12 right-6 lg:right-16 z-20 hidden md:block animate-float-slow">
                        <div className="glass px-7 py-5 shadow-luxe max-w-xs">
                            <p className="text-[0.6rem] uppercase tracking-[0.3em] text-accent-700 mb-2" style={{ fontWeight: 500 }}>On the easel</p>
                            <p className="text-neutral-900 font-display italic text-lg leading-snug" style={{ fontWeight: 500 }}>Where the Ganga meets the sky</p>
                            <div className="hairline w-8 my-3" />
                            <p className="text-xs text-neutral-600 font-light tracking-wide">Oil on canvas · 36 × 48 in · 2024</p>
                        </div>
                    </div>

                    {/* Content — pushed off-centre to the left */}
                    <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <div className="max-w-3xl lg:ml-4">
                            <div className="flex items-center gap-4 mb-10 animate-fade-up">
                                <span className="h-px w-10 bg-white/50" />
                                <span className="text-[0.65rem] uppercase tracking-[0.4em] text-white/75 letterpress" style={{ fontWeight: 500 }}>Paintings &amp; Commissions</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl lg:text-[5.75rem] font-display text-white mb-10 leading-[1.02] tracking-[-0.01em] letterpress animate-fade-up" style={{ fontWeight: 400, animationDelay: '120ms' }}>
                                Where pigment
                                <br />
                                <span className="italic text-gold glow-gold animate-glow ml-10 md:ml-20">remembers</span>
                                <br />
                                <span className="italic font-light">what words forget</span>
                            </h1>
                            <p className="text-lg md:text-xl text-white/80 max-w-xl font-serif leading-[1.7] mb-12 animate-fade-up md:ml-10" style={{ fontWeight: 300, animationDelay: '300ms' }}>
                                A Delhi studio where Madhubani lineage meets the slow patience of oil — each canvas
                                a quiet conversation between the sitter, the season, and the light that holds them.
                            </p>
                            <div className="flex flex-wrap gap-4 animate-fade-up md:ml-10" style={{ animationDelay: '440ms' }}>
                                <Button href="#work" size="lg" variant="primary">Explore the work</Button>
                                <a href="#commissions" className="inline-flex items-center justify-center px-10 py-4 text-base font-light border border-white/40 text-white rounded-xl hover:bg-white/10 hover:border-white transition-all duration-500 backdrop-blur-sm tracking-wide">
                                    Commission a painting
                                </a>
                            </div>
                        </div>
                    </div>

                </section>

                {/* ───────────────────────── THE ARTIST (asymmetric 5/7) ───────────────────────── */}
                <section id="about" className="py-20 md:py-28 bg-primary-50 paper-texture">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
                            {/* Portrait placeholder — kept compact until real image is added */}
                            <Reveal direction="left" className="lg:col-span-4 lg:mt-6 hidden lg:block">
                                <div className="relative aspect-[3/4] max-h-[420px] overflow-hidden shadow-luxe" style={{
                                    background: 'linear-gradient(135deg, #d4a574 0%, #9b7653 100%)',
                                }}>
                                    {/* Decorative inner border */}
                                    <span className="pointer-events-none absolute inset-5 border border-white/30" />
                                    {/* Placeholder label */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <p className="text-white/50 text-xs uppercase tracking-[0.25em] font-light">Artist portrait</p>
                                    </div>
                                </div>
                                <p className="mt-4 text-xs text-neutral-400 font-light tracking-wide lg:pl-2">
                                    In the studio, Delhi · 2024
                                </p>
                            </Reveal>

                            {/* Bio — wider */}
                            <Reveal direction="right" delay={150} className="lg:col-span-8 space-y-8">
                                <div>
                                    <div className="flex items-center gap-4 mb-6">
                                        <span className="text-sm font-display italic text-accent-500" style={{ fontWeight: 500 }}>01</span>
                                        <span className="h-px w-10 bg-accent-600/40" />
                                        <span className="text-[0.65rem] uppercase tracking-[0.35em] text-accent-600" style={{ fontWeight: 500 }}>The Hand Behind the Work</span>
                                    </div>
                                    <h2 className="text-5xl md:text-6xl font-display text-neutral-900 mb-5 leading-[1.0] tracking-tight" style={{ fontWeight: 400 }}>
                                        Sameeksha
                                    </h2>
                                    <p className="text-sm text-neutral-500 tracking-[0.15em] uppercase font-light">Painter · Delhi, India</p>
                                </div>

                                <blockquote className="text-2xl md:text-[2rem] font-display italic text-neutral-700 leading-[1.35] border-l border-accent-600/40 pl-7 max-w-2xl md:ml-8" style={{ fontWeight: 400 }}>
                                    I paint the way one keeps a diary — to hold onto things that want to vanish.
                                </blockquote>

                                <div className="space-y-5 text-neutral-600 leading-[1.9] text-base font-light max-w-xl">
                                    <p>
                                        Trained in the grammar of traditional Indian forms and devoted to the slow
                                        discipline of oil, her practice lives in the space between inheritance and invention.
                                    </p>
                                    <p>
                                        [Artist biography to be added — early years, training, the moments and people
                                        that shaped the work that hangs in these rooms today]
                                    </p>
                                </div>

                                <div className="pt-2">
                                    <Button href="#work" variant="outline">See the work</Button>
                                </div>

                                {/* Stats — no staggered Reveal inside parent Reveal to avoid invisible gaps */}
                                <div className="flex flex-wrap gap-x-12 gap-y-6 pt-10 mt-4 border-t border-primary-200">
                                    {[
                                        { n: '12+', l: 'Years at the easel' },
                                        { n: '340+', l: 'Works brought to life' },
                                        { n: '28', l: 'Honours received' },
                                        { n: '6', l: 'Countries that collect her' },
                                    ].map((s) => (
                                        <div key={s.l}>
                                            <div className="text-4xl md:text-5xl font-display text-accent-700 mb-1.5" style={{ fontWeight: 500 }}>{s.n}</div>
                                            <div className="text-xs text-neutral-500 font-light tracking-wide leading-snug max-w-[7rem]">{s.l}</div>
                                        </div>
                                    ))}
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </section>

                {/* ───────────────────────── PHILOSOPHY (offset, not centred) ───────────────────────── */}
                <section className="py-20 md:py-28 bg-primary-800 text-white relative overflow-hidden">
                    <div className="absolute inset-0 paper-texture" />
                    <div className="absolute -top-40 -left-20 w-[40rem] h-[40rem] rounded-full bg-accent-600/15 blur-3xl" />
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
                        <div className="lg:max-w-3xl lg:ml-[10%]">
                            <Reveal>
                                <div className="flex items-center gap-4 mb-10">
                                    <span className="h-px w-10 bg-white/30" />
                                    <span className="text-[0.65rem] uppercase tracking-[0.35em] text-accent-200" style={{ fontWeight: 500 }}>The Way of Working</span>
                                </div>
                                <p className="text-3xl md:text-[2.6rem] font-display italic leading-[1.4] text-balance text-primary-50" style={{ fontWeight: 400 }}>
                                    “A painting begins long before the brush — in <span className="text-accent-200 glow-gold">listening</span>:
                                    to the sitter, to the silence, to the hour the light keeps changing its mind.”
                                </p>
                                <div className="hairline w-16 my-8 bg-white/20" />
                                <p className="text-primary-200/80 max-w-xl leading-[1.9] font-light md:ml-auto md:text-right">
                                    [Artist's philosophy to be added — the beliefs, rituals, and patience that shape
                                    each work, in her own words]
                                </p>
                            </Reveal>
                        </div>
                    </div>
                </section>

                {/* ───────────────────────── SELECTED WORKS (asymmetric stagger) ───────────────────────── */}
                <section id="work" className="py-20 md:py-28 bg-white">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <Reveal>
                            <SectionHeading index="02" eyebrow="From the Studio Walls" title="Selected Works" subtitle="A handful of pieces, each carrying its own weather and silence" className="lg:ml-[8%]" />
                        </Reveal>

                        {/* 12-col asymmetric grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-x-8 lg:gap-y-8">
                            <Reveal className="lg:col-span-7"><ArtworkCard artwork={works[0]} aspect="landscape" /></Reveal>
                            <Reveal delay={60} className="lg:col-span-5"><ArtworkCard artwork={works[1]} aspect="portrait" /></Reveal>

                            <Reveal className="lg:col-span-5"><ArtworkCard artwork={works[2]} aspect="tall" /></Reveal>
                            <Reveal delay={60} className="lg:col-span-7"><ArtworkCard artwork={works[3]} aspect="landscape" /></Reveal>

                            <Reveal className="lg:col-span-7"><ArtworkCard artwork={works[4]} aspect="landscape" /></Reveal>
                            <Reveal delay={60} className="lg:col-span-5"><ArtworkCard artwork={works[5]} aspect="portrait" /></Reveal>
                        </div>

                        <Reveal className="text-right mt-10 lg:mr-[8%]">
                            <Button href="#contact" variant="primary" size="lg">Enquire About a Piece</Button>
                        </Reveal>
                    </div>
                </section>

                {/* ───────────────────────── COMMISSIONS (heading left, staggered cards) ───────────────────────── */}
                <section id="commissions" className="py-20 md:py-28 bg-accent-50">
                    <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
                        <Reveal>
                            <SectionHeading index="03" eyebrow="Commissions" title="Have a Painting Made" subtitle="A canvas grown from your story — beginning, as always, with a conversation" />
                        </Reveal>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl">
                            {[
                                { n: 'I', t: 'Portraits', d: 'The face held still long enough to reveal who lives behind it' },
                                { n: 'II', t: 'Celebrations', d: 'Weddings, milestones, and the days a family wants to keep forever' },
                                { n: 'III', t: 'Devotional', d: 'Sacred subjects rendered in the old symbols and the old patience' },
                                { n: 'IV', t: 'Institutional', d: 'Large-format works that give a wall its voice' },
                            ].map((c, i) => (
                                <Reveal key={c.t} delay={i * 80}>
                                    <div className="bg-white p-8 h-full border border-primary-200/60 hover:border-accent-300 hover:shadow-luxe transition-all duration-500 ease-luxe group">
                                        <div className="text-2xl font-display italic text-accent-600 mb-5 group-hover:text-accent-700 transition-colors" style={{ fontWeight: 500 }}>{c.n}</div>
                                        <h3 className="text-lg font-display text-neutral-900 mb-3 tracking-tight" style={{ fontWeight: 500 }}>{c.t}</h3>
                                        <p className="text-sm text-neutral-500 font-light leading-relaxed">{c.d}</p>
                                    </div>
                                </Reveal>
                            ))}
                        </div>

                        <Reveal className="mt-10 lg:ml-[40%]">
                            <Button href="#contact" variant="primary" size="lg">Begin the Conversation</Button>
                        </Reveal>
                    </div>
                </section>

                {/* ───────────────────────── RECOGNITION ───────────────────────── */}
                <section id="recognition" className="py-20 md:py-28 bg-white">
                    <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
                        <Reveal>
                            <SectionHeading index="04" eyebrow="Recognition" title="Where the Work Has Travelled" className="lg:ml-[10%]" />
                        </Reveal>

                        <div className="divide-y divide-primary-200/70 border-y border-primary-200/70">
                            {mockRecognition.map((item, i) => (
                                <Reveal key={item.id} delay={i * 40}>
                                    <div className="group flex flex-col md:flex-row md:items-center justify-between py-7 px-2 hover:px-6 hover:bg-primary-50/60 transition-all duration-500 ease-luxe">
                                        <div className="flex items-start gap-5 flex-grow mb-4 md:mb-0 md:pr-8">
                                            <span className="text-xs text-accent-500/70 font-display italic pt-1 tabular-nums" style={{ fontWeight: 500 }}>{String(i + 1).padStart(2, '0')}</span>
                                            <div>
                                                <h3 className="text-xl font-display text-neutral-900 mb-1.5 group-hover:text-accent-700 transition-colors tracking-tight hover-shadow-light" style={{ fontWeight: 500 }}>{item.title}</h3>
                                                <p className="text-neutral-500 text-sm font-light">{item.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm shrink-0 pl-10 md:pl-0">
                                            <span className="text-neutral-400 font-light tracking-wide">{new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
                                            <span className="text-[0.6rem] uppercase tracking-[0.2em] text-accent-600 border border-accent-200 rounded-full px-3 py-1" style={{ fontWeight: 500 }}>{item.type.replace(/_/g, ' ')}</span>
                                        </div>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ───────────────────────── TESTIMONIALS (alternating sides) ───────────────────────── */}
                <section className="py-20 md:py-28 bg-primary-100">
                    <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
                        <Reveal>
                            <SectionHeading index="05" eyebrow="In Their Own Words" title="Living Alongside the Work" className="lg:ml-[10%]" />
                        </Reveal>

                        <div className="space-y-10">
                            {mockTestimonials.map((t, i) => {
                                const alignRight = i % 2 === 1
                                return (
                    <Reveal key={t.id} delay={i * 60} direction={alignRight ? 'right' : 'left'} className={alignRight ? 'lg:ml-auto lg:mr-0 lg:text-right' : 'lg:mr-auto'}>
                                        <figure className={`bg-white p-10 md:p-12 border border-primary-200/60 shadow-sm relative max-w-2xl ${alignRight ? 'lg:ml-auto' : ''}`}>
                                            <span className={`absolute top-6 text-6xl font-display text-accent-200 leading-none select-none ${alignRight ? 'right-8' : 'left-8'}`} aria-hidden="true">&ldquo;</span>
                                            <blockquote className="text-xl md:text-2xl font-serif italic text-neutral-700 leading-[1.6] mb-7 relative z-10 pt-4">{t.text}</blockquote>
                                            <figcaption className={`flex items-center gap-4 ${alignRight ? 'lg:flex-row-reverse' : ''}`}>
                                                <span className="h-px w-8 bg-accent-400" />
                                                <div className={alignRight ? 'lg:text-right' : ''}>
                                                    <span className="block font-display text-neutral-900 tracking-tight" style={{ fontWeight: 500 }}>{t.clientName}</span>
                                                    {t.clientTitle && <span className="block text-sm text-neutral-400 font-light mt-0.5">{t.clientTitle}</span>}
                                                </div>
                                            </figcaption>
                                        </figure>
                                    </Reveal>
                                )
                            })}
                        </div>
                    </div>
                </section>

                {/* ───────────────────────── CONTACT (asymmetric 2/3) ───────────────────────── */}
                <section id="contact" className="py-20 md:py-28 bg-accent-700 text-white relative overflow-hidden">
                    <div className="absolute inset-0 paper-texture" />
                    <div className="absolute -bottom-40 -left-20 w-[36rem] h-[36rem] rounded-full bg-accent-600/30 blur-3xl" />
                    <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
                        <Reveal>
                            <SectionHeading index="06" eyebrow="An Invitation" title={<span className="italic">A single, unhurried conversation</span>} subtitle="Drawn to a piece, dreaming of a commission, or simply curious — the door is open, and there is no obligation in knocking." light />
                        </Reveal>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
                            <Reveal direction="left" className="lg:col-span-4 space-y-7 lg:mt-8">
                                {[
                                    { l: 'Write', v: 'hello@sameekshaarts.com', href: 'mailto:hello@sameekshaarts.com' },
                                    { l: 'Message', v: 'WhatsApp', href: 'https://wa.me/[phone-number]' },
                                    { l: 'Follow', v: '@[artist-handle]', href: 'https://instagram.com/[artist-handle]' },
                                ].map((c) => (
                                    <div key={c.l}>
                                        <p className="text-[0.6rem] uppercase tracking-[0.3em] text-accent-200 mb-1.5" style={{ fontWeight: 500 }}>{c.l}</p>
                                        <a href={c.href} className="text-white/90 hover:text-white font-light link-underline hover-glow-dark text-lg">{c.v}</a>
                                    </div>
                                ))}
                                <div>
                                    <p className="text-[0.6rem] uppercase tracking-[0.3em] text-accent-200 mb-1.5" style={{ fontWeight: 500 }}>Studio</p>
                                    <p className="text-white/90 font-light text-lg">Delhi, India</p>
                                    <p className="text-accent-100/70 text-sm font-light mt-1">Visits by appointment</p>
                                </div>
                                <div className="border-l border-white/30 pl-6 pt-1">
                                    <p className="font-display italic text-xl text-white/90 leading-snug" style={{ fontWeight: 400 }}>Every letter receives<br />a considered reply</p>
                                    <p className="text-accent-100/70 text-sm font-light mt-3">Usually within 24–48 hours</p>
                                </div>
                            </Reveal>

                            <Reveal direction="right" delay={120} className="lg:col-span-8">
                                <div className="bg-primary-50 text-neutral-900 p-8 md:p-12 shadow-luxe-lg">
                                    <ContactForm />
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}

import React from 'react'
import Navigation from '@/components/gallery/Navigation'
import Footer from '@/components/Footer'
import Reveal from '@/components/common/Reveal'
import Button from '@/components/ui/Button'
import { mockRecognition } from '@/lib/utils/mockData'

export const metadata = {
    title: 'Recognition | Sameeksha Arts',
    description: 'Awards, exhibitions, institutional collaborations, and press.',
}

const typeLabel: Record<string, string> = {
    award:                      'Award',
    exhibition:                 'Exhibition',
    institutional_collaboration:'Collaboration',
    press:                      'Press',
}

// Group recognition entries by type for the sectioned layout
const typeOrder = ['award', 'exhibition', 'institutional_collaboration', 'press'] as const

export default function RecognitionPage() {
    const grouped = typeOrder.reduce<Record<string, typeof mockRecognition>>((acc, type) => {
        const items = mockRecognition.filter(r => r.type === type)
        if (items.length > 0) acc[type] = items
        return acc
    }, {})

    return (
        <div className="min-h-screen flex flex-col bg-primary-50">
            <Navigation />

            <main className="flex-grow pt-24">

                {/* ── Hero ── */}
                <section className="py-16 md:py-24 bg-primary-50 paper-texture">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <Reveal>
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-sm font-display italic text-accent-500" style={{ fontWeight: 500 }}>04</span>
                                <span className="h-px w-10 bg-accent-600/40" />
                                <span className="text-[0.65rem] uppercase tracking-[0.35em] text-accent-600" style={{ fontWeight: 500 }}>Recognition</span>
                            </div>
                            <h1 className="text-4xl md:text-[3.5rem] font-display text-neutral-900 tracking-tight leading-[1.05] max-w-2xl" style={{ fontWeight: 400 }}>
                                Where the Work<br />
                                <span className="italic">Has Travelled</span>
                            </h1>
                            <p className="mt-6 text-lg font-serif italic text-neutral-500 max-w-xl leading-relaxed">
                                [Brief introduction — what these awards, exhibitions, and collaborations represent
                                in the arc of the work]
                            </p>
                        </Reveal>
                    </div>
                </section>

                {/* ── Full list ── */}
                <section className="py-16 md:py-20 bg-white">
                    <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">

                        {/* All entries — single list matching homepage style */}
                        <div className="divide-y divide-primary-200/70 border-y border-primary-200/70">
                            {mockRecognition.map((item, i) => (
                                <Reveal key={item.id} delay={i * 40}>
                                    <div className="group flex flex-col md:flex-row md:items-center justify-between py-7 px-2 hover:px-6 hover:bg-primary-50/60 transition-all duration-500 ease-luxe">
                                        <div className="flex items-start gap-5 flex-grow mb-4 md:mb-0 md:pr-8">
                                            <span className="text-xs text-accent-500/70 font-display italic pt-1 tabular-nums" style={{ fontWeight: 500 }}>
                                                {String(i + 1).padStart(2, '0')}
                                            </span>
                                            <div>
                                                <h3 className="text-xl font-display text-neutral-900 mb-1.5 group-hover:text-accent-700 transition-colors tracking-tight hover-shadow-light" style={{ fontWeight: 500 }}>
                                                    {item.title}
                                                </h3>
                                                <p className="text-neutral-500 text-sm font-light">{item.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm shrink-0 pl-10 md:pl-0">
                                            <span className="text-neutral-400 font-light tracking-wide">
                                                {new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                                            </span>
                                            <span className="text-[0.6rem] uppercase tracking-[0.2em] text-accent-600 border border-accent-200 rounded-full px-3 py-1" style={{ fontWeight: 500 }}>
                                                {typeLabel[item.type] ?? item.type.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Grouped sections ── */}
                {Object.entries(grouped).map(([type, items]) => (
                    <section key={type} className="py-14 md:py-18 bg-primary-50 border-t border-primary-200/60">
                        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
                            <Reveal>
                                <div className="flex items-center gap-4 mb-8">
                                    <span className="h-px w-10 bg-accent-600/40" />
                                    <span className="text-[0.65rem] uppercase tracking-[0.35em] text-accent-600" style={{ fontWeight: 500 }}>
                                        {typeLabel[type]}s
                                    </span>
                                </div>
                            </Reveal>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {items.map((item, i) => (
                                    <Reveal key={item.id} delay={i * 60}>
                                        <div className="bg-white p-7 border border-primary-200/60 hover:border-accent-300 hover:shadow-luxe transition-all duration-500 ease-luxe">
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <h3 className="font-display text-neutral-900 text-lg tracking-tight leading-tight" style={{ fontWeight: 500 }}>
                                                    {item.title}
                                                </h3>
                                                <span className="text-xs text-neutral-400 font-light tabular-nums shrink-0 mt-1">
                                                    {new Date(item.date).getFullYear()}
                                                </span>
                                            </div>
                                            <p className="text-neutral-500 text-sm font-light leading-relaxed">{item.description}</p>
                                        </div>
                                    </Reveal>
                                ))}
                            </div>
                        </div>
                    </section>
                ))}

                {/* ── CTA ── */}
                <section className="py-16 md:py-20 bg-white border-t border-primary-200/60">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <Reveal>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div>
                                    <div className="flex items-center gap-4 mb-4">
                                        <span className="h-px w-10 bg-accent-600/40" />
                                        <span className="text-[0.65rem] uppercase tracking-[0.35em] text-accent-600" style={{ fontWeight: 500 }}>See the Work</span>
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-display text-neutral-900 tracking-tight" style={{ fontWeight: 400 }}>
                                        Explore the paintings<br />
                                        <span className="italic">behind these moments</span>
                                    </h2>
                                </div>
                                <div className="flex flex-wrap gap-4 shrink-0">
                                    <Button href="/work" variant="primary">Browse the Gallery</Button>
                                    <Button href="/contact" variant="outline">Get in Touch</Button>
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

import React from 'react'
import Navigation from '@/components/gallery/Navigation'
import Footer from '@/components/Footer'
import ContactForm from '@/components/gallery/ContactForm'
import Reveal from '@/components/common/Reveal'

export const metadata = {
    title: 'Contact | Sameeksha Arts',
    description: 'Get in touch to discuss commissions, inquire about artwork, or simply connect.',
}

export default function ContactPage() {
    return (
        <div className="min-h-screen flex flex-col bg-primary-50">
            <Navigation />

            <main className="flex-grow pt-24">

                {/* ── Hero ── */}
                <section className="py-16 md:py-24 bg-primary-50 paper-texture">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <Reveal>
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-sm font-display italic text-accent-500" style={{ fontWeight: 500 }}>06</span>
                                <span className="h-px w-10 bg-accent-600/40" />
                                <span className="text-[0.65rem] uppercase tracking-[0.35em] text-accent-600" style={{ fontWeight: 500 }}>An Invitation</span>
                            </div>
                            <h1 className="text-4xl md:text-[3.5rem] font-display text-neutral-900 tracking-tight leading-[1.05] max-w-2xl" style={{ fontWeight: 400 }}>
                                Let's Start<br />
                                <span className="italic">a Conversation</span>
                            </h1>
                            <p className="mt-6 text-lg font-serif italic text-neutral-500 max-w-xl leading-relaxed">
                                Drawn to a piece, dreaming of a commission, or simply curious —
                                the door is open, and there is no obligation in knocking.
                            </p>
                        </Reveal>
                    </div>
                </section>

                {/* ── Main content ── */}
                <section className="py-16 md:py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

                            {/* Contact info */}
                            <Reveal direction="left" className="lg:col-span-4 space-y-7 lg:sticky lg:top-28">
                                <div>
                                    <div className="flex items-center gap-4 mb-6">
                                        <span className="h-px w-10 bg-accent-600/40" />
                                        <span className="text-[0.65rem] uppercase tracking-[0.35em] text-accent-600" style={{ fontWeight: 500 }}>Ways to Connect</span>
                                    </div>

                                    <div className="space-y-6">
                                        {[
                                            { l: 'Email',     v: 'hello@sameekshaarts.com',  href: 'mailto:hello@sameekshaarts.com' },
                                            { l: 'WhatsApp',  v: 'Message on WhatsApp',       href: 'https://wa.me/[phone-number]' },
                                            { l: 'Instagram', v: '@[artist-handle]',          href: 'https://instagram.com/[artist-handle]' },
                                        ].map(({ l, v, href }) => (
                                            <div key={l}>
                                                <p className="text-[0.6rem] uppercase tracking-[0.25em] text-neutral-400 mb-1.5" style={{ fontWeight: 500 }}>{l}</p>
                                                <a href={href} className="text-neutral-700 hover:text-accent-700 font-light transition-colors link-underline">
                                                    {v}
                                                </a>
                                            </div>
                                        ))}
                                        <div>
                                            <p className="text-[0.6rem] uppercase tracking-[0.25em] text-neutral-400 mb-1.5" style={{ fontWeight: 500 }}>Studio</p>
                                            <p className="text-neutral-700 font-light">Delhi, India</p>
                                            <p className="text-neutral-400 text-sm font-light mt-1">Visits by appointment</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-l-2 border-accent-400/60 pl-6 py-1">
                                    <p className="font-display italic text-xl text-neutral-700 leading-snug" style={{ fontWeight: 400 }}>
                                        Every letter receives<br />a considered reply
                                    </p>
                                    <p className="text-neutral-400 text-sm font-light mt-3">Usually within 24–48 hours</p>
                                </div>
                            </Reveal>

                            {/* Form */}
                            <Reveal direction="right" delay={120} className="lg:col-span-8">
                                <div className="flex items-center gap-4 mb-8">
                                    <span className="h-px w-10 bg-accent-600/40" />
                                    <span className="text-[0.65rem] uppercase tracking-[0.35em] text-accent-600" style={{ fontWeight: 500 }}>Send a Message</span>
                                </div>
                                <div className="bg-primary-50 p-8 md:p-10 border border-primary-200/60">
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

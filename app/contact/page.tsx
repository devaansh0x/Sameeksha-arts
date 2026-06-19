import React from 'react'
import Navigation from '@/components/gallery/Navigation'
import Footer from '@/components/Footer'
import ContactForm from '@/components/gallery/ContactForm'

export const metadata = {
    title: 'Contact | Sameeksha Arts',
    description: 'Get in touch to discuss commissions, inquire about artwork, or simply connect.',
}

export default function ContactPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navigation />

            <main className="flex-grow">
                {/* Hero */}
                <section className="py-24 md:py-32 bg-primary-50">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <p className="text-xs uppercase tracking-[0.3em] text-accent-600 font-medium mb-6">
                            Get In Touch
                        </p>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display text-neutral-900 mb-8 leading-tight" style={{ fontWeight: 400 }}>
                            Let's Start<br />a Conversation
                        </h1>
                        <p className="text-xl md:text-2xl text-neutral-600 font-serif font-light leading-relaxed max-w-2xl mx-auto">
                            Whether you have a commission in mind, are drawn to a work in the gallery,
                            or are simply curious — every message receives a thoughtful reply.
                        </p>
                    </div>
                </section>

                {/* Main Content */}
                <section className="py-20 md:py-28 bg-white">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">

                            {/* Left — Info */}
                            <div className="lg:col-span-2 space-y-10">
                                <div>
                                    <h2 className="text-2xl font-display text-neutral-900 mb-6" style={{ fontWeight: 400 }}>
                                        Ways to connect
                                    </h2>

                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.2em] text-accent-600 font-medium mb-1">
                                                Email
                                            </p>
                                            <a
                                                href="mailto:[artist@email.com]"
                                                className="text-neutral-700 hover:text-accent-700 font-light transition-colors"
                                            >
                                                [artist@email.com]
                                            </a>
                                        </div>

                                        <div>
                                            <p className="text-xs uppercase tracking-[0.2em] text-accent-600 font-medium mb-1">
                                                WhatsApp
                                            </p>
                                            <a
                                                href="https://wa.me/[phone-number]"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-neutral-700 hover:text-accent-700 font-light transition-colors"
                                            >
                                                Message on WhatsApp
                                            </a>
                                        </div>

                                        <div>
                                            <p className="text-xs uppercase tracking-[0.2em] text-accent-600 font-medium mb-1">
                                                Instagram
                                            </p>
                                            <a
                                                href="https://instagram.com/[artist-handle]"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-neutral-700 hover:text-accent-700 font-light transition-colors"
                                            >
                                                @[artist-handle]
                                            </a>
                                        </div>

                                        <div>
                                            <p className="text-xs uppercase tracking-[0.2em] text-accent-600 font-medium mb-1">
                                                Studio
                                            </p>
                                            <p className="text-neutral-700 font-light">
                                                [City], India
                                            </p>
                                            <p className="text-neutral-500 text-sm font-light mt-1">
                                                Studio visits by appointment
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-l-2 border-accent-300 pl-6 py-1">
                                    <p className="text-lg font-display text-neutral-700 leading-snug" style={{ fontWeight: 400 }}>
                                        Every inquiry receives<br />
                                        a thoughtful response
                                    </p>
                                    <p className="text-sm text-neutral-500 font-light mt-3">
                                        Typically within 24–48 hours
                                    </p>
                                </div>
                            </div>

                            {/* Right — Form */}
                            <div className="lg:col-span-3">
                                <h2 className="text-2xl font-display text-neutral-900 mb-8" style={{ fontWeight: 400 }}>
                                    Send a message
                                </h2>
                                <ContactForm />
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}

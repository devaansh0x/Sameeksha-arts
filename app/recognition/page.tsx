import React from 'react'
import Navigation from '@/components/gallery/Navigation'
import Footer from '@/components/Footer'
import { mockRecognition } from '@/lib/mockData'

export const metadata = {
    title: 'Recognition | Sameeksha Arts',
    description: 'Awards, exhibitions, and institutional collaborations.',
}

export default function RecognitionPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navigation />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="py-24 md:py-32 bg-primary-50">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <p className="text-xs uppercase tracking-[0.3em] text-accent-600 font-medium mb-6">
                            Recognition
                        </p>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-neutral-900 mb-8 leading-tight">
                            Awards, Exhibitions<br />& Collaborations
                        </h1>
                        <p className="text-xl md:text-2xl text-neutral-700 font-serif font-light leading-relaxed max-w-2xl mx-auto">
                            [Brief introduction to recognition — what these achievements represent
                            in the artist's journey and body of work]
                        </p>
                    </div>
                </section>

                {/* Recognition Timeline */}
                <section className="py-24 md:py-32 bg-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="space-y-4">
                            {mockRecognition.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex flex-col md:flex-row md:items-center justify-between p-8 bg-primary-50 border border-primary-200 hover:border-accent-300 transition-colors"
                                >
                                    <div className="flex-grow mb-4 md:mb-0">
                                        <h3 className="text-xl font-display font-semibold text-neutral-900 mb-2">
                                            {item.title}
                                        </h3>
                                        <p className="text-neutral-700 font-light">{item.description}</p>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="text-neutral-500 font-light">
                                            {new Date(item.date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                            })}
                                        </span>
                                        <span className="px-3 py-1 bg-accent-100 text-accent-700 text-xs font-medium uppercase tracking-wide">
                                            {item.type.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}

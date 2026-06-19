import React from 'react'
import Link from 'next/link'
import { Artwork } from '@/lib/mockData'

interface ArtworkCardProps {
    artwork: Artwork
    /** controls the canvas proportion for asymmetric layouts */
    aspect?: 'portrait' | 'landscape' | 'tall' | 'square'
    /** extra classes for grid placement / offsets */
    className?: string
}

const aspectClasses: Record<NonNullable<ArtworkCardProps['aspect']>, string> = {
    portrait: 'aspect-[4/5]',
    landscape: 'aspect-[4/3]',
    tall: 'aspect-[3/4]',
    square: 'aspect-square',
}

export default function ArtworkCard({ artwork, aspect = 'portrait', className = '' }: ArtworkCardProps) {
    const availabilityColors = {
        available: 'bg-emerald-600/90',
        sold: 'bg-red-600/90',
        on_commission: 'bg-amber-600/90',
        not_for_sale: 'bg-neutral-700/90',
    }

    const availabilityLabels = {
        available: 'Available',
        sold: 'Sold',
        on_commission: 'On Commission',
        not_for_sale: 'Not for Sale',
    }

    const gradientStyle = artwork.colorPalette
        ? {
            background: `linear-gradient(${artwork.colorPalette.direction || 'to bottom right'}, ${artwork.colorPalette.from}, ${artwork.colorPalette.to})`,
        }
        : { background: '#f3f1ed' }

    return (
        <Link
            href={`/work/${artwork.slug}`}
            className={`group block relative overflow-hidden bg-primary-100 transition-all duration-700 ease-luxe hover:shadow-luxe-lg hover:-translate-y-2 ${className}`}
        >
            {/* Thin gold frame on hover */}
            <span className="pointer-events-none absolute inset-0 z-20 border border-accent-300/0 group-hover:border-accent-300/60 transition-colors duration-700 m-3" />

            {/* Gradient color tile */}
            <div className={`relative w-full ${aspectClasses[aspect]} overflow-hidden transition-transform duration-[1.4s] ease-luxe group-hover:scale-110`} style={gradientStyle} />

            {/* Always-visible availability badge */}
            <div className="absolute top-5 right-5 z-10">
                <span
                    className={`px-3.5 py-1.5 text-[0.6rem] font-medium uppercase tracking-[0.18em] text-white backdrop-blur-md rounded-full shadow-sm ${availabilityColors[artwork.availabilityStatus]}`}
                >
                    {availabilityLabels[artwork.availabilityStatus]}
                </span>
            </div>

            {/* Gradient overlay + caption */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/75 via-neutral-900/10 to-transparent opacity-35 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            {/* Gallery label plaque */}
            <div className="absolute inset-x-0 bottom-0 p-6 text-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-luxe">
                <div className="relative mx-auto inline-block max-w-[88%] px-8 py-5 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-[900ms] ease-luxe">
                    {/* frosted backing */}
                    <span className="absolute inset-0 bg-neutral-900/30 backdrop-blur-[2px]" />
                    {/* fine inset frame */}
                    <span className="pointer-events-none absolute inset-[3px] border border-white/25" />

                    {/* top-centre diamond flourish */}
                    <span className="absolute -top-[3px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rotate-45 bg-accent-200/90" />

                    <div className="relative">
                        <h3 className="text-[1.6rem] font-display italic tracking-tight leading-tight glow-gold" style={{ fontWeight: 500 }}>
                            {artwork.title}
                        </h3>
                        <div className="flex items-center justify-center gap-3 mt-2.5">
                            <span className="h-px w-6 bg-white/30" />
                            <p className="text-[0.65rem] uppercase tracking-[0.28em] text-white/75 font-light whitespace-nowrap">
                                {artwork.year} · {artwork.medium}
                            </p>
                            <span className="h-px w-6 bg-white/30" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}

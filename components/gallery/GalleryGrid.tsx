'use client'

import React, { useState, useMemo, useCallback } from 'react'
import ArtworkCard from '@/components/gallery/ArtworkCard'
import Reveal from '@/components/common/Reveal'
import { TAG_GROUPS } from '@/lib/utils/mockData'
import type { Artwork, Collection } from '@/lib/utils/mockData'

// ─── Types ────────────────────────────────────────────────────────────────────

type SortKey = 'newest' | 'oldest' | 'title'

// ─── Chevron icon ─────────────────────────────────────────────────────────────

function ChevronDown({ className = '' }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
    )
}

// ─── Collapsible filter group ─────────────────────────────────────────────────

function FilterGroup({
    label,
    tags,
    activeTags,
    onToggle,
}: {
    label: string
    tags: readonly string[]
    activeTags: Set<string>
    onToggle: (tag: string) => void
}) {
    const [open, setOpen] = useState(true)
    const activeCount = tags.filter(t => activeTags.has(t)).length

    return (
        <div className="border-b border-primary-200/70 last:border-0">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between py-4 text-left group"
            >
                <span className="flex items-center gap-2">
                    <span className="text-[0.65rem] uppercase tracking-[0.3em] text-neutral-600 font-light" style={{ fontWeight: 500 }}>
                        {label}
                    </span>
                    {activeCount > 0 && (
                        <span className="text-[0.6rem] bg-accent-700 text-white rounded-full w-4 h-4 flex items-center justify-center" style={{ fontWeight: 500 }}>
                            {activeCount}
                        </span>
                    )}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="pb-4 space-y-1.5">
                    {tags.map(tag => {
                        const active = activeTags.has(tag)
                        return (
                            <button
                                key={tag}
                                onClick={() => onToggle(tag)}
                                className={`w-full text-left px-3 py-2 text-sm font-light transition-all duration-200 flex items-center justify-between group/tag ${
                                    active
                                        ? 'bg-accent-700 text-white'
                                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-primary-100'
                                }`}
                            >
                                <span>{tag}</span>
                                {active && (
                                    <span className="text-white/70 text-xs">✕</span>
                                )}
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

// ─── Active filter chip ───────────────────────────────────────────────────────

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <button
            onClick={onRemove}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-700 text-white text-xs font-light tracking-wide hover:bg-accent-800 transition-colors"
        >
            {label}
            <span className="text-white/70" aria-hidden="true">✕</span>
        </button>
    )
}

// ─── GalleryGrid ─────────────────────────────────────────────────────────────

interface GalleryGridProps {
    artworks: Artwork[]
    collections: Collection[]
}

export default function GalleryGrid({ artworks, collections }: GalleryGridProps) {
    const [activeCollection, setActiveCollection] = useState<string>('all')
    const [activeTags, setActiveTags] = useState<Set<string>>(new Set())
    const [sort, setSort] = useState<SortKey>('newest')
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

    const toggleTag = useCallback((tag: string) => {
        setActiveTags(prev => {
            const next = new Set(prev)
            next.has(tag) ? next.delete(tag) : next.add(tag)
            return next
        })
    }, [])

    const clearAll = useCallback(() => {
        setActiveCollection('all')
        setActiveTags(new Set())
    }, [])

    const filtered = useMemo(() => {
        let result = artworks
        if (activeCollection !== 'all') {
            result = result.filter(a => a.collectionId === activeCollection)
        }
        if (activeTags.size > 0) {
            result = result.filter(a => [...activeTags].every(t => a.tags.includes(t)))
        }
        switch (sort) {
            case 'oldest': return [...result].sort((a, b) => a.year - b.year)
            case 'title':  return [...result].sort((a, b) => a.title.localeCompare(b.title))
            default:       return [...result].sort((a, b) => b.year - a.year || b.createdAt.localeCompare(a.createdAt))
        }
    }, [artworks, activeCollection, activeTags, sort])

    const activeCollection_obj = collections.find(c => c.id === activeCollection)
    const hasFilters = activeCollection !== 'all' || activeTags.size > 0

    // Derive which tags are actually present in the current collection scope
    // so we don't show tag options that would always yield 0 results.
    const availableTagsInScope = useMemo(() => {
        const scopedArtworks = activeCollection === 'all'
            ? artworks
            : artworks.filter(a => a.collectionId === activeCollection)
        const set = new Set<string>()
        scopedArtworks.forEach(a => a.tags.forEach(t => set.add(t)))
        return set
    }, [artworks, activeCollection])

    const sidebar = (
        <aside className="space-y-0">
            {/* Collection nav */}
            <div className="mb-6">
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-neutral-400 mb-3 px-1 font-light" style={{ fontWeight: 500 }}>
                    Collections
                </p>
                <div className="space-y-0.5">
                    <button
                        onClick={() => setActiveCollection('all')}
                        className={`w-full text-left px-3 py-2.5 text-sm font-light transition-all flex items-center justify-between ${
                            activeCollection === 'all'
                                ? 'text-accent-700 border-l-2 border-accent-700 bg-accent-50/50 pl-[10px]'
                                : 'text-neutral-600 hover:text-neutral-900 border-l-2 border-transparent hover:border-primary-300 hover:pl-[10px]'
                        }`}
                    >
                        <span>All Works</span>
                        <span className="text-neutral-400 text-xs tabular-nums">{artworks.length}</span>
                    </button>
                    {collections.map(col => {
                        const count = artworks.filter(a => a.collectionId === col.id).length
                        return (
                            <button
                                key={col.id}
                                onClick={() => setActiveCollection(col.id)}
                                className={`w-full text-left px-3 py-2.5 text-sm font-light transition-all flex items-center justify-between ${
                                    activeCollection === col.id
                                        ? 'text-accent-700 border-l-2 border-accent-700 bg-accent-50/50 pl-[10px]'
                                        : 'text-neutral-600 hover:text-neutral-900 border-l-2 border-transparent hover:border-primary-300 hover:pl-[10px]'
                                }`}
                            >
                                <span>{col.name}</span>
                                <span className="text-neutral-400 text-xs tabular-nums">{count}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Hairline */}
            <div className="h-px bg-primary-200 mb-6" />

            {/* Tag filters */}
            <div>
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-neutral-400 mb-3 px-1 font-light" style={{ fontWeight: 500 }}>
                    Filter by
                </p>
                {Object.entries(TAG_GROUPS).map(([key, group]) => {
                    // Only show tags that exist in the current scope
                    const visibleTags = group.tags.filter(t => availableTagsInScope.has(t))
                    if (visibleTags.length === 0) return null
                    return (
                        <FilterGroup
                            key={key}
                            label={group.label}
                            tags={visibleTags}
                            activeTags={activeTags}
                            onToggle={toggleTag}
                        />
                    )
                })}
            </div>
        </aside>
    )

    return (
        <>
            {/* ── Page header ── */}
            <section className="bg-primary-50 border-b border-primary-200/60 py-14 md:py-20">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                    <Reveal>
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-sm font-display italic text-accent-500" style={{ fontWeight: 500 }}>
                                {String(collections.indexOf(activeCollection_obj!) + 2).padStart(2, '0') || '01'}
                            </span>
                            <span className="h-px w-10 bg-accent-600/40" />
                            <span className="text-[0.65rem] uppercase tracking-[0.35em] text-accent-600" style={{ fontWeight: 500 }}>
                                The Studio Archive
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-[3.25rem] font-display text-neutral-900 tracking-tight leading-[1.08]" style={{ fontWeight: 400 }}>
                            {activeCollection_obj ? activeCollection_obj.name : 'All Works'}
                        </h1>
                        {activeCollection_obj ? (
                            <p className="mt-4 text-lg font-serif italic text-neutral-500 max-w-xl leading-relaxed">
                                {activeCollection_obj.description}
                            </p>
                        ) : (
                            <p className="mt-4 text-lg font-serif italic text-neutral-500 max-w-xl leading-relaxed">
                                Paintings in oil, acrylic, watercolour, and traditional forms — spanning portraits,
                                landscapes, Madhubani, and devotional work.
                            </p>
                        )}
                    </Reveal>
                </div>
            </section>

            {/* ── Main layout: sidebar + grid ── */}
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
                <div className="flex gap-12 lg:gap-16 items-start">

                    {/* Sidebar — desktop only */}
                    <div className="hidden lg:block w-52 shrink-0 sticky top-28">
                        {sidebar}
                    </div>

                    {/* Main column */}
                    <div className="flex-1 min-w-0">

                        {/* Toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                            <div className="flex flex-wrap items-center gap-2">
                                {/* Mobile filter toggle */}
                                <button
                                    onClick={() => setMobileFiltersOpen(o => !o)}
                                    className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 border border-primary-200 text-sm text-neutral-600 font-light hover:border-accent-400 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25" />
                                    </svg>
                                    Filters {hasFilters && <span className="ml-1 w-1.5 h-1.5 rounded-full bg-accent-700 inline-block" />}
                                </button>

                                {/* Active chips */}
                                {activeCollection !== 'all' && (
                                    <FilterChip
                                        label={activeCollection_obj?.name ?? ''}
                                        onRemove={() => setActiveCollection('all')}
                                    />
                                )}
                                {[...activeTags].map(tag => (
                                    <FilterChip key={tag} label={tag} onRemove={() => toggleTag(tag)} />
                                ))}
                                {hasFilters && (
                                    <button
                                        onClick={clearAll}
                                        className="text-xs text-neutral-400 hover:text-neutral-700 font-light underline underline-offset-2 transition-colors"
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                <span className="text-xs text-neutral-400 font-light">
                                    {filtered.length} {filtered.length === 1 ? 'work' : 'works'}
                                </span>
                                <span className="h-4 w-px bg-primary-200" />
                                <select
                                    value={sort}
                                    onChange={e => setSort(e.target.value as SortKey)}
                                    className="text-xs text-neutral-600 font-light bg-transparent border-0 focus:ring-0 cursor-pointer pr-6 appearance-none"
                                    style={{ backgroundImage: 'none' }}
                                >
                                    <option value="newest">Newest first</option>
                                    <option value="oldest">Oldest first</option>
                                    <option value="title">A – Z</option>
                                </select>
                            </div>
                        </div>

                        {/* Mobile filters drawer */}
                        {mobileFiltersOpen && (
                            <div className="lg:hidden mb-8 p-6 bg-white border border-primary-200">
                                {sidebar}
                            </div>
                        )}

                        {/* Grid */}
                        {filtered.length > 0 ? (
                            <div className="columns-1 sm:columns-2 xl:columns-3 gap-6 space-y-6">
                                {filtered.map((artwork, i) => (
                                    <Reveal key={artwork.id} delay={Math.min(i % 3, 2) * 60} className="break-inside-avoid">
                                        <ArtworkCard
                                            artwork={artwork}
                                            aspect={
                                                artwork.collectionId === '3'
                                                    ? 'portrait'
                                                    : i % 5 === 0 ? 'landscape'
                                                    : i % 5 === 2 ? 'tall'
                                                    : i % 5 === 4 ? 'square'
                                                    : 'portrait'
                                            }
                                        />
                                    </Reveal>
                                ))}
                            </div>
                        ) : (
                            <Reveal>
                                <div className="py-24 text-center border border-primary-200/60">
                                    <p className="text-neutral-400 font-light text-base mb-4">No works match the current filters.</p>
                                    <button
                                        onClick={clearAll}
                                        className="text-sm text-accent-700 hover:text-accent-800 font-light underline underline-offset-2"
                                    >
                                        Clear all filters
                                    </button>
                                </div>
                            </Reveal>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import { adminArtworks, adminDashboardStats } from '@/lib/admin/mockAdminData'

const statusLabel: Record<string, string> = {
    AVAILABLE: 'Available', SOLD: 'Sold', ON_COMMISSION: 'On Commission', NOT_FOR_SALE: 'Not for Sale',
}
const statusColor: Record<string, string> = {
    AVAILABLE:     'bg-emerald-100 text-emerald-700',
    SOLD:          'bg-red-100 text-red-700',
    ON_COMMISSION: 'bg-amber-100 text-amber-700',
    NOT_FOR_SALE:  'bg-neutral-100 text-neutral-600',
}

export default function ArtworksPage() {
    const [search, setSearch] = useState('')
    const [collectionFilter, setCollectionFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')

    const collections = useMemo(() => {
        const seen = new Map<string, string>()
        adminArtworks.forEach(a => { if (a.collection) seen.set(a.collection.id, a.collection.name) })
        return [...seen.entries()]
    }, [])

    const filtered = useMemo(() => {
        return adminArtworks.filter(a => {
            const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.medium.toLowerCase().includes(search.toLowerCase())
            const matchCollection = collectionFilter === 'all' || a.collectionId === collectionFilter
            const matchStatus = statusFilter === 'all' || a.availabilityStatus === statusFilter
            return matchSearch && matchCollection && matchStatus
        })
    }, [search, collectionFilter, statusFilter])

    return (
        <AdminLayout breadcrumb={[{ label: 'Artworks' }]} unreadCount={adminDashboardStats.unreadInquiryCount}>
            <div className="max-w-6xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-display text-neutral-900 tracking-tight" style={{ fontWeight: 500 }}>Artworks</h1>
                        <p className="text-sm text-neutral-500 font-light mt-0.5">{adminArtworks.length} total paintings</p>
                    </div>
                    <Link href="/admin/artworks/new"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent-700 text-white text-sm font-light hover:bg-accent-800 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        Add Artwork
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 bg-white border border-neutral-200 p-4">
                    <input
                        type="text"
                        placeholder="Search by title or medium…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="flex-1 min-w-[200px] px-3 py-2 text-sm border border-neutral-200 focus:outline-none focus:border-accent-400 font-light placeholder-neutral-400"
                    />
                    <select value={collectionFilter} onChange={e => setCollectionFilter(e.target.value)}
                        className="px-3 py-2 text-sm border border-neutral-200 focus:outline-none focus:border-accent-400 font-light bg-white"
                    >
                        <option value="all">All Collections</option>
                        {collections.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                    </select>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        className="px-3 py-2 text-sm border border-neutral-200 focus:outline-none focus:border-accent-400 font-light bg-white"
                    >
                        <option value="all">All Statuses</option>
                        {Object.entries(statusLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                </div>

                {/* Count */}
                <p className="text-xs text-neutral-400 font-light">{filtered.length} work{filtered.length !== 1 ? 's' : ''}</p>

                {/* Table */}
                <div className="bg-white border border-neutral-200 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-100">
                                {['Artwork', 'Collection', 'Year', 'Medium', 'Status', 'Published', ''].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-[0.65rem] uppercase tracking-[0.2em] text-neutral-400 font-light whitespace-nowrap" style={{ fontWeight: 500 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {filtered.map(artwork => (
                                <tr key={artwork.id} className="hover:bg-neutral-50 transition-colors group">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 shrink-0 overflow-hidden" style={{ background: artwork.thumbnailUrl.startsWith('data:') ? undefined : '#f3f1ed' }}>
                                                <img src={artwork.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <span className="font-light text-neutral-800 group-hover:text-neutral-900 truncate max-w-[180px]">{artwork.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-neutral-500 font-light whitespace-nowrap">{artwork.collection?.name ?? '—'}</td>
                                    <td className="px-4 py-3 text-neutral-500 font-light tabular-nums">{artwork.year}</td>
                                    <td className="px-4 py-3 text-neutral-500 font-light max-w-[140px] truncate">{artwork.medium}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-[0.6rem] uppercase tracking-wide px-2 py-0.5 rounded-full whitespace-nowrap ${statusColor[artwork.availabilityStatus]}`} style={{ fontWeight: 500 }}>
                                            {statusLabel[artwork.availabilityStatus]}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-[0.6rem] uppercase tracking-wide px-2 py-0.5 rounded-full ${artwork.published ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`} style={{ fontWeight: 500 }}>
                                            {artwork.published ? 'Live' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right whitespace-nowrap">
                                        <Link href={`/admin/artworks/${artwork.id}`}
                                            className="text-xs text-accent-700 hover:text-accent-800 font-light transition-colors"
                                        >
                                            Edit
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <p className="text-center py-12 text-sm text-neutral-400 font-light">No artworks match these filters.</p>
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}

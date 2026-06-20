'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import { adminArtworks, adminCollections, adminDashboardStats, AdminArtwork } from '@/lib/admin/mockAdminData'

const TAG_OPTIONS = ['Oil', 'Acrylic', 'Watercolour', 'Ink', 'Gouache', 'Mixed Media', 'Portrait', 'Figure', 'Landscape', 'Devotional', 'Abstract', 'Flora', 'Architecture', 'Madhubani', 'Realist', 'Impressionist', 'Folk', 'Contemporary']

const statusLabel: Record<string, string> = {
    AVAILABLE: 'Available', SOLD: 'Sold', ON_COMMISSION: 'On Commission', NOT_FOR_SALE: 'Not for Sale',
}

export default function EditArtworkPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const artwork = adminArtworks.find(a => a.id === params.id)

    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [form, setForm] = useState({
        title: artwork?.title ?? '',
        slug: artwork?.slug ?? '',
        medium: artwork?.medium ?? '',
        dimensions: artwork?.dimensions ?? '',
        year: artwork?.year ?? new Date().getFullYear(),
        description: '',
        story: '',
        collectionId: artwork?.collectionId ?? '',
        availabilityStatus: artwork?.availabilityStatus ?? 'AVAILABLE',
        published: artwork?.published ?? false,
        tags: artwork?.tags ?? [],
    })

    if (!artwork) {
        return (
            <AdminLayout breadcrumb={[{ label: 'Artworks', href: '/admin/artworks' }, { label: 'Not Found' }]} unreadCount={0}>
                <p className="text-neutral-500 font-light">Artwork not found.</p>
            </AdminLayout>
        )
    }

    function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
        setForm(f => ({ ...f, [key]: value }))
    }

    function toggleTag(tag: string) {
        setForm(f => ({ ...f, tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag] }))
    }

    async function handleSave() {
        setSaving(true)
        await new Promise(r => setTimeout(r, 700))
        setSaving(false); setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    async function handleDelete() {
        setDeleting(true)
        await new Promise(r => setTimeout(r, 600))
        router.push('/admin/artworks')
    }

    return (
        <AdminLayout
            breadcrumb={[{ label: 'Artworks', href: '/admin/artworks' }, { label: artwork.title }]}
            unreadCount={adminDashboardStats.unreadInquiryCount}
        >
            <div className="max-w-4xl space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-display text-neutral-900 tracking-tight truncate max-w-lg" style={{ fontWeight: 500 }}>{artwork.title}</h1>
                    <div className="flex gap-3">
                        <button onClick={() => setConfirmDelete(true)}
                            className="px-4 py-2 text-sm border border-red-200 text-red-600 hover:bg-red-50 font-light transition-colors">
                            Delete
                        </button>
                        <button onClick={handleSave} disabled={saving}
                            className="px-4 py-2 text-sm bg-accent-700 text-white hover:bg-accent-800 font-light transition-colors disabled:opacity-50 flex items-center gap-2">
                            {saving && <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                            {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-5">
                        <div className="bg-white border border-neutral-200 p-6 space-y-5">
                            <Field label="Title"><input value={form.title} onChange={e => set('title', e.target.value)} className="admin-input" /></Field>
                            <Field label="Slug"><input value={form.slug} onChange={e => set('slug', e.target.value)} className="admin-input font-mono text-xs" /></Field>
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Medium"><input value={form.medium} onChange={e => set('medium', e.target.value)} className="admin-input" /></Field>
                                <Field label="Dimensions"><input value={form.dimensions} onChange={e => set('dimensions', e.target.value)} className="admin-input" /></Field>
                            </div>
                            <Field label="Year"><input type="number" value={form.year} onChange={e => set('year', parseInt(e.target.value))} className="admin-input w-32" /></Field>
                        </div>
                        <div className="bg-white border border-neutral-200 p-6 space-y-5">
                            <Field label="Description">
                                <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} placeholder="Add description…" className="admin-input resize-none" />
                            </Field>
                            <Field label="Story">
                                <textarea value={form.story} onChange={e => set('story', e.target.value)} rows={4} placeholder="Add story…" className="admin-input resize-none" />
                            </Field>
                        </div>
                        <div className="bg-white border border-neutral-200 p-6">
                            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 mb-4 font-light" style={{ fontWeight: 500 }}>Images</p>
                            <div className="flex gap-3 mb-4">
                                <img src={artwork.thumbnailUrl} alt="" className="w-24 h-24 object-cover border border-neutral-200" />
                            </div>
                            <div className="border-2 border-dashed border-neutral-200 p-8 text-center hover:border-accent-300 transition-colors cursor-pointer">
                                <p className="text-sm text-neutral-400 font-light">Add more images</p>
                                <p className="text-xs text-accent-600 font-light mt-2">→ Go to <a href="/admin/media" className="underline">Media Library</a></p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="bg-white border border-neutral-200 p-5 space-y-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-light" style={{ fontWeight: 500 }}>Status</p>
                            <select value={form.availabilityStatus} onChange={e => set('availabilityStatus', e.target.value as AdminArtwork['availabilityStatus'])} className="admin-input">
                                {Object.entries(statusLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={form.published} onChange={e => set('published', e.target.checked)}
                                    className="rounded border-neutral-300 text-accent-700 focus:ring-accent-500" />
                                <span className="text-sm text-neutral-700 font-light">Published</span>
                            </label>
                        </div>
                        <div className="bg-white border border-neutral-200 p-5">
                            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 mb-3 font-light" style={{ fontWeight: 500 }}>Collection</p>
                            <select value={form.collectionId} onChange={e => set('collectionId', e.target.value)} className="admin-input">
                                <option value="">No collection</option>
                                {adminCollections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="bg-white border border-neutral-200 p-5">
                            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 mb-3 font-light" style={{ fontWeight: 500 }}>Tags</p>
                            <div className="flex flex-wrap gap-1.5">
                                {TAG_OPTIONS.map(tag => (
                                    <button key={tag} onClick={() => toggleTag(tag)}
                                        className={`px-2.5 py-1 text-xs font-light border transition-colors ${form.tags.includes(tag) ? 'bg-accent-700 text-white border-accent-700' : 'border-neutral-200 text-neutral-600 hover:border-accent-300'}`}>
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white border border-neutral-200 p-5">
                            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 mb-3 font-light" style={{ fontWeight: 500 }}>View on Site</p>
                            <a href={`/work/${artwork.slug}`} target="_blank" rel="noopener noreferrer"
                                className="text-sm text-accent-700 hover:text-accent-800 font-light underline underline-offset-2">
                                /work/{artwork.slug} ↗
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete confirm */}
            {confirmDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 max-w-sm w-full shadow-xl">
                        <h3 className="font-display text-lg text-neutral-900 mb-2" style={{ fontWeight: 500 }}>Delete this artwork?</h3>
                        <p className="text-sm text-neutral-500 font-light mb-6">This will permanently remove "{artwork.title}" from the gallery. This cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmDelete(false)} className="flex-1 px-4 py-2 border border-neutral-200 text-sm text-neutral-700 font-light hover:bg-neutral-50 transition-colors">Cancel</button>
                            <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-light hover:bg-red-700 transition-colors disabled:opacity-50">
                                {deleting ? 'Deleting…' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`.admin-input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #e5e5e5; font-size: 0.875rem; font-weight: 300; color: #1a1a1a; background: white; outline: none; } .admin-input:focus { border-color: #9a7865; }`}</style>
        </AdminLayout>
    )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-neutral-400 mb-1.5 font-light" style={{ fontWeight: 500 }}>{label}</label>
            {children}
        </div>
    )
}

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import { adminCollections, adminDashboardStats } from '@/lib/admin/mockAdminData'

const TAG_OPTIONS = ['Oil', 'Acrylic', 'Watercolour', 'Mixed Media', 'Ink', 'Gouache', 'Portrait', 'Figure', 'Landscape', 'Devotional', 'Abstract', 'Flora', 'Architecture', 'Madhubani', 'Realist', 'Impressionist', 'Folk', 'Contemporary']

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-neutral-400 mb-1.5 font-light" style={{ fontWeight: 500 }}>{label}</label>
            {children}
        </div>
    )
}

export default function NewArtworkPage() {
    const router = useRouter()
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [form, setForm] = useState({
        title: '', slug: '', medium: '', dimensions: '', year: new Date().getFullYear(),
        description: '', story: '', collectionId: '', availabilityStatus: 'AVAILABLE',
        published: false, tags: [] as string[],
    })

    function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
        setForm(f => {
            const next = { ...f, [key]: value }
            if (key === 'title' && typeof value === 'string') {
                next.slug = value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            }
            return next
        })
    }

    function toggleTag(tag: string) {
        setForm(f => ({ ...f, tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag] }))
    }

    async function handleSave(publish: boolean) {
        setError(null)
        setSaving(true)
        try {
            const res = await fetch('/api/admin/artwork', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: form.title,
                    slug: form.slug,
                    description: form.description || 'To be added.',
                    story: form.story || '',
                    medium: form.medium,
                    dimensions: form.dimensions,
                    year: form.year,
                    availabilityStatus: form.availabilityStatus,
                    published: publish,
                    collectionId: form.collectionId || null,
                    imageIds: [], // added via media library after creation
                }),
            })
            const data = await res.json()
            if (data.success) {
                router.push('/admin/artworks')
            } else {
                setError(data.error || 'Failed to save artwork.')
            }
        } catch {
            setError('Network error. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <AdminLayout breadcrumb={[{ label: 'Artworks', href: '/admin/artworks' }, { label: 'New Artwork' }]} unreadCount={adminDashboardStats.unreadInquiryCount}>
            <div className="max-w-4xl space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-display text-neutral-900 tracking-tight" style={{ fontWeight: 500 }}>New Artwork</h1>
                    <div className="flex gap-3">
                        <button onClick={() => handleSave(false)} disabled={saving} className="px-4 py-2 text-sm border border-neutral-300 text-neutral-700 hover:border-neutral-400 font-light transition-colors disabled:opacity-50">Save as Draft</button>
                        <button onClick={() => handleSave(true)} disabled={saving} className="px-4 py-2 text-sm bg-accent-700 text-white hover:bg-accent-800 font-light transition-colors disabled:opacity-50 flex items-center gap-2">
                            {saving && <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                            {saving ? 'Saving…' : 'Publish'}
                        </button>
                    </div>
                </div>

                {error && <div className="bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-light">{error}</div>}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-5">
                        <div className="bg-white border border-neutral-200 p-6 space-y-5">
                            <Field label="Title *"><input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Artwork title" className="admin-input" /></Field>
                            <Field label="Slug"><input value={form.slug} onChange={e => set('slug', e.target.value)} className="admin-input font-mono text-xs" /></Field>
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Medium *"><input value={form.medium} onChange={e => set('medium', e.target.value)} placeholder="e.g. Oil on canvas" className="admin-input" /></Field>
                                <Field label="Dimensions"><input value={form.dimensions} onChange={e => set('dimensions', e.target.value)} placeholder="e.g. 24 × 36 in" className="admin-input" /></Field>
                            </div>
                            <Field label="Year *"><input type="number" value={form.year} onChange={e => set('year', parseInt(e.target.value))} className="admin-input w-32" min={1900} max={2099} /></Field>
                        </div>
                        <div className="bg-white border border-neutral-200 p-6 space-y-5">
                            <Field label="Description"><textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} placeholder="Describe this artwork…" className="admin-input resize-none" /></Field>
                            <Field label="Story"><textarea value={form.story} onChange={e => set('story', e.target.value)} rows={4} placeholder="The story behind this painting…" className="admin-input resize-none" /></Field>
                        </div>
                        <div className="bg-white border border-neutral-200 p-6">
                            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 mb-4 font-light" style={{ fontWeight: 500 }}>Images</p>
                            <div className="border-2 border-dashed border-neutral-200 p-12 text-center hover:border-accent-300 transition-colors">
                                <p className="text-sm text-neutral-400 font-light">Upload images via <a href="/admin/media" className="text-accent-700 underline">Media Library</a>, then attach them here after saving.</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-5">
                        <div className="bg-white border border-neutral-200 p-5 space-y-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-light" style={{ fontWeight: 500 }}>Status</p>
                            <select value={form.availabilityStatus} onChange={e => set('availabilityStatus', e.target.value)} className="admin-input">
                                <option value="AVAILABLE">Available</option>
                                <option value="SOLD">Sold</option>
                                <option value="ON_COMMISSION">On Commission</option>
                                <option value="NOT_FOR_SALE">Not for Sale</option>
                            </select>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={form.published} onChange={e => set('published', e.target.checked)} className="rounded border-neutral-300 text-accent-700" />
                                <span className="text-sm text-neutral-700 font-light">Published (visible on site)</span>
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
                                    <button key={tag} onClick={() => toggleTag(tag)} className={`px-2.5 py-1 text-xs font-light border transition-colors ${form.tags.includes(tag) ? 'bg-accent-700 text-white border-accent-700' : 'border-neutral-200 text-neutral-600 hover:border-accent-300'}`}>{tag}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`.admin-input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #e5e5e5; font-size: 0.875rem; font-weight: 300; color: #1a1a1a; background: white; outline: none; } .admin-input:focus { border-color: #9a7865; }`}</style>
        </AdminLayout>
    )
}

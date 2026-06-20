'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import { adminCollections, adminDashboardStats } from '@/lib/admin/mockAdminData'

const TAG_OPTIONS = ['Oil', 'Acrylic', 'Watercolour', 'Ink', 'Gouache', 'Mixed Media', 'Portrait', 'Figure', 'Landscape', 'Devotional', 'Abstract', 'Flora', 'Architecture', 'Madhubani', 'Realist', 'Impressionist', 'Folk', 'Contemporary']

export default function NewArtworkPage() {
    const router = useRouter()
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [form, setForm] = useState({
        title: '', slug: '', medium: '', dimensions: '', year: new Date().getFullYear(),
        description: '', story: '', collectionId: '', availabilityStatus: 'AVAILABLE',
        published: false, tags: [] as string[],
    })

    function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
        setForm(f => ({ ...f, [key]: value }))
        if (key === 'title' && typeof value === 'string') {
            setForm(f => ({
                ...f,
                title: value,
                slug: value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            }))
        }
    }

    function toggleTag(tag: string) {
        setForm(f => ({
            ...f,
            tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
        }))
    }

    async function handleSave(publish: boolean) {
        setSaving(true)
        // TODO: POST /api/admin/artwork with form data
        await new Promise(r => setTimeout(r, 800))
        setSaving(false)
        setSaved(true)
        setTimeout(() => { router.push('/admin/artworks') }, 1000)
    }

    return (
        <AdminLayout
            breadcrumb={[{ label: 'Artworks', href: '/admin/artworks' }, { label: 'New Artwork' }]}
            unreadCount={adminDashboardStats.unreadInquiryCount}
        >
            <div className="max-w-4xl space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-display text-neutral-900 tracking-tight" style={{ fontWeight: 500 }}>New Artwork</h1>
                    <div className="flex gap-3">
                        <button onClick={() => handleSave(false)} disabled={saving}
                            className="px-4 py-2 text-sm border border-neutral-300 text-neutral-700 hover:border-neutral-400 font-light transition-colors disabled:opacity-50"
                        >
                            Save as Draft
                        </button>
                        <button onClick={() => handleSave(true)} disabled={saving}
                            className="px-4 py-2 text-sm bg-accent-700 text-white hover:bg-accent-800 font-light transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving && <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                            {saved ? '✓ Saved' : saving ? 'Saving…' : 'Publish'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main fields */}
                    <div className="lg:col-span-2 space-y-5">
                        <div className="bg-white border border-neutral-200 p-6 space-y-5">
                            <Field label="Title *">
                                <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Artwork title"
                                    className="admin-input" />
                            </Field>
                            <Field label="Slug">
                                <input value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="auto-generated-from-title"
                                    className="admin-input font-mono text-xs" />
                            </Field>
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Medium *">
                                    <input value={form.medium} onChange={e => set('medium', e.target.value)} placeholder="e.g. Oil on canvas"
                                        className="admin-input" />
                                </Field>
                                <Field label="Dimensions">
                                    <input value={form.dimensions} onChange={e => set('dimensions', e.target.value)} placeholder="e.g. 24 × 36 in"
                                        className="admin-input" />
                                </Field>
                            </div>
                            <Field label="Year *">
                                <input type="number" value={form.year} onChange={e => set('year', parseInt(e.target.value))}
                                    className="admin-input w-32" min={1900} max={2099} />
                            </Field>
                        </div>

                        <div className="bg-white border border-neutral-200 p-6 space-y-5">
                            <Field label="Description">
                                <textarea value={form.description} onChange={e => set('description', e.target.value)}
                                    rows={4} placeholder="Describe this artwork…" className="admin-input resize-none" />
                            </Field>
                            <Field label="Story">
                                <textarea value={form.story} onChange={e => set('story', e.target.value)}
                                    rows={4} placeholder="The story behind this painting…" className="admin-input resize-none" />
                            </Field>
                        </div>

                        {/* Image upload placeholder */}
                        <div className="bg-white border border-neutral-200 p-6">
                            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 mb-4 font-light" style={{ fontWeight: 500 }}>Images</p>
                            <div className="border-2 border-dashed border-neutral-200 p-12 text-center hover:border-accent-300 transition-colors cursor-pointer">
                                <svg className="w-8 h-8 text-neutral-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-sm text-neutral-400 font-light">Click to upload or drag images here</p>
                                <p className="text-xs text-neutral-300 font-light mt-1">JPEG, PNG, WebP up to 10MB</p>
                                <p className="text-xs text-accent-600 font-light mt-3">→ Go to <a href="/admin/media" className="underline">Media Library</a> to manage uploads</p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-5">
                        <div className="bg-white border border-neutral-200 p-5 space-y-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-light" style={{ fontWeight: 500 }}>Status</p>
                            <select value={form.availabilityStatus} onChange={e => set('availabilityStatus', e.target.value)}
                                className="admin-input">
                                <option value="AVAILABLE">Available</option>
                                <option value="SOLD">Sold</option>
                                <option value="ON_COMMISSION">On Commission</option>
                                <option value="NOT_FOR_SALE">Not for Sale</option>
                            </select>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={form.published} onChange={e => set('published', e.target.checked)}
                                    className="rounded border-neutral-300 text-accent-700 focus:ring-accent-500" />
                                <span className="text-sm text-neutral-700 font-light">Published (visible on site)</span>
                            </label>
                        </div>

                        <div className="bg-white border border-neutral-200 p-5 space-y-3">
                            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-light" style={{ fontWeight: 500 }}>Collection</p>
                            <select value={form.collectionId} onChange={e => set('collectionId', e.target.value)}
                                className="admin-input">
                                <option value="">No collection</option>
                                {adminCollections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div className="bg-white border border-neutral-200 p-5">
                            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 mb-3 font-light" style={{ fontWeight: 500 }}>Tags</p>
                            <div className="flex flex-wrap gap-1.5">
                                {TAG_OPTIONS.map(tag => (
                                    <button key={tag} onClick={() => toggleTag(tag)}
                                        className={`px-2.5 py-1 text-xs font-light border transition-colors ${
                                            form.tags.includes(tag)
                                                ? 'bg-accent-700 text-white border-accent-700'
                                                : 'border-neutral-200 text-neutral-600 hover:border-accent-300'
                                        }`}
                                    >
                                        {tag}
                                    </button>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-neutral-400 mb-1.5 font-light" style={{ fontWeight: 500 }}>{label}</label>
            {children}
        </div>
    )
}

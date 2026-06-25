'use client'

import React, { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { adminTestimonials, adminDashboardStats, AdminTestimonial } from '@/lib/admin/mockAdminData'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-neutral-400 mb-1.5 font-light" style={{ fontWeight: 500 }}>{label}</label>
            {children}
        </div>
    )
}

const emptyForm = { clientName: '', clientTitle: '', text: '' }

export default function TestimonialsPage() {
    const [testimonials, setTestimonials] = useState<AdminTestimonial[]>(adminTestimonials)
    const [showNewForm, setShowNewForm] = useState(false)
    const [newForm, setNewForm] = useState({ ...emptyForm })
    const [saving, setSaving] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editForm, setEditForm] = useState({ ...emptyForm })
    const [editSaving, setEditSaving] = useState(false)
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleCreate() {
        if (!newForm.clientName.trim() || !newForm.text.trim()) return
        setSaving(true)
        setError(null)
        try {
            const res = await fetch('/api/admin/testimonial', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientName: newForm.clientName, clientTitle: newForm.clientTitle, text: newForm.text, published: false }),
            })
            const data = await res.json()
            if (!data.success) { setError(data.error ?? 'An error occurred.'); setSaving(false); return }
            setTestimonials(prev => [...prev, data.testimonial])
            setNewForm({ ...emptyForm })
            setShowNewForm(false)
        } catch {
            setError('Network error. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    function startEdit(t: AdminTestimonial) {
        setEditingId(t.id)
        setEditForm({ clientName: t.clientName, clientTitle: t.clientTitle ?? '', text: t.text })
    }

    async function handleEditSave(id: string) {
        setEditSaving(true)
        setError(null)
        try {
            const res = await fetch(`/api/admin/testimonial/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientName: editForm.clientName, clientTitle: editForm.clientTitle, text: editForm.text }),
            })
            const data = await res.json()
            if (!data.success) { setError(data.error ?? 'An error occurred.'); setEditSaving(false); return }
            setTestimonials(prev => prev.map(t => t.id === id ? {
                ...t,
                clientName: editForm.clientName,
                clientTitle: editForm.clientTitle || null,
                text: editForm.text,
            } : t))
            setEditingId(null)
        } catch {
            setError('Network error. Please try again.')
        } finally {
            setEditSaving(false)
        }
    }

    async function togglePublished(id: string) {
        setError(null)
        const current = testimonials.find(t => t.id === id)
        if (!current) return
        try {
            const res = await fetch(`/api/admin/testimonial/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ published: !current.published }),
            })
            const data = await res.json()
            if (!data.success) { setError(data.error ?? 'An error occurred.'); return }
            setTestimonials(prev => prev.map(t => t.id === id ? { ...t, published: !t.published } : t))
        } catch {
            setError('Network error. Please try again.')
        }
    }

    async function handleDelete(id: string) {
        setDeleting(true)
        setError(null)
        try {
            const res = await fetch(`/api/admin/testimonial/${id}`, { method: 'DELETE' })
            const data = await res.json()
            if (!data.success) { setError(data.error ?? 'An error occurred.'); setDeleting(false); return }
            setTestimonials(prev => prev.filter(t => t.id !== id))
            setConfirmDeleteId(null)
        } catch {
            setError('Network error. Please try again.')
        } finally {
            setDeleting(false)
        }
    }

    const toDelete = testimonials.find(t => t.id === confirmDeleteId)

    return (
        <AdminLayout breadcrumb={[{ label: 'Testimonials' }]} unreadCount={adminDashboardStats.unreadInquiryCount}>
            <div className="max-w-3xl space-y-6">
                {error && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200">
                        <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
                        <p className="text-xs text-red-700 font-light">{error}</p>
                    </div>
                )}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-display text-neutral-900 tracking-tight" style={{ fontWeight: 500 }}>Testimonials</h1>
                        <p className="text-sm text-neutral-500 font-light mt-0.5">{testimonials.length} testimonial{testimonials.length !== 1 ? 's' : ''}</p>
                    </div>
                    {!showNewForm && (
                        <button onClick={() => setShowNewForm(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent-700 text-white text-sm font-light hover:bg-accent-800 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                            New Testimonial
                        </button>
                    )}
                </div>

                {showNewForm && (
                    <div className="bg-white border border-accent-300 p-6 space-y-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-light" style={{ fontWeight: 500 }}>New Testimonial</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Client Name *">
                                <input value={newForm.clientName} onChange={e => setNewForm(f => ({ ...f, clientName: e.target.value }))} placeholder="e.g. Priya Sharma" className="admin-input" autoFocus />
                            </Field>
                            <Field label="Client Title">
                                <input value={newForm.clientTitle} onChange={e => setNewForm(f => ({ ...f, clientTitle: e.target.value }))} placeholder="e.g. Collector, Delhi" className="admin-input" />
                            </Field>
                        </div>
                        <Field label="Testimonial Text *">
                            <textarea
                                value={newForm.text}
                                onChange={e => setNewForm(f => ({ ...f, text: e.target.value }))}
                                placeholder="What they said…"
                                rows={4}
                                className="admin-input resize-none"
                            />
                        </Field>
                        <div className="flex gap-3">
                            <button onClick={handleCreate} disabled={saving || !newForm.clientName.trim() || !newForm.text.trim()} className="px-4 py-2 text-sm bg-accent-700 text-white hover:bg-accent-800 font-light transition-colors disabled:opacity-50 flex items-center gap-2">
                                {saving && <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                                {saving ? 'Saving…' : 'Save'}
                            </button>
                            <button onClick={() => { setShowNewForm(false); setNewForm({ ...emptyForm }) }} className="px-4 py-2 text-sm border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-light transition-colors">Cancel</button>
                        </div>
                    </div>
                )}

                {/* Card list */}
                <div className="space-y-4">
                    {testimonials.length === 0 && (
                        <p className="text-center py-12 text-sm text-neutral-400 font-light bg-white border border-neutral-200">No testimonials yet.</p>
                    )}
                    {testimonials.map(t => (
                        <div key={t.id} className="bg-white border border-neutral-200">
                            {editingId === t.id ? (
                                <div className="p-6 space-y-4 bg-neutral-50">
                                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-light" style={{ fontWeight: 500 }}>Editing</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Field label="Client Name">
                                            <input value={editForm.clientName} onChange={e => setEditForm(f => ({ ...f, clientName: e.target.value }))} className="admin-input" />
                                        </Field>
                                        <Field label="Client Title">
                                            <input value={editForm.clientTitle} onChange={e => setEditForm(f => ({ ...f, clientTitle: e.target.value }))} className="admin-input" />
                                        </Field>
                                    </div>
                                    <Field label="Text">
                                        <textarea value={editForm.text} onChange={e => setEditForm(f => ({ ...f, text: e.target.value }))} rows={4} className="admin-input resize-none" />
                                    </Field>
                                    <div className="flex gap-3">
                                        <button onClick={() => handleEditSave(t.id)} disabled={editSaving} className="px-4 py-2 text-sm bg-accent-700 text-white hover:bg-accent-800 font-light transition-colors disabled:opacity-50 flex items-center gap-2">
                                            {editSaving && <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                                            {editSaving ? 'Saving…' : 'Save'}
                                        </button>
                                        <button onClick={() => setEditingId(null)} className="px-4 py-2 text-sm border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-light transition-colors">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            {/* Quote */}
                                            <p className="text-sm text-neutral-700 font-light leading-relaxed italic mb-4">
                                                &ldquo;{t.text}&rdquo;
                                            </p>
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <p className="text-sm text-neutral-800 font-light" style={{ fontWeight: 500 }}>{t.clientName}</p>
                                                    {t.clientTitle && <p className="text-xs text-neutral-500 font-light">{t.clientTitle}</p>}
                                                </div>
                                                <span className={`text-[0.65rem] uppercase tracking-wider px-2 py-0.5 border font-light ${t.published ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-neutral-200 text-neutral-400'}`} style={{ fontWeight: 500 }}>
                                                    {t.published ? 'Published' : 'Draft'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button onClick={() => togglePublished(t.id)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${t.published ? 'bg-accent-600' : 'bg-neutral-200'}`}>
                                                <span className="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform" style={{ transform: t.published ? 'translateX(18px)' : 'translateX(2px)' }} />
                                            </button>
                                            <button onClick={() => startEdit(t)} className="text-xs text-accent-700 hover:text-accent-800 font-light transition-colors px-2">Edit</button>
                                            <button onClick={() => setConfirmDeleteId(t.id)} className="text-xs text-red-400 hover:text-red-600 font-light transition-colors px-2">Delete</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {confirmDeleteId && toDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 max-w-sm w-full shadow-xl">
                        <h3 className="font-display text-lg text-neutral-900 mb-2" style={{ fontWeight: 500 }}>Delete this testimonial?</h3>
                        <p className="text-sm text-neutral-500 font-light mb-6">This will permanently remove the testimonial from {toDelete.clientName}. This cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmDeleteId(null)} className="flex-1 px-4 py-2 border border-neutral-200 text-sm text-neutral-700 font-light hover:bg-neutral-50 transition-colors">Cancel</button>
                            <button onClick={() => handleDelete(confirmDeleteId)} disabled={deleting} className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-light hover:bg-red-700 transition-colors disabled:opacity-50">{deleting ? 'Deleting…' : 'Delete'}</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`.admin-input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #e5e5e5; font-size: 0.875rem; font-weight: 300; color: #1a1a1a; background: white; outline: none; } .admin-input:focus { border-color: #9a7865; }`}</style>
        </AdminLayout>
    )
}

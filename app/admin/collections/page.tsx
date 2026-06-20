'use client'

import React, { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { adminCollections, adminDashboardStats, AdminCollection } from '@/lib/admin/mockAdminData'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-neutral-400 mb-1.5 font-light" style={{ fontWeight: 500 }}>{label}</label>
            {children}
        </div>
    )
}

export default function CollectionsPage() {
    const [collections, setCollections] = useState<AdminCollection[]>(adminCollections)
    const [showNewForm, setShowNewForm] = useState(false)
    const [newForm, setNewForm] = useState({ name: '', description: '' })
    const [saving, setSaving] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editForm, setEditForm] = useState({ name: '', description: '' })
    const [editSaving, setEditSaving] = useState(false)
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)

    async function handleCreate() {
        if (!newForm.name.trim()) return
        setSaving(true)
        await new Promise(r => setTimeout(r, 700))
        const slug = newForm.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        const newCol: AdminCollection = {
            id: String(Date.now()), name: newForm.name, slug, description: newForm.description,
            artworkCount: 0, createdAt: new Date().toISOString().split('T')[0], updatedAt: new Date().toISOString().split('T')[0],
        }
        setCollections(prev => [...prev, newCol])
        setNewForm({ name: '', description: '' })
        setShowNewForm(false)
        setSaving(false)
    }

    function startEdit(col: AdminCollection) {
        setEditingId(col.id)
        setEditForm({ name: col.name, description: col.description })
    }

    async function handleEditSave(id: string) {
        setEditSaving(true)
        await new Promise(r => setTimeout(r, 700))
        setCollections(prev => prev.map(c => c.id === id ? { ...c, name: editForm.name, description: editForm.description } : c))
        setEditingId(null)
        setEditSaving(false)
    }

    async function handleDelete(id: string) {
        setDeleting(true)
        await new Promise(r => setTimeout(r, 600))
        setCollections(prev => prev.filter(c => c.id !== id))
        setConfirmDeleteId(null)
        setDeleting(false)
    }

    const toDelete = collections.find(c => c.id === confirmDeleteId)

    return (
        <AdminLayout breadcrumb={[{ label: 'Collections' }]} unreadCount={adminDashboardStats.unreadInquiryCount}>
            <div className="max-w-5xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-display text-neutral-900 tracking-tight" style={{ fontWeight: 500 }}>Collections</h1>
                        <p className="text-sm text-neutral-500 font-light mt-0.5">{collections.length} collection{collections.length !== 1 ? 's' : ''}</p>
                    </div>
                    {!showNewForm && (
                        <button onClick={() => setShowNewForm(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent-700 text-white text-sm font-light hover:bg-accent-800 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                            New Collection
                        </button>
                    )}
                </div>

                {showNewForm && (
                    <div className="bg-white border border-accent-300 p-6 space-y-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-light" style={{ fontWeight: 500 }}>New Collection</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Name *"><input value={newForm.name} onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))} placeholder="Collection name" className="admin-input" autoFocus /></Field>
                            <Field label="Description"><input value={newForm.description} onChange={e => setNewForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description" className="admin-input" /></Field>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleCreate} disabled={saving || !newForm.name.trim()} className="px-4 py-2 text-sm bg-accent-700 text-white hover:bg-accent-800 font-light transition-colors disabled:opacity-50 flex items-center gap-2">
                                {saving && <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                                {saving ? 'Saving…' : 'Save'}
                            </button>
                            <button onClick={() => { setShowNewForm(false); setNewForm({ name: '', description: '' }) }} className="px-4 py-2 text-sm border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-light transition-colors">Cancel</button>
                        </div>
                    </div>
                )}

                <div className="bg-white border border-neutral-200 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-100">
                                {['Name', 'Slug', 'Artworks', 'Description', '', ''].map((h, i) => (
                                    <th key={i} className="text-left px-4 py-3 text-[0.65rem] uppercase tracking-[0.2em] text-neutral-400 font-light whitespace-nowrap" style={{ fontWeight: 500 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {collections.map(col => (
                                <React.Fragment key={col.id}>
                                    <tr className="hover:bg-neutral-50 transition-colors">
                                        <td className="px-4 py-3 text-neutral-800 font-light">{col.name}</td>
                                        <td className="px-4 py-3 text-neutral-400 font-mono text-xs">{col.slug}</td>
                                        <td className="px-4 py-3 text-neutral-500 font-light tabular-nums text-center">{col.artworkCount}</td>
                                        <td className="px-4 py-3 text-neutral-500 font-light max-w-xs truncate">{col.description ? col.description.substring(0, 60) + (col.description.length > 60 ? '…' : '') : <span className="text-neutral-300">—</span>}</td>
                                        <td className="px-4 py-3 text-right"><button onClick={() => editingId === col.id ? setEditingId(null) : startEdit(col)} className="text-xs text-accent-700 hover:text-accent-800 font-light transition-colors">{editingId === col.id ? 'Close' : 'Edit'}</button></td>
                                        <td className="px-4 py-3 text-right"><button onClick={() => setConfirmDeleteId(col.id)} className="text-xs text-red-400 hover:text-red-600 font-light transition-colors">Delete</button></td>
                                    </tr>
                                    {editingId === col.id && (
                                        <tr><td colSpan={6} className="px-4 py-4 bg-neutral-50 border-b border-neutral-100">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                                <Field label="Name"><input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="admin-input" /></Field>
                                                <Field label="Description"><input value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} className="admin-input" /></Field>
                                            </div>
                                            <div className="flex gap-3">
                                                <button onClick={() => handleEditSave(col.id)} disabled={editSaving} className="px-4 py-2 text-sm bg-accent-700 text-white hover:bg-accent-800 font-light transition-colors disabled:opacity-50 flex items-center gap-2">
                                                    {editSaving && <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                                                    {editSaving ? 'Saving…' : 'Save'}
                                                </button>
                                                <button onClick={() => setEditingId(null)} className="px-4 py-2 text-sm border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-light transition-colors">Cancel</button>
                                            </div>
                                        </td></tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                    {collections.length === 0 && <p className="text-center py-12 text-sm text-neutral-400 font-light">No collections yet.</p>}
                </div>
            </div>

            {confirmDeleteId && toDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 max-w-sm w-full shadow-xl">
                        <h3 className="font-display text-lg text-neutral-900 mb-2" style={{ fontWeight: 500 }}>Delete this collection?</h3>
                        <p className="text-sm text-neutral-500 font-light mb-6">This will permanently remove &ldquo;{toDelete.name}&rdquo;. This cannot be undone.</p>
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

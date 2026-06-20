'use client'

import React, { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { adminRecognition, adminDashboardStats, AdminRecognition } from '@/lib/admin/mockAdminData'

type RecognitionType = AdminRecognition['type']

const TYPE_LABELS: Record<RecognitionType, string> = {
    AWARD: 'Award',
    EXHIBITION: 'Exhibition',
    INSTITUTIONAL_COLLABORATION: 'Collaboration',
    PRESS: 'Press',
}

const TYPE_COLORS: Record<RecognitionType, string> = {
    AWARD: 'bg-amber-100 text-amber-700 border-amber-200',
    EXHIBITION: 'bg-violet-100 text-violet-700 border-violet-200',
    INSTITUTIONAL_COLLABORATION: 'bg-blue-100 text-blue-700 border-blue-200',
    PRESS: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}

const TYPES: RecognitionType[] = ['AWARD', 'EXHIBITION', 'INSTITUTIONAL_COLLABORATION', 'PRESS']

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-neutral-400 mb-1.5 font-light" style={{ fontWeight: 500 }}>{label}</label>
            {children}
        </div>
    )
}

const emptyForm = { title: '', type: 'EXHIBITION' as RecognitionType, date: '', description: '' }

export default function RecognitionPage() {
    const [items, setItems] = useState<AdminRecognition[]>(adminRecognition)
    const [showNewForm, setShowNewForm] = useState(false)
    const [newForm, setNewForm] = useState({ ...emptyForm })
    const [saving, setSaving] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editForm, setEditForm] = useState({ ...emptyForm })
    const [editSaving, setEditSaving] = useState(false)
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)

    async function handleCreate() {
        if (!newForm.title.trim() || !newForm.date) return
        setSaving(true)
        await new Promise(r => setTimeout(r, 700))
        const entry: AdminRecognition = {
            id: String(Date.now()),
            title: newForm.title,
            type: newForm.type,
            date: newForm.date,
            description: newForm.description,
            published: false,
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
        }
        setItems(prev => [entry, ...prev])
        setNewForm({ ...emptyForm })
        setShowNewForm(false)
        setSaving(false)
    }

    function startEdit(item: AdminRecognition) {
        setEditingId(item.id)
        setEditForm({ title: item.title, type: item.type, date: item.date, description: item.description })
    }

    async function handleEditSave(id: string) {
        setEditSaving(true)
        await new Promise(r => setTimeout(r, 700))
        setItems(prev => prev.map(i => i.id === id ? { ...i, ...editForm } : i))
        setEditingId(null)
        setEditSaving(false)
    }

    async function togglePublished(id: string) {
        setItems(prev => prev.map(i => i.id === id ? { ...i, published: !i.published } : i))
    }

    async function handleDelete(id: string) {
        setDeleting(true)
        await new Promise(r => setTimeout(r, 600))
        setItems(prev => prev.filter(i => i.id !== id))
        setConfirmDeleteId(null)
        setDeleting(false)
    }

    const toDelete = items.find(i => i.id === confirmDeleteId)

    return (
        <AdminLayout breadcrumb={[{ label: 'Recognition' }]} unreadCount={adminDashboardStats.unreadInquiryCount}>
            <div className="max-w-5xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-display text-neutral-900 tracking-tight" style={{ fontWeight: 500 }}>Recognition</h1>
                        <p className="text-sm text-neutral-500 font-light mt-0.5">{items.length} entr{items.length !== 1 ? 'ies' : 'y'}</p>
                    </div>
                    {!showNewForm && (
                        <button onClick={() => setShowNewForm(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent-700 text-white text-sm font-light hover:bg-accent-800 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                            New Entry
                        </button>
                    )}
                </div>

                {showNewForm && (
                    <div className="bg-white border border-accent-300 p-6 space-y-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-light" style={{ fontWeight: 500 }}>New Recognition Entry</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Title *">
                                <input value={newForm.title} onChange={e => setNewForm(f => ({ ...f, title: e.target.value }))} placeholder="Entry title" className="admin-input" autoFocus />
                            </Field>
                            <Field label="Type">
                                <select value={newForm.type} onChange={e => setNewForm(f => ({ ...f, type: e.target.value as RecognitionType }))} className="admin-input">
                                    {TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                                </select>
                            </Field>
                            <Field label="Date *">
                                <input type="date" value={newForm.date} onChange={e => setNewForm(f => ({ ...f, date: e.target.value }))} className="admin-input" />
                            </Field>
                            <Field label="Description">
                                <input value={newForm.description} onChange={e => setNewForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description" className="admin-input" />
                            </Field>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleCreate} disabled={saving || !newForm.title.trim() || !newForm.date} className="px-4 py-2 text-sm bg-accent-700 text-white hover:bg-accent-800 font-light transition-colors disabled:opacity-50 flex items-center gap-2">
                                {saving && <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                                {saving ? 'Saving…' : 'Save'}
                            </button>
                            <button onClick={() => { setShowNewForm(false); setNewForm({ ...emptyForm }) }} className="px-4 py-2 text-sm border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-light transition-colors">Cancel</button>
                        </div>
                    </div>
                )}

                <div className="bg-white border border-neutral-200 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-100">
                                {['Title', 'Type', 'Date', 'Description', 'Published', '', ''].map((h, i) => (
                                    <th key={i} className="text-left px-4 py-3 text-[0.65rem] uppercase tracking-[0.2em] text-neutral-400 font-light whitespace-nowrap" style={{ fontWeight: 500 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {items.map(item => (
                                <React.Fragment key={item.id}>
                                    <tr className="hover:bg-neutral-50 transition-colors">
                                        <td className="px-4 py-3 text-neutral-800 font-light max-w-xs">
                                            <p className="truncate">{item.title}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block text-[0.65rem] uppercase tracking-wider px-2 py-0.5 border font-light ${TYPE_COLORS[item.type]}`} style={{ fontWeight: 500 }}>
                                                {TYPE_LABELS[item.type]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-neutral-500 font-light whitespace-nowrap">{item.date}</td>
                                        <td className="px-4 py-3 text-neutral-500 font-light max-w-xs truncate">
                                            {item.description ? item.description.substring(0, 50) + (item.description.length > 50 ? '…' : '') : <span className="text-neutral-300">—</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => togglePublished(item.id)}
                                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${item.published ? 'bg-accent-600' : 'bg-neutral-200'}`}
                                            >
                                                <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${item.published ? 'translate-x-4.5' : 'translate-x-0.5'}`} style={{ transform: item.published ? 'translateX(18px)' : 'translateX(2px)' }} />
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={() => editingId === item.id ? setEditingId(null) : startEdit(item)} className="text-xs text-accent-700 hover:text-accent-800 font-light transition-colors">
                                                {editingId === item.id ? 'Close' : 'Edit'}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={() => setConfirmDeleteId(item.id)} className="text-xs text-red-400 hover:text-red-600 font-light transition-colors">Delete</button>
                                        </td>
                                    </tr>
                                    {editingId === item.id && (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-4 bg-neutral-50 border-b border-neutral-100">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                                    <Field label="Title">
                                                        <input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} className="admin-input" />
                                                    </Field>
                                                    <Field label="Type">
                                                        <select value={editForm.type} onChange={e => setEditForm(f => ({ ...f, type: e.target.value as RecognitionType }))} className="admin-input">
                                                            {TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                                                        </select>
                                                    </Field>
                                                    <Field label="Date">
                                                        <input type="date" value={editForm.date} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} className="admin-input" />
                                                    </Field>
                                                    <Field label="Description">
                                                        <input value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} className="admin-input" />
                                                    </Field>
                                                </div>
                                                <div className="flex gap-3">
                                                    <button onClick={() => handleEditSave(item.id)} disabled={editSaving} className="px-4 py-2 text-sm bg-accent-700 text-white hover:bg-accent-800 font-light transition-colors disabled:opacity-50 flex items-center gap-2">
                                                        {editSaving && <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                                                        {editSaving ? 'Saving…' : 'Save'}
                                                    </button>
                                                    <button onClick={() => setEditingId(null)} className="px-4 py-2 text-sm border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-light transition-colors">Cancel</button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                    {items.length === 0 && <p className="text-center py-12 text-sm text-neutral-400 font-light">No recognition entries yet.</p>}
                </div>
            </div>

            {confirmDeleteId && toDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 max-w-sm w-full shadow-xl">
                        <h3 className="font-display text-lg text-neutral-900 mb-2" style={{ fontWeight: 500 }}>Delete this entry?</h3>
                        <p className="text-sm text-neutral-500 font-light mb-6">This will permanently remove &ldquo;{toDelete.title}&rdquo;. This cannot be undone.</p>
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

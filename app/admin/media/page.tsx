'use client'

import React, { useState, useRef } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { adminMediaAssets, adminDashboardStats, AdminMediaAsset } from '@/lib/admin/mockAdminData'

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function MediaPage() {
    const [assets, setAssets] = useState<AdminMediaAsset[]>(adminMediaAssets)
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [dragOver, setDragOver] = useState(false)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const toDelete = assets.find(a => a.id === confirmDeleteId)

    async function handleDelete(id: string) {
        setDeleting(true)
        await new Promise(r => setTimeout(r, 600))
        setAssets(prev => prev.filter(a => a.id !== id))
        setConfirmDeleteId(null)
        setDeleting(false)
    }

    async function handleUpload(files: FileList | null) {
        if (!files || files.length === 0) return
        setUploading(true)
        await new Promise(r => setTimeout(r, 1200))
        const newAssets: AdminMediaAsset[] = Array.from(files).map((file, i) => ({
            id: String(Date.now() + i),
            filename: file.name,
            thumbnailUrl: URL.createObjectURL(file),
            originalUrl: URL.createObjectURL(file),
            width: 1200,
            height: 900,
            size: file.size,
            mimeType: file.type,
            uploadedAt: new Date().toISOString().split('T')[0],
            usedInArtworks: 0,
        }))
        setAssets(prev => [...newAssets, ...prev])
        setUploading(false)
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault()
        setDragOver(false)
        handleUpload(e.dataTransfer.files)
    }

    return (
        <AdminLayout breadcrumb={[{ label: 'Media' }]} unreadCount={adminDashboardStats.unreadInquiryCount}>
            <div className="max-w-6xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-display text-neutral-900 tracking-tight" style={{ fontWeight: 500 }}>Media</h1>
                        <p className="text-sm text-neutral-500 font-light mt-0.5">{assets.length} asset{assets.length !== 1 ? 's' : ''}</p>
                    </div>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent-700 text-white text-sm font-light hover:bg-accent-800 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        Upload
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleUpload(e.target.files)} />
                </div>

                {/* Upload zone */}
                <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded transition-colors cursor-pointer flex flex-col items-center justify-center py-10 gap-3 ${dragOver ? 'border-accent-500 bg-accent-50' : 'border-neutral-200 hover:border-neutral-300 bg-white'}`}
                >
                    {uploading ? (
                        <>
                            <svg className="w-6 h-6 animate-spin text-accent-600" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                            <p className="text-sm text-neutral-500 font-light">Uploading…</p>
                        </>
                    ) : (
                        <>
                            <svg className="w-6 h-6 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            <p className="text-sm text-neutral-400 font-light">Drag & drop images here, or <span className="text-accent-700">browse</span></p>
                            <p className="text-xs text-neutral-300 font-light">JPG, PNG, WebP</p>
                        </>
                    )}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {assets.map(asset => (
                        <div key={asset.id} className="group relative bg-white border border-neutral-200 overflow-hidden">
                            {/* Thumbnail */}
                            <div className="aspect-square bg-neutral-100 overflow-hidden">
                                <img
                                    src={asset.thumbnailUrl}
                                    alt={asset.filename}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                            {/* Info */}
                            <div className="p-2">
                                <p className="text-xs text-neutral-700 font-light truncate" title={asset.filename}>{asset.filename}</p>
                                <p className="text-[0.65rem] text-neutral-400 font-light mt-0.5">{formatBytes(asset.size)}</p>
                                {asset.usedInArtworks > 0 && (
                                    <span className="inline-block mt-1 text-[0.6rem] uppercase tracking-wider bg-neutral-100 text-neutral-500 px-1.5 py-0.5" style={{ fontWeight: 500 }}>
                                        In use
                                    </span>
                                )}
                            </div>
                            {/* Delete overlay */}
                            <button
                                onClick={() => setConfirmDeleteId(asset.id)}
                                className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                title="Delete"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    ))}
                </div>

                {assets.length === 0 && (
                    <p className="text-center py-12 text-sm text-neutral-400 font-light">No media assets yet.</p>
                )}
            </div>

            {/* Delete modal */}
            {confirmDeleteId && toDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 max-w-sm w-full shadow-xl">
                        <h3 className="font-display text-lg text-neutral-900 mb-2" style={{ fontWeight: 500 }}>Delete this image?</h3>
                        {toDelete.usedInArtworks > 0 ? (
                            <div className="mb-6">
                                <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 mb-3">
                                    <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    <p className="text-xs text-amber-700 font-light">This image is used in {toDelete.usedInArtworks} artwork{toDelete.usedInArtworks !== 1 ? 's' : ''}. Deleting it may break those artwork listings.</p>
                                </div>
                                <p className="text-sm text-neutral-500 font-light">Are you sure you want to delete <span className="text-neutral-700">{toDelete.filename}</span>?</p>
                            </div>
                        ) : (
                            <p className="text-sm text-neutral-500 font-light mb-6">This will permanently remove <span className="text-neutral-700">{toDelete.filename}</span>. This cannot be undone.</p>
                        )}
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

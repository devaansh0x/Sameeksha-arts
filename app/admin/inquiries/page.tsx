'use client'

import React, { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { adminInquiries, adminDashboardStats, AdminInquiry } from '@/lib/admin/mockAdminData'

type Tab = 'ALL' | 'UNREAD' | 'READ' | 'ARCHIVED'

function formatDate(iso: string) {
    const d = new Date(iso)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function InquiriesPage() {
    const [inquiries, setInquiries] = useState<AdminInquiry[]>(adminInquiries)
    const [tab, setTab] = useState<Tab>('ALL')
    const [expandedId, setExpandedId] = useState<string | null>(null)

    const unreadCount = inquiries.filter(i => i.status === 'UNREAD').length

    const filtered = inquiries.filter(i => {
        if (tab === 'ALL') return i.status !== 'ARCHIVED'
        return i.status === tab
    })

    function markRead(id: string) {
        setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: 'READ' as const } : i))
    }

    function markArchived(id: string) {
        setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: 'ARCHIVED' as const } : i))
        if (expandedId === id) setExpandedId(null)
    }

    const tabs: { id: Tab; label: string }[] = [
        { id: 'ALL', label: 'All active' },
        { id: 'UNREAD', label: 'Unread' },
        { id: 'READ', label: 'Read' },
        { id: 'ARCHIVED', label: 'Archived' },
    ]

    return (
        <AdminLayout breadcrumb={[{ label: 'Inquiries' }]} unreadCount={unreadCount}>
            <div className="max-w-4xl space-y-6">
                <div>
                    <h1 className="text-2xl font-display text-neutral-900 tracking-tight" style={{ fontWeight: 500 }}>Inquiries</h1>
                    <p className="text-sm text-neutral-500 font-light mt-0.5">{unreadCount} unread</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 border-b border-neutral-200">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`px-4 py-2.5 text-sm font-light transition-colors relative ${tab === t.id ? 'text-accent-700' : 'text-neutral-500 hover:text-neutral-700'}`}
                        >
                            {t.label}
                            {t.id === 'UNREAD' && unreadCount > 0 && (
                                <span className="ml-1.5 inline-flex items-center justify-center text-[0.6rem] bg-red-500 text-white rounded-full min-w-[1rem] h-4 px-1" style={{ fontWeight: 600 }}>{unreadCount}</span>
                            )}
                            {tab === t.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-700" />}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="bg-white border border-neutral-200 divide-y divide-neutral-100">
                    {filtered.length === 0 && (
                        <p className="text-center py-12 text-sm text-neutral-400 font-light">No inquiries here.</p>
                    )}
                    {filtered.map(inquiry => (
                        <div key={inquiry.id}>
                            {/* Row */}
                            <div
                                className="px-5 py-4 flex items-start gap-4 cursor-pointer hover:bg-neutral-50 transition-colors"
                                onClick={() => {
                                    setExpandedId(prev => prev === inquiry.id ? null : inquiry.id)
                                    if (inquiry.status === 'UNREAD') markRead(inquiry.id)
                                }}
                            >
                                {/* Unread dot */}
                                <div className="pt-1.5 shrink-0 w-3 flex justify-center">
                                    {inquiry.status === 'UNREAD' && (
                                        <span className="w-2 h-2 rounded-full bg-blue-500 block" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className={`text-sm font-light ${inquiry.status === 'UNREAD' ? 'text-neutral-900' : 'text-neutral-600'}`} style={inquiry.status === 'UNREAD' ? { fontWeight: 500 } : undefined}>
                                            {inquiry.name}
                                        </span>
                                        <span className="text-xs text-neutral-400 font-light">{inquiry.email}</span>
                                        <span className="text-xs text-neutral-300">·</span>
                                        <span className="text-xs text-neutral-400 font-light">{formatDate(inquiry.createdAt)}</span>
                                    </div>
                                    <p className={`text-sm font-light mt-0.5 truncate ${inquiry.status === 'UNREAD' ? 'text-neutral-700' : 'text-neutral-500'}`}>
                                        {inquiry.subject}
                                    </p>
                                    {expandedId !== inquiry.id && (
                                        <p className="text-xs text-neutral-400 font-light mt-0.5 truncate">{inquiry.message}</p>
                                    )}
                                </div>

                                <div className="shrink-0 flex items-center gap-1">
                                    {inquiry.status === 'ARCHIVED' ? (
                                        <span className="text-[0.65rem] uppercase tracking-wider text-neutral-400 font-light px-2 py-0.5 border border-neutral-200">Archived</span>
                                    ) : (
                                        <span className={`text-[0.65rem] uppercase tracking-wider font-light px-2 py-0.5 border ${inquiry.status === 'UNREAD' ? 'border-blue-200 text-blue-600 bg-blue-50' : 'border-neutral-200 text-neutral-400'}`} style={{ fontWeight: 500 }}>
                                            {inquiry.status === 'UNREAD' ? 'New' : 'Read'}
                                        </span>
                                    )}
                                    <svg className={`w-4 h-4 text-neutral-400 transition-transform ${expandedId === inquiry.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>

                            {/* Expanded */}
                            {expandedId === inquiry.id && (
                                <div className="px-12 pb-5 bg-neutral-50 border-t border-neutral-100">
                                    <div className="pt-4 space-y-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-light mb-1" style={{ fontWeight: 500 }}>From</p>
                                                <p className="text-neutral-700 font-light">{inquiry.name}</p>
                                                <p className="text-neutral-500 font-light">{inquiry.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-light mb-1" style={{ fontWeight: 500 }}>Subject</p>
                                                <p className="text-neutral-700 font-light">{inquiry.subject}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-light mb-2" style={{ fontWeight: 500 }}>Message</p>
                                            <p className="text-sm text-neutral-700 font-light leading-relaxed bg-white border border-neutral-200 p-4">{inquiry.message}</p>
                                        </div>
                                        <div className="flex items-center gap-3 pt-1">
                                            <a
                                                href={`mailto:${inquiry.email}?subject=Re: ${encodeURIComponent(inquiry.subject)}`}
                                                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-accent-700 text-white font-light hover:bg-accent-800 transition-colors"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                Reply by email
                                            </a>
                                            {inquiry.status !== 'READ' && inquiry.status !== 'ARCHIVED' && (
                                                <button onClick={() => markRead(inquiry.id)} className="px-4 py-2 text-sm border border-neutral-200 text-neutral-600 font-light hover:bg-neutral-100 transition-colors">
                                                    Mark as read
                                                </button>
                                            )}
                                            {inquiry.status !== 'ARCHIVED' && (
                                                <button onClick={() => markArchived(inquiry.id)} className="px-4 py-2 text-sm border border-neutral-200 text-neutral-500 font-light hover:bg-neutral-100 transition-colors">
                                                    Archive
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <style>{`.admin-input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #e5e5e5; font-size: 0.875rem; font-weight: 300; color: #1a1a1a; background: white; outline: none; } .admin-input:focus { border-color: #9a7865; }`}</style>
        </AdminLayout>
    )
}

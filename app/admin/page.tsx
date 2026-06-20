'use client'

import React from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import { adminDashboardStats, adminInquiries } from '@/lib/admin/mockAdminData'

function StatCard({ label, value, sub, href, color = 'accent' }: {
    label: string; value: number | string; sub?: string; href: string
    color?: 'accent' | 'green' | 'amber' | 'red'
}) {
    const colors = {
        accent: 'text-accent-700',
        green:  'text-emerald-600',
        amber:  'text-amber-600',
        red:    'text-red-600',
    }
    return (
        <Link href={href} className="bg-white border border-neutral-200 p-6 hover:border-accent-300 hover:shadow-sm transition-all group block">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 mb-3 font-light" style={{ fontWeight: 500 }}>{label}</p>
            <p className={`text-4xl font-display ${colors[color]} mb-1`} style={{ fontWeight: 500 }}>{value}</p>
            {sub && <p className="text-xs text-neutral-400 font-light">{sub}</p>}
        </Link>
    )
}

const statusLabel: Record<string, string> = {
    AVAILABLE: 'Available', SOLD: 'Sold', ON_COMMISSION: 'On Commission', NOT_FOR_SALE: 'Not for Sale',
}
const statusColor: Record<string, string> = {
    AVAILABLE: 'bg-emerald-100 text-emerald-700', SOLD: 'bg-red-100 text-red-700',
    ON_COMMISSION: 'bg-amber-100 text-amber-700', NOT_FOR_SALE: 'bg-neutral-100 text-neutral-600',
}
const inquiryStatusColor: Record<string, string> = {
    UNREAD: 'bg-blue-100 text-blue-700', READ: 'bg-neutral-100 text-neutral-600', ARCHIVED: 'bg-neutral-100 text-neutral-400',
}

export default function AdminDashboard() {
    const { artworkCount, collectionCount, recognitionCount, unreadInquiryCount, artworksByStatus } = adminDashboardStats
    const recentInquiries = adminInquiries.slice(0, 5)

    return (
        <AdminLayout breadcrumb={[{ label: 'Dashboard' }]} unreadCount={unreadInquiryCount}>
            <div className="space-y-8 max-w-6xl">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-display text-neutral-900 tracking-tight" style={{ fontWeight: 500 }}>
                        Good morning
                    </h1>
                    <p className="text-sm text-neutral-500 font-light mt-1">Here's what's happening with the studio.</p>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Artworks"    value={artworkCount}      href="/admin/artworks"    color="accent" />
                    <StatCard label="Collections" value={collectionCount}   href="/admin/collections" color="accent" />
                    <StatCard label="Recognition" value={recognitionCount}  href="/admin/recognition" color="accent" />
                    <StatCard label="Unread"      value={unreadInquiryCount} href="/admin/inquiries"  color={unreadInquiryCount > 0 ? 'red' : 'accent'} sub="inquiries" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent inquiries */}
                    <div className="lg:col-span-2 bg-white border border-neutral-200">
                        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                            <h2 className="text-sm font-light text-neutral-700" style={{ fontWeight: 500 }}>Recent Inquiries</h2>
                            <Link href="/admin/inquiries" className="text-xs text-accent-700 hover:text-accent-800 font-light">View all →</Link>
                        </div>
                        <div className="divide-y divide-neutral-100">
                            {recentInquiries.map(inq => (
                                <Link key={inq.id} href={`/admin/inquiries`} className="flex items-center justify-between px-6 py-3.5 hover:bg-neutral-50 transition-colors group">
                                    <div className="min-w-0">
                                        <p className="text-sm text-neutral-800 font-light truncate group-hover:text-neutral-900">{inq.name}</p>
                                        <p className="text-xs text-neutral-400 font-light truncate">{inq.subject}</p>
                                    </div>
                                    <div className="flex items-center gap-3 ml-4 shrink-0">
                                        <span className="text-xs text-neutral-400 font-light">
                                            {new Date(inq.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                        </span>
                                        <span className={`text-[0.6rem] uppercase tracking-wide px-2 py-0.5 rounded-full font-light ${inquiryStatusColor[inq.status]}`} style={{ fontWeight: 500 }}>
                                            {inq.status.toLowerCase()}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Artwork status breakdown */}
                    <div className="bg-white border border-neutral-200">
                        <div className="px-6 py-4 border-b border-neutral-100">
                            <h2 className="text-sm font-light text-neutral-700" style={{ fontWeight: 500 }}>Artworks by Status</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            {Object.entries(artworksByStatus).map(([status, count]) => (
                                <div key={status}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-xs text-neutral-600 font-light">{statusLabel[status]}</span>
                                        <span className="text-xs text-neutral-900 font-light tabular-nums" style={{ fontWeight: 500 }}>{count}</span>
                                    </div>
                                    <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-accent-600 rounded-full transition-all"
                                            style={{ width: artworkCount > 0 ? `${(count / artworkCount) * 100}%` : '0%' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Quick actions */}
                        <div className="px-6 pb-6 pt-2 border-t border-neutral-100 mt-2">
                            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 mb-3 font-light" style={{ fontWeight: 500 }}>Quick Actions</p>
                            <div className="space-y-2">
                                {[
                                    { label: 'Add new artwork',    href: '/admin/artworks/new' },
                                    { label: 'Upload media',       href: '/admin/media' },
                                    { label: 'Edit page content',  href: '/admin/content' },
                                ].map(a => (
                                    <Link key={a.href} href={a.href}
                                        className="block text-sm text-neutral-600 hover:text-accent-700 font-light transition-colors py-1"
                                    >
                                        → {a.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

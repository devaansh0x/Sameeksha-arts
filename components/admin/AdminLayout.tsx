'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

interface NavItem {
    href: string
    label: string
    icon: React.ReactNode
    badge?: number
}

function NavIcon({ d }: { d: string }) {
    return (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d={d} />
        </svg>
    )
}

interface AdminLayoutProps {
    children: React.ReactNode
    breadcrumb?: { label: string; href?: string }[]
    unreadCount?: number
}

export default function AdminLayout({ children, breadcrumb, unreadCount = 0 }: AdminLayoutProps) {
    const pathname = usePathname()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const nav: NavItem[] = [
        { href: '/admin',            label: 'Dashboard',    icon: <NavIcon d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
        { href: '/admin/artworks',   label: 'Artworks',     icon: <NavIcon d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
        { href: '/admin/collections',label: 'Collections',  icon: <NavIcon d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /> },
        { href: '/admin/media',      label: 'Media',        icon: <NavIcon d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z" /> },
        { href: '/admin/inquiries',  label: 'Inquiries',    icon: <NavIcon d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />, badge: unreadCount > 0 ? unreadCount : undefined },
        { href: '/admin/content',    label: 'Page Content', icon: <NavIcon d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /> },
        { href: '/admin/recognition',label: 'Recognition',  icon: <NavIcon d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /> },
        { href: '/admin/testimonials',label:'Testimonials', icon: <NavIcon d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /> },
        { href: '/admin/settings',   label: 'Settings',     icon: <NavIcon d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" /> },
    ]

    const isActive = (href: string) => href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

    const sidebar = (
        <nav className="flex flex-col h-full">
            {/* Logo */}
            <div className="px-6 py-6 border-b border-neutral-800">
                <Link href="/admin" className="block">
                    <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-1" style={{ fontWeight: 500 }}>Artist Dashboard</p>
                    <p className="text-lg font-display italic text-white" style={{ fontWeight: 500 }}>Sameeksha Arts</p>
                </Link>
            </div>

            {/* Nav items */}
            <div className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                {nav.map(item => {
                    const active = isActive(item.href)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 text-sm font-light rounded-lg transition-all duration-200 group ${
                                active
                                    ? 'bg-accent-700 text-white'
                                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                            }`}
                        >
                            <span className={active ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-300'}>
                                {item.icon}
                            </span>
                            <span className="flex-1">{item.label}</span>
                            {item.badge !== undefined && (
                                <span className="text-[0.6rem] bg-red-500 text-white rounded-full min-w-[1.1rem] h-[1.1rem] flex items-center justify-center px-1" style={{ fontWeight: 600 }}>
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    )
                })}
            </div>

            {/* Footer */}
            <div className="px-3 py-4 border-t border-neutral-800 space-y-1">
                <Link href="/" target="_blank" className="flex items-center gap-3 px-3 py-2.5 text-sm font-light text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-all">
                    <NavIcon d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    <span>View Site</span>
                </Link>
                <button
                    onClick={() => signOut({ callbackUrl: '/admin/login' })}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-light text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-all"
                >
                    <NavIcon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    <span>Sign out</span>
                </button>
            </div>
        </nav>
    )

    return (
        <div className="flex h-screen bg-neutral-100 overflow-hidden">
            {/* Desktop sidebar */}
            <aside className="hidden lg:flex lg:flex-col w-56 bg-neutral-900 shrink-0">
                {sidebar}
            </aside>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-40 flex">
                    <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
                    <aside className="relative flex flex-col w-64 bg-neutral-900 z-50">
                        {sidebar}
                    </aside>
                </div>
            )}

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top bar */}
                <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        {/* Mobile menu button */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-1.5 text-neutral-500 hover:text-neutral-900"
                            aria-label="Open menu"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {/* Breadcrumb */}
                        {breadcrumb && breadcrumb.length > 0 && (
                            <nav className="flex items-center gap-2 text-sm">
                                {breadcrumb.map((crumb, i) => (
                                    <React.Fragment key={i}>
                                        {i > 0 && <span className="text-neutral-300">/</span>}
                                        {crumb.href ? (
                                            <Link href={crumb.href} className="text-neutral-500 hover:text-neutral-900 font-light transition-colors">
                                                {crumb.label}
                                            </Link>
                                        ) : (
                                            <span className="text-neutral-900 font-light">{crumb.label}</span>
                                        )}
                                    </React.Fragment>
                                ))}
                            </nav>
                        )}
                    </div>

                    {unreadCount > 0 && (
                        <Link href="/admin/inquiries" className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="font-light">{unreadCount} unread</span>
                        </Link>
                    )}
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}

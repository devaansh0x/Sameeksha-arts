'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeToggle from '@/components/common/ThemeToggle'

const links = [
    { name: 'Home',        href: '/' },
    { name: 'About',       href: '/about' },
    { name: 'Work',        href: '/work' },
    { name: 'Commissions', href: '/commissions' },
    { name: 'Recognition', href: '/recognition' },
    { name: 'Contact',     href: '/contact' },
]

export default function Navigation() {
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    // Solid/transparent toggle — transparent only on the homepage hero
    useEffect(() => {
        function onScroll() {
            setScrolled(window.scrollY > 60)
        }
        onScroll()
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    // Nav is transparent only when on the homepage and not yet scrolled
    const isHomepage = pathname === '/'
    const transparent = isHomepage && !scrolled && !mobileMenuOpen

    function isActive(href: string) {
        if (href === '/') return pathname === '/'
        return pathname.startsWith(href)
    }

    return (
        <nav
            className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-luxe ${
                transparent
                    ? 'bg-transparent border-b border-transparent'
                    : 'bg-primary-50/90 dark:bg-neutral-900/90 backdrop-blur-xl border-b border-primary-200/60 dark:border-white/10 shadow-sm shadow-neutral-900/5'
            }`}
        >
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                <div className="flex justify-between items-center h-20">

                    {/* Logo */}
                    <Link href="/" className="flex items-center group shrink-0">
                        <span
                            className={`text-2xl font-display italic tracking-tight transition-colors duration-500 ${
                                transparent
                                    ? 'text-white letterpress'
                                    : 'text-neutral-900 group-hover:text-accent-700'
                            }`}
                            style={{ fontWeight: 500 }}
                        >
                            Sameeksha Arts
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-10">
                        {links.map((link) => {
                            const active = isActive(link.href)
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`text-[0.72rem] uppercase tracking-[0.22em] transition-all duration-300 relative group ${
                                        transparent
                                            ? 'text-white/80 hover:text-white'
                                            : active
                                                ? 'text-accent-700'
                                                : 'text-neutral-600 hover:text-neutral-900'
                                    }`}
                                    style={{ fontWeight: active && !transparent ? 500 : 400 }}
                                >
                                    {link.name}
                                    {/* Underline indicator */}
                                    <span
                                        className={`absolute -bottom-1.5 left-0 h-px transition-all duration-500 ease-luxe ${
                                            transparent ? 'bg-white' : 'bg-accent-700'
                                        } ${active ? 'w-full' : 'w-0 group-hover:w-full'}`}
                                    />
                                </Link>
                            )
                        })}
                        <span className={`h-5 w-px ${transparent ? 'bg-white/30' : 'bg-primary-300 dark:bg-white/20'}`} />
                        <ThemeToggle transparent={transparent} />
                    </div>

                    {/* Mobile actions */}
                    <div className="md:hidden flex items-center gap-1">
                        <ThemeToggle transparent={transparent} />
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className={`p-2.5 focus:outline-none transition-colors rounded-lg ${
                                transparent
                                    ? 'text-white hover:bg-white/10'
                                    : 'text-neutral-700 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-white/10'
                            }`}
                            aria-label="Toggle menu"
                        >
                            <svg className="h-5 w-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" stroke="currentColor">
                                {mobileMenuOpen
                                    ? <path d="M6 18L18 6M6 6l12 12" />
                                    : <path d="M4 6h16M4 12h16M4 18h16" />
                                }
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile drawer */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-primary-200/60 bg-primary-50/98 dark:bg-neutral-900/98 backdrop-blur-xl animate-fade-in">
                    <div className="px-6 py-6 space-y-1">
                        {links.map((link) => {
                            const active = isActive(link.href)
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block px-5 py-3.5 text-sm uppercase tracking-[0.22em] transition-all rounded-lg ${
                                        active
                                            ? 'text-accent-700 bg-accent-50'
                                            : 'text-neutral-600 hover:text-neutral-900 hover:bg-primary-100'
                                    }`}
                                    style={{ fontWeight: active ? 500 : 400 }}
                                >
                                    {link.name}
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}
        </nav>
    )
}

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import ThemeToggle from '@/components/common/ThemeToggle'

const sections = [
    { name: 'Home', id: 'home' },
    { name: 'About', id: 'about' },
    { name: 'Work', id: 'work' },
    { name: 'Commissions', id: 'commissions' },
    { name: 'Recognition', id: 'recognition' },
    { name: 'Contact', id: 'contact' },
]

export default function Navigation() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [activeSection, setActiveSection] = useState('home')

    // Solid/transparent toggle on scroll
    useEffect(() => {
        function onScroll() {
            setScrolled(window.scrollY > 40)
        }
        onScroll()
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    // Scroll-spy — highlight the section currently in view
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id)
                    }
                })
            },
            { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
        )

        sections.forEach((s) => {
            const el = document.getElementById(s.id)
            if (el) observer.observe(el)
        })

        return () => observer.disconnect()
    }, [])

    // Smooth-scroll to a section, accounting for the fixed nav height.
    // If the section isn't on the current page (e.g. an artwork detail page),
    // navigate to the homepage anchor instead.
    const scrollToSection = useCallback((e: React.MouseEvent, id: string) => {
        e.preventDefault()
        setMobileMenuOpen(false)
        const el = document.getElementById(id)
        if (el) {
            const top = el.getBoundingClientRect().top + window.scrollY - 72
            window.scrollTo({ top, behavior: 'smooth' })
            history.replaceState(null, '', id === 'home' ? '/' : `#${id}`)
        } else {
            window.location.href = id === 'home' ? '/' : `/#${id}`
        }
    }, [])

    const transparent = !scrolled && !mobileMenuOpen

    return (
        <nav
            className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-luxe ${transparent
                ? 'bg-transparent border-b border-transparent py-2'
                : 'bg-primary-50/85 dark:bg-neutral-900/85 backdrop-blur-xl border-b border-primary-200/60 dark:border-white/10 shadow-sm shadow-neutral-900/5'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                <div className={`flex justify-between items-center transition-all duration-500 ${transparent ? 'h-24' : 'h-20'}`}>
                    {/* Logo */}
                    <a href="#home" onClick={(e) => scrollToSection(e, 'home')} className="flex items-center group cursor-pointer">
                        <span
                            className={`text-2xl font-display italic tracking-tight transition-colors duration-500 ${transparent ? 'text-white letterpress' : 'text-neutral-900 group-hover:text-accent-700'
                                }`}
                            style={{ fontWeight: 500 }}
                        >
                            Sameeksha Arts
                        </span>
                    </a>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-10">
                        {sections.map((link) => {
                            const isActive = activeSection === link.id
                            return (
                                <a
                                    key={link.id}
                                    href={`#${link.id}`}
                                    onClick={(e) => scrollToSection(e, link.id)}
                                    className={`text-[0.72rem] uppercase tracking-[0.22em] transition-all duration-300 relative group cursor-pointer ${transparent
                                        ? 'text-white/80 hover:text-white'
                                        : isActive
                                            ? 'text-accent-700'
                                            : 'text-neutral-600 hover:text-neutral-900'
                                        }`}
                                    style={{ fontWeight: isActive ? 500 : 400 }}
                                >
                                    {link.name}
                                    <span
                                        className={`absolute -bottom-1.5 left-0 h-px transition-all duration-500 ease-luxe ${transparent ? 'bg-white' : 'bg-accent-700'
                                            } ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}
                                    />
                                </a>
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
                            className={`p-2.5 focus:outline-none transition-colors rounded-lg ${transparent ? 'text-white hover:bg-white/10' : 'text-neutral-700 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-white/10'
                                }`}
                            aria-label="Toggle menu"
                        >
                            <svg
                                className="h-5 w-5 transition-transform duration-300"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                {mobileMenuOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-primary-200/60 bg-primary-50/98 backdrop-blur-xl animate-fade-in">
                    <div className="px-6 py-6 space-y-1">
                        {sections.map((link, index) => {
                            const isActive = activeSection === link.id
                            return (
                                <a
                                    key={link.id}
                                    href={`#${link.id}`}
                                    onClick={(e) => scrollToSection(e, link.id)}
                                    className={`block px-5 py-3.5 text-sm uppercase tracking-[0.22em] transition-all rounded-lg cursor-pointer ${isActive
                                        ? 'text-accent-700 bg-accent-50'
                                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-primary-100'
                                        }`}
                                    style={{ animationDelay: `${index * 50}ms`, fontWeight: isActive ? 500 : 400 }}
                                >
                                    {link.name}
                                </a>
                            )
                        })}
                    </div>
                </div>
            )}
        </nav>
    )
}

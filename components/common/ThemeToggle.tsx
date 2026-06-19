'use client'

import React, { useEffect, useState } from 'react'

interface ThemeToggleProps {
    /** tints the icon for use over the transparent hero nav */
    transparent?: boolean
}

/**
 * Light / dark mode toggle. Persists the choice to localStorage and toggles
 * the `dark` class on <html>. The initial class is set by an inline script in
 * the layout to avoid a flash of the wrong theme.
 */
export default function ThemeToggle({ transparent = false }: ThemeToggleProps) {
    const [isDark, setIsDark] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        setIsDark(document.documentElement.classList.contains('dark'))
    }, [])

    function toggle() {
        const root = document.documentElement
        const next = !root.classList.contains('dark')
        root.classList.toggle('dark', next)
        try {
            localStorage.setItem('theme', next ? 'dark' : 'light')
        } catch {
            /* ignore */
        }
        setIsDark(next)
    }

    const tint = transparent
        ? 'text-white/80 hover:text-white hover:bg-white/10'
        : 'text-neutral-600 hover:text-accent-700 hover:bg-primary-100 dark:text-primary-200 dark:hover:text-white dark:hover:bg-white/10'

    return (
        <button
            onClick={toggle}
            aria-label={mounted ? (isDark ? 'Switch to light mode' : 'Switch to dark mode') : 'Toggle theme'}
            className={`relative p-2.5 rounded-full transition-colors duration-300 focus:outline-none ${tint}`}
        >
            {/* Sun / moon crossfade */}
            <span className="relative block w-5 h-5">
                {/* Sun */}
                <svg
                    className={`absolute inset-0 w-5 h-5 transition-all duration-500 ease-luxe ${mounted && isDark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                >
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
                {/* Moon */}
                <svg
                    className={`absolute inset-0 w-5 h-5 transition-all duration-500 ease-luxe ${mounted && isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
            </span>
        </button>
    )
}

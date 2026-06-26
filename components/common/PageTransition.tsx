'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Wraps page content in a smooth fade-in on every navigation.
 * Triggered by pathname changes — each new page fades from opacity 0 to 1.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        setVisible(false)
        // Small tick to let the DOM settle before fading in
        const t = setTimeout(() => setVisible(true), 30)
        return () => clearTimeout(t)
    }, [pathname])

    return (
        <div
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(6px)',
                transition: 'opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1), transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
        >
            {children}
        </div>
    )
}

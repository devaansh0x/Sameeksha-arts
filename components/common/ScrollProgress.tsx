'use client'

import React, { useEffect, useRef } from 'react'

/**
 * A thin gold progress bar fixed to the top of the viewport that fills
 * as the visitor scrolls. Driven by requestAnimationFrame and direct style
 * writes (no CSS transition) so it tracks the scroll position 1:1 without lag.
 */
export default function ScrollProgress() {
    const barRef = useRef<HTMLDivElement | null>(null)
    const ticking = useRef(false)

    useEffect(() => {
        function update() {
            const scrollTop = window.scrollY
            const docHeight = document.documentElement.scrollHeight - window.innerHeight
            const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
            if (barRef.current) {
                barRef.current.style.width = `${pct}%`
            }
            ticking.current = false
        }

        function onScroll() {
            if (!ticking.current) {
                ticking.current = true
                requestAnimationFrame(update)
            }
        }

        update()
        window.addEventListener('scroll', onScroll, { passive: true })
        window.addEventListener('resize', onScroll, { passive: true })
        return () => {
            window.removeEventListener('scroll', onScroll)
            window.removeEventListener('resize', onScroll)
        }
    }, [])

    return <div ref={barRef} className="scroll-progress" aria-hidden="true" />
}

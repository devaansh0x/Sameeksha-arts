'use client'

import React, { useEffect, useRef, useState } from 'react'

interface RevealProps {
    children: React.ReactNode
    /** delay in ms before the animation starts once in view */
    delay?: number
    /** direction the element travels from */
    direction?: 'up' | 'left' | 'right' | 'none'
    className?: string
    /** render as a different element */
    as?: keyof JSX.IntrinsicElements
}

/**
 * Reveal — wraps content and fades/slides it into view on scroll.
 * Uses IntersectionObserver. Respects prefers-reduced-motion.
 */
export default function Reveal({
    children,
    delay = 0,
    direction = 'up',
    className = '',
    as: Tag = 'div',
}: RevealProps) {
    const ref = useRef<HTMLElement | null>(null)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const node = ref.current
        if (!node) return

        // Respect reduced motion
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (prefersReduced) {
            setVisible(true)
            return
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisible(true)
                        observer.unobserve(entry.target)
                    }
                })
            },
            // Trigger a touch early and as soon as a sliver is visible, so the
            // motion feels anticipatory rather than lagging behind the scroll.
            { threshold: 0.01, rootMargin: '0px 0px 12% 0px' }
        )

        observer.observe(node)
        return () => observer.disconnect()
    }, [])

    const hiddenTransform = {
        up: 'translateY(1.25rem)',
        left: 'translateX(-1.25rem)',
        right: 'translateX(1.25rem)',
        none: 'none',
    }[direction]

    return (
        <Tag
            // @ts-expect-error — ref typing across polymorphic tag
            ref={ref}
            className={className}
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : hiddenTransform,
                transition: `opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
                willChange: 'opacity, transform',
            }}
        >
            {children}
        </Tag>
    )
}

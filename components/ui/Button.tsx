import React from 'react'
import Link from 'next/link'

interface ButtonProps {
    children: React.ReactNode
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    href?: string
    onClick?: () => void
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    className?: string
}

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    href,
    onClick,
    type = 'button',
    disabled = false,
    className = '',
}: ButtonProps) {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed tracking-wide group'

    const variantStyles = {
        primary: 'bg-accent-700 text-white hover:bg-accent-800 hover:shadow-lg hover:shadow-accent-700/25 focus:ring-accent-500 hover:-translate-y-0.5',
        secondary: 'bg-white text-accent-700 hover:bg-primary-50 hover:shadow-lg focus:ring-accent-500 hover:-translate-y-0.5',
        outline: 'border border-neutral-300 text-neutral-900 hover:border-accent-600 hover:text-neutral-900 hover:bg-accent-100 focus:ring-accent-500 backdrop-blur-sm',
        ghost: 'text-neutral-700 hover:text-accent-700 hover:bg-accent-50/50 focus:ring-accent-500',
    }

    const sizeStyles = {
        sm: 'px-5 py-2.5 text-sm rounded-lg',
        md: 'px-7 py-3.5 text-base rounded-lg',
        lg: 'px-10 py-4 text-base rounded-xl',
    }

    const classes = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`

    if (href) {
        return (
            <Link href={href} className={classes}>
                {children}
            </Link>
        )
    }

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={classes}
        >
            {children}
        </button>
    )
}

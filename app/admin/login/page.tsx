'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

function AdminLoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)
        try {
            const result = await signIn('credentials', { email, password, redirect: false })
            if (result?.error) {
                setError('Invalid email or password')
                setIsLoading(false)
            } else {
                const callbackUrl = searchParams.get('callbackUrl') || '/admin'
                router.push(callbackUrl)
                router.refresh()
            }
        } catch {
            setError('An error occurred during login')
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-900 px-4">
            <div className="w-full max-w-sm bg-white p-8">
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-400 mb-2 font-light" style={{ fontWeight: 500 }}>
                    Artist Dashboard
                </p>
                <h1 className="text-2xl font-display italic text-neutral-900 mb-8" style={{ fontWeight: 500 }}>
                    Sameeksha Arts
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 px-3 py-2.5">
                            <p className="text-sm text-red-700 font-light">{error}</p>
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-xs uppercase tracking-[0.2em] text-neutral-400 mb-1.5 font-light" style={{ fontWeight: 500 }}>Email</label>
                        <input id="email" name="email" type="email" autoComplete="email" required
                            value={email} onChange={e => setEmail(e.target.value)} disabled={isLoading}
                            className="admin-input" placeholder="admin@sameekshaarts.com" />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-xs uppercase tracking-[0.2em] text-neutral-400 mb-1.5 font-light" style={{ fontWeight: 500 }}>Password</label>
                        <input id="password" name="password" type="password" autoComplete="current-password" required
                            value={password} onChange={e => setPassword(e.target.value)} disabled={isLoading}
                            className="admin-input" placeholder="••••••••" />
                    </div>
                    <div className="pt-2">
                        <button type="submit" disabled={isLoading}
                            className="w-full py-2.5 px-4 bg-accent-700 text-white text-sm font-light hover:bg-accent-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                            {isLoading && <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                            {isLoading ? 'Signing in…' : 'Sign In'}
                        </button>
                    </div>
                </form>

                <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
                    <Link href="/" className="text-xs text-neutral-400 hover:text-neutral-600 font-light transition-colors">
                        ← Back to website
                    </Link>
                </div>
            </div>
            <style>{`.admin-input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #e5e5e5; font-size: 0.875rem; font-weight: 300; color: #1a1a1a; background: white; outline: none; } .admin-input:focus { border-color: #9a7865; }`}</style>
        </div>
    )
}

export default function AdminLogin() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-neutral-900" />}>
            <AdminLoginForm />
        </Suspense>
    )
}

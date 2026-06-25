'use client'

import React, { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { adminDashboardStats } from '@/lib/admin/mockAdminData'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-neutral-400 mb-1.5 font-light" style={{ fontWeight: 500 }}>{label}</label>
            {children}
        </div>
    )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 border-b border-neutral-100 pb-2 mb-5 font-light" style={{ fontWeight: 500 }}>{children}</p>
    )
}

function strengthLabel(score: number): { label: string; color: string } {
    if (score === 0) return { label: '', color: '' }
    if (score === 1) return { label: 'Weak', color: 'bg-red-400' }
    if (score === 2) return { label: 'Fair', color: 'bg-amber-400' }
    if (score === 3) return { label: 'Good', color: 'bg-yellow-400' }
    return { label: 'Strong', color: 'bg-emerald-500' }
}

function getPasswordScore(pw: string): number {
    if (!pw) return 0
    let score = 0
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
    if (/\d/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    return score
}

export default function SettingsPage() {
    const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
    const [pwSaving, setPwSaving] = useState(false)
    const [pwSaved, setPwSaved] = useState(false)
    const [pwError, setPwError] = useState<string | null>(null)
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNext, setShowNext] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const score = getPasswordScore(pwForm.next)
    const { label: strengthText, color: strengthColor } = strengthLabel(score)

    const nextMismatch = pwForm.confirm.length > 0 && pwForm.next !== pwForm.confirm
    const nextMatch = pwForm.confirm.length > 0 && pwForm.next === pwForm.confirm

    async function handlePasswordSave(e: React.FormEvent) {
        e.preventDefault()
        setPwError(null)

        if (!pwForm.current) { setPwError('Please enter your current password.'); return }
        if (pwForm.next.length < 8) { setPwError('New password must be at least 8 characters.'); return }
        if (pwForm.next !== pwForm.confirm) { setPwError('Passwords do not match.'); return }
        if (score < 2) { setPwError('Please choose a stronger password.'); return }

        setPwSaving(true)
        try {
            const res = await fetch('/api/admin/password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next, confirmPassword: pwForm.confirm }),
            })
            const data = await res.json()
            if (!data.success) { setPwError(data.error ?? 'An error occurred.'); setPwSaving(false); return }
            setPwSaving(false)
            setPwSaved(true)
            setPwForm({ current: '', next: '', confirm: '' })
            setTimeout(() => setPwSaved(false), 3000)
        } catch {
            setPwError('Network error. Please try again.')
            setPwSaving(false)
        }
    }

    return (
        <AdminLayout breadcrumb={[{ label: 'Settings' }]} unreadCount={adminDashboardStats.unreadInquiryCount}>
            <div className="max-w-xl space-y-8">
                <div>
                    <h1 className="text-2xl font-display text-neutral-900 tracking-tight" style={{ fontWeight: 500 }}>Settings</h1>
                    <p className="text-sm text-neutral-500 font-light mt-0.5">Account and security settings.</p>
                </div>

                {/* Profile — read-only */}
                <div className="bg-white border border-neutral-200 p-6">
                    <SectionTitle>Profile</SectionTitle>
                    <div className="space-y-4">
                        <Field label="Name">
                            <div className="px-3 py-2 border border-neutral-100 bg-neutral-50 text-sm text-neutral-600 font-light">Sameeksha</div>
                        </Field>
                        <Field label="Email">
                            <div className="px-3 py-2 border border-neutral-100 bg-neutral-50 text-sm text-neutral-600 font-light">admin@sameekshaarts.com</div>
                        </Field>
                        <Field label="Role">
                            <div className="px-3 py-2 border border-neutral-100 bg-neutral-50 text-sm text-neutral-600 font-light">Administrator</div>
                        </Field>
                    </div>
                    <p className="text-xs text-neutral-400 font-light mt-4">Profile details are managed by the system administrator.</p>
                </div>

                {/* Password change */}
                <div className="bg-white border border-neutral-200 p-6">
                    <SectionTitle>Change Password</SectionTitle>
                    <form onSubmit={handlePasswordSave} className="space-y-5">
                        <Field label="Current Password">
                            <div className="relative">
                                <input
                                    type={showCurrent ? 'text' : 'password'}
                                    value={pwForm.current}
                                    onChange={e => { setPwForm(f => ({ ...f, current: e.target.value })); setPwError(null) }}
                                    placeholder="Your current password"
                                    className="admin-input pr-10"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrent(v => !v)}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                    tabIndex={-1}
                                >
                                    {showCurrent ? (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    )}
                                </button>
                            </div>
                        </Field>

                        <Field label="New Password">
                            <div className="relative">
                                <input
                                    type={showNext ? 'text' : 'password'}
                                    value={pwForm.next}
                                    onChange={e => { setPwForm(f => ({ ...f, next: e.target.value })); setPwError(null) }}
                                    placeholder="At least 8 characters"
                                    className="admin-input pr-10"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNext(v => !v)}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                    tabIndex={-1}
                                >
                                    {showNext ? (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    )}
                                </button>
                            </div>
                            {/* Strength bar */}
                            {pwForm.next.length > 0 && (
                                <div className="mt-2 space-y-1">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4].map(n => (
                                            <div key={n} className={`h-1 flex-1 rounded-full transition-colors ${n <= score ? strengthColor : 'bg-neutral-200'}`} />
                                        ))}
                                    </div>
                                    <p className="text-xs text-neutral-500 font-light">{strengthText}</p>
                                </div>
                            )}
                        </Field>

                        <Field label="Confirm New Password">
                            <div className="relative">
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    value={pwForm.confirm}
                                    onChange={e => { setPwForm(f => ({ ...f, confirm: e.target.value })); setPwError(null) }}
                                    placeholder="Repeat new password"
                                    className={`admin-input pr-10 ${nextMismatch ? 'border-red-300 focus:border-red-400' : nextMatch ? 'border-emerald-300 focus:border-emerald-400' : ''}`}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(v => !v)}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                    tabIndex={-1}
                                >
                                    {showConfirm ? (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    )}
                                </button>
                            </div>
                            {nextMismatch && <p className="text-xs text-red-500 font-light mt-1">Passwords do not match.</p>}
                            {nextMatch && <p className="text-xs text-emerald-600 font-light mt-1">Passwords match.</p>}
                        </Field>

                        {pwError && (
                            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200">
                                <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
                                <p className="text-xs text-red-700 font-light">{pwError}</p>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={pwSaving}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-700 text-white text-sm font-light hover:bg-accent-800 transition-colors disabled:opacity-50"
                            >
                                {pwSaving && <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                                {pwSaving ? 'Saving…' : pwSaved ? '✓ Password Updated' : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style>{`.admin-input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #e5e5e5; font-size: 0.875rem; font-weight: 300; color: #1a1a1a; background: white; outline: none; } .admin-input:focus { border-color: #9a7865; }`}</style>
        </AdminLayout>
    )
}

'use client'

import React, { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { adminPageContent, adminDashboardStats, PageContentData } from '@/lib/admin/mockAdminData'

type ContentTab = 'homepage' | 'about' | 'commissions'

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
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 border-b border-neutral-100 pb-2 mb-4 font-light" style={{ fontWeight: 500 }}>{children}</p>
    )
}

export default function ContentPage() {
    const [tab, setTab] = useState<ContentTab>('homepage')
    const [content, setContent] = useState<PageContentData>(adminPageContent)
    const [saving, setSaving] = useState<ContentTab | null>(null)
    const [saved, setSaved] = useState<ContentTab | null>(null)
    const [error, setError] = useState<string | null>(null)

    async function handleSave(t: ContentTab) {
        setSaving(t)
        setError(null)
        try {
            const body = t === 'homepage'
                ? { content: content.homepage }
                : t === 'about'
                    ? { content: content.about }
                    : { content: content.commissions }
            const res = await fetch(`/api/admin/content/${t}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
            const data = await res.json()
            if (!data.success) { setError(data.error ?? 'An error occurred.'); setSaving(null); return }
            setSaving(null)
            setSaved(t)
            setTimeout(() => setSaved(null), 2500)
        } catch {
            setError('Network error. Please try again.')
            setSaving(null)
        }
    }

    const tabs: { id: ContentTab; label: string }[] = [
        { id: 'homepage', label: 'Homepage' },
        { id: 'about', label: 'About' },
        { id: 'commissions', label: 'Commissions' },
    ]

    return (
        <AdminLayout breadcrumb={[{ label: 'Page Content' }]} unreadCount={adminDashboardStats.unreadInquiryCount}>
            <div className="max-w-3xl space-y-6">
                <div>
                    <h1 className="text-2xl font-display text-neutral-900 tracking-tight" style={{ fontWeight: 500 }}>Page Content</h1>
                    <p className="text-sm text-neutral-500 font-light mt-0.5">Edit the text and content for each page.</p>
                </div>

                {error && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200">
                        <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
                        <p className="text-xs text-red-700 font-light">{error}</p>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-1 border-b border-neutral-200">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`px-4 py-2.5 text-sm font-light transition-colors relative ${tab === t.id ? 'text-accent-700' : 'text-neutral-500 hover:text-neutral-700'}`}
                        >
                            {t.label}
                            {tab === t.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-700" />}
                        </button>
                    ))}
                </div>

                {/* Homepage */}
                {tab === 'homepage' && (
                    <div className="bg-white border border-neutral-200 p-6 space-y-8">
                        <div className="space-y-4">
                            <SectionTitle>Hero</SectionTitle>
                            <Field label="Heading">
                                <input
                                    value={content.homepage.hero.heading}
                                    onChange={e => setContent(c => ({ ...c, homepage: { ...c.homepage, hero: { ...c.homepage.hero, heading: e.target.value } } }))}
                                    className="admin-input"
                                />
                            </Field>
                            <Field label="Subheading">
                                <textarea
                                    value={content.homepage.hero.subheading}
                                    onChange={e => setContent(c => ({ ...c, homepage: { ...c.homepage, hero: { ...c.homepage.hero, subheading: e.target.value } } }))}
                                    rows={3}
                                    className="admin-input resize-none"
                                />
                            </Field>
                        </div>

                        <div className="space-y-4">
                            <SectionTitle>Introduction</SectionTitle>
                            <Field label="Heading">
                                <input
                                    value={content.homepage.introduction.heading}
                                    onChange={e => setContent(c => ({ ...c, homepage: { ...c.homepage, introduction: { ...c.homepage.introduction, heading: e.target.value } } }))}
                                    className="admin-input"
                                />
                            </Field>
                            <Field label="Text">
                                <textarea
                                    value={content.homepage.introduction.text}
                                    onChange={e => setContent(c => ({ ...c, homepage: { ...c.homepage, introduction: { ...c.homepage.introduction, text: e.target.value } } }))}
                                    rows={4}
                                    className="admin-input resize-none"
                                />
                            </Field>
                        </div>

                        <div className="space-y-4">
                            <SectionTitle>Artist World</SectionTitle>
                            <Field label="Heading">
                                <input
                                    value={content.homepage.artistWorld.heading}
                                    onChange={e => setContent(c => ({ ...c, homepage: { ...c.homepage, artistWorld: { ...c.homepage.artistWorld, heading: e.target.value } } }))}
                                    className="admin-input"
                                />
                            </Field>
                            <Field label="Text / Quote">
                                <textarea
                                    value={content.homepage.artistWorld.text}
                                    onChange={e => setContent(c => ({ ...c, homepage: { ...c.homepage, artistWorld: { ...c.homepage.artistWorld, text: e.target.value } } }))}
                                    rows={3}
                                    className="admin-input resize-none"
                                />
                            </Field>
                        </div>

                        <div className="space-y-4">
                            <SectionTitle>Commission Invitation</SectionTitle>
                            <Field label="Heading">
                                <input
                                    value={content.homepage.commissionInvitation.heading}
                                    onChange={e => setContent(c => ({ ...c, homepage: { ...c.homepage, commissionInvitation: { ...c.homepage.commissionInvitation, heading: e.target.value } } }))}
                                    className="admin-input"
                                />
                            </Field>
                            <Field label="Text">
                                <textarea
                                    value={content.homepage.commissionInvitation.text}
                                    onChange={e => setContent(c => ({ ...c, homepage: { ...c.homepage, commissionInvitation: { ...c.homepage.commissionInvitation, text: e.target.value } } }))}
                                    rows={2}
                                    className="admin-input resize-none"
                                />
                            </Field>
                        </div>

                        <div className="space-y-4">
                            <SectionTitle>Contact Invitation</SectionTitle>
                            <Field label="Heading">
                                <input
                                    value={content.homepage.contactInvitation.heading}
                                    onChange={e => setContent(c => ({ ...c, homepage: { ...c.homepage, contactInvitation: { ...c.homepage.contactInvitation, heading: e.target.value } } }))}
                                    className="admin-input"
                                />
                            </Field>
                            <Field label="Text">
                                <textarea
                                    value={content.homepage.contactInvitation.text}
                                    onChange={e => setContent(c => ({ ...c, homepage: { ...c.homepage, contactInvitation: { ...c.homepage.contactInvitation, text: e.target.value } } }))}
                                    rows={2}
                                    className="admin-input resize-none"
                                />
                            </Field>
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={() => handleSave('homepage')}
                                disabled={saving === 'homepage'}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-700 text-white text-sm font-light hover:bg-accent-800 transition-colors disabled:opacity-50"
                            >
                                {saving === 'homepage' && <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                                {saving === 'homepage' ? 'Saving…' : saved === 'homepage' ? '✓ Saved' : 'Save Homepage'}
                            </button>
                        </div>
                    </div>
                )}

                {/* About */}
                {tab === 'about' && (
                    <div className="bg-white border border-neutral-200 p-6 space-y-8">
                        <div className="space-y-4">
                            <SectionTitle>Biography</SectionTitle>
                            <Field label="Biography Text">
                                <textarea
                                    value={content.about.biography.text}
                                    onChange={e => setContent(c => ({ ...c, about: { ...c.about, biography: { ...c.about.biography, text: e.target.value } } }))}
                                    rows={6}
                                    className="admin-input resize-none"
                                />
                            </Field>
                        </div>

                        <div className="space-y-4">
                            <SectionTitle>Philosophy</SectionTitle>
                            <Field label="Heading">
                                <input
                                    value={content.about.philosophy.heading}
                                    onChange={e => setContent(c => ({ ...c, about: { ...c.about, philosophy: { ...c.about.philosophy, heading: e.target.value } } }))}
                                    className="admin-input"
                                />
                            </Field>
                            <Field label="Text">
                                <textarea
                                    value={content.about.philosophy.text}
                                    onChange={e => setContent(c => ({ ...c, about: { ...c.about, philosophy: { ...c.about.philosophy, text: e.target.value } } }))}
                                    rows={4}
                                    className="admin-input resize-none"
                                />
                            </Field>
                        </div>

                        <div className="space-y-4">
                            <SectionTitle>Studio</SectionTitle>
                            <Field label="Heading">
                                <input
                                    value={content.about.studio.heading}
                                    onChange={e => setContent(c => ({ ...c, about: { ...c.about, studio: { ...c.about.studio, heading: e.target.value } } }))}
                                    className="admin-input"
                                />
                            </Field>
                            <Field label="Text">
                                <textarea
                                    value={content.about.studio.text}
                                    onChange={e => setContent(c => ({ ...c, about: { ...c.about, studio: { ...c.about.studio, text: e.target.value } } }))}
                                    rows={4}
                                    className="admin-input resize-none"
                                />
                            </Field>
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={() => handleSave('about')}
                                disabled={saving === 'about'}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-700 text-white text-sm font-light hover:bg-accent-800 transition-colors disabled:opacity-50"
                            >
                                {saving === 'about' && <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                                {saving === 'about' ? 'Saving…' : saved === 'about' ? '✓ Saved' : 'Save About'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Commissions */}
                {tab === 'commissions' && (
                    <div className="bg-white border border-neutral-200 p-6 space-y-8">
                        <div className="space-y-4">
                            <SectionTitle>Process</SectionTitle>
                            <Field label="Section Heading">
                                <input
                                    value={content.commissions.process.heading}
                                    onChange={e => setContent(c => ({ ...c, commissions: { ...c.commissions, process: { ...c.commissions.process, heading: e.target.value } } }))}
                                    className="admin-input"
                                />
                            </Field>
                            <div className="space-y-3">
                                {content.commissions.process.steps.map((step, idx) => (
                                    <div key={idx} className="border border-neutral-100 p-4 space-y-2">
                                        <p className="text-xs text-neutral-400 font-light" style={{ fontWeight: 500 }}>Step {idx + 1}</p>
                                        <Field label="Title">
                                            <input
                                                value={step.title}
                                                onChange={e => setContent(c => {
                                                    const steps = c.commissions.process.steps.map((s, i) => i === idx ? { ...s, title: e.target.value } : s)
                                                    return { ...c, commissions: { ...c.commissions, process: { ...c.commissions.process, steps } } }
                                                })}
                                                className="admin-input"
                                            />
                                        </Field>
                                        <Field label="Description">
                                            <input
                                                value={step.description}
                                                onChange={e => setContent(c => {
                                                    const steps = c.commissions.process.steps.map((s, i) => i === idx ? { ...s, description: e.target.value } : s)
                                                    return { ...c, commissions: { ...c.commissions, process: { ...c.commissions.process, steps } } }
                                                })}
                                                className="admin-input"
                                            />
                                        </Field>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <SectionTitle>Invitation</SectionTitle>
                            <Field label="Heading">
                                <input
                                    value={content.commissions.invitation.heading}
                                    onChange={e => setContent(c => ({ ...c, commissions: { ...c.commissions, invitation: { ...c.commissions.invitation, heading: e.target.value } } }))}
                                    className="admin-input"
                                />
                            </Field>
                            <Field label="Text">
                                <textarea
                                    value={content.commissions.invitation.text}
                                    onChange={e => setContent(c => ({ ...c, commissions: { ...c.commissions, invitation: { ...c.commissions.invitation, text: e.target.value } } }))}
                                    rows={2}
                                    className="admin-input resize-none"
                                />
                            </Field>
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={() => handleSave('commissions')}
                                disabled={saving === 'commissions'}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-700 text-white text-sm font-light hover:bg-accent-800 transition-colors disabled:opacity-50"
                            >
                                {saving === 'commissions' && <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                                {saving === 'commissions' ? 'Saving…' : saved === 'commissions' ? '✓ Saved' : 'Save Commissions'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`.admin-input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #e5e5e5; font-size: 0.875rem; font-weight: 300; color: #1a1a1a; background: white; outline: none; } .admin-input:focus { border-color: #9a7865; }`}</style>
        </AdminLayout>
    )
}

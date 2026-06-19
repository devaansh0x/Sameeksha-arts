'use client'

import React, { useState } from 'react'

interface FormData {
    name: string
    email: string
    subject: string
    message: string
    honeypot: string
}

interface FormState {
    status: 'idle' | 'submitting' | 'success' | 'error'
    message: string
}

export default function ContactForm() {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        subject: '',
        message: '',
        honeypot: '',
    })

    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
    const [formState, setFormState] = useState<FormState>({ status: 'idle', message: '' })

    function validate(): boolean {
        const newErrors: Partial<Record<keyof FormData, string>> = {}
        if (!formData.name.trim() || formData.name.trim().length < 2)
            newErrors.name = 'Please enter your name (at least 2 characters).'
        if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
            newErrors.email = 'Please enter a valid email address.'
        if (!formData.subject.trim() || formData.subject.trim().length < 3)
            newErrors.subject = 'Please enter a subject (at least 3 characters).'
        if (!formData.message.trim() || formData.message.trim().length < 10)
            newErrors.message = 'Please write a message (at least 10 characters).'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!validate()) return

        setFormState({ status: 'submitting', message: '' })

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    subject: formData.subject,
                    message: formData.message,
                    honeypot: formData.honeypot,
                }),
            })

            const data = await response.json()

            if (data.success) {
                setFormState({
                    status: 'success',
                    message: data.message || 'Your message has been sent. We will get back to you soon.',
                })
                setFormData({ name: '', email: '', subject: '', message: '', honeypot: '' })
                setErrors({})
            } else {
                // Field-level errors from server
                if (data.errors) {
                    setErrors(data.errors)
                }
                setFormState({
                    status: 'error',
                    message: data.message || 'Something went wrong. Please try again.',
                })
            }
        } catch {
            setFormState({
                status: 'error',
                message: 'Could not send your message. Please check your connection and try again.',
            })
        }
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        // Clear error on change
        if (errors[name as keyof FormData]) {
            setErrors(prev => ({ ...prev, [name]: undefined }))
        }
    }

    if (formState.status === 'success') {
        return (
            <div className="text-center py-16 px-8 bg-primary-50 border border-primary-200">
                <div className="text-5xl mb-6">✓</div>
                <h3 className="text-2xl font-display font-semibold text-neutral-900 mb-4">
                    Message Sent
                </h3>
                <p className="text-neutral-700 font-light leading-relaxed mb-8 max-w-md mx-auto">
                    {formState.message}
                </p>
                <button
                    onClick={() => setFormState({ status: 'idle', message: '' })}
                    className="text-accent-700 hover:text-accent-800 font-medium underline underline-offset-4 text-sm"
                >
                    Send another message
                </button>
            </div>
        )
    }

    const isSubmitting = formState.status === 'submitting'

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Honeypot — hidden from real users */}
            <div className="hidden" aria-hidden="true">
                <label htmlFor="honeypot">Leave this blank</label>
                <input
                    id="honeypot"
                    name="honeypot"
                    type="text"
                    value={formData.honeypot}
                    onChange={handleChange}
                    tabIndex={-1}
                    autoComplete="off"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                        Your Name <span className="text-accent-600">*</span>
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        placeholder="Your full name"
                        className={`w-full px-4 py-3 border font-light text-neutral-900 placeholder-neutral-400 bg-white focus:outline-none focus:ring-1 focus:ring-accent-500 transition-colors disabled:opacity-60 ${errors.name ? 'border-red-400 bg-red-50' : 'border-primary-200 focus:border-accent-500'}`}
                    />
                    {errors.name && (
                        <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>
                    )}
                </div>

                {/* Email */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                        Email Address <span className="text-accent-600">*</span>
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        placeholder="you@example.com"
                        className={`w-full px-4 py-3 border font-light text-neutral-900 placeholder-neutral-400 bg-white focus:outline-none focus:ring-1 focus:ring-accent-500 transition-colors disabled:opacity-60 ${errors.email ? 'border-red-400 bg-red-50' : 'border-primary-200 focus:border-accent-500'}`}
                    />
                    {errors.email && (
                        <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>
                    )}
                </div>
            </div>

            {/* Subject */}
            <div>
                <label htmlFor="subject" className="block text-sm font-medium text-neutral-700 mb-2">
                    Subject <span className="text-accent-600">*</span>
                </label>
                <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 border font-light text-neutral-900 bg-white focus:outline-none focus:ring-1 focus:ring-accent-500 transition-colors disabled:opacity-60 appearance-none ${errors.subject ? 'border-red-400 bg-red-50' : 'border-primary-200 focus:border-accent-500'}`}
                >
                    <option value="">Select a subject…</option>
                    <option value="Commission inquiry">Commission inquiry</option>
                    <option value="Artwork purchase">Artwork purchase</option>
                    <option value="General question">General question</option>
                    <option value="Press or collaboration">Press or collaboration</option>
                    <option value="Other">Other</option>
                </select>
                {errors.subject && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.subject}</p>
                )}
            </div>

            {/* Message */}
            <div>
                <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-2">
                    Message <span className="text-accent-600">*</span>
                </label>
                <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    placeholder="Tell me what you have in mind…"
                    className={`w-full px-4 py-3 border font-light text-neutral-900 placeholder-neutral-400 bg-white focus:outline-none focus:ring-1 focus:ring-accent-500 transition-colors resize-none disabled:opacity-60 ${errors.message ? 'border-red-400 bg-red-50' : 'border-primary-200 focus:border-accent-500'}`}
                />
                {errors.message && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.message}</p>
                )}
            </div>

            {/* Server error */}
            {formState.status === 'error' && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
                    {formState.message}
                </div>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-4 bg-accent-700 text-white font-medium tracking-wide hover:bg-accent-800 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-700/20"
            >
                {isSubmitting ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Sending…
                    </>
                ) : (
                    'Send Message'
                )}
            </button>
        </form>
    )
}

/**
 * Admin mock data — mirrors the API response shapes exactly.
 * Swap these with real API calls when the DB is connected.
 */

import { mockArtworks, mockCollections, mockRecognition, mockTestimonials, artSwatch } from '@/lib/utils/mockData'

// ─── Re-export public mock data with admin-compatible shapes ─────────────────

export type AdminArtwork = {
    id: string
    title: string
    slug: string
    medium: string
    dimensions: string
    year: number
    availabilityStatus: 'AVAILABLE' | 'SOLD' | 'ON_COMMISSION' | 'NOT_FOR_SALE'
    published: boolean
    collectionId: string | null
    collection: { id: string; name: string; slug: string } | null
    thumbnailUrl: string
    tags: string[]
    createdAt: string
    updatedAt: string
}

export type AdminCollection = {
    id: string
    name: string
    slug: string
    description: string
    artworkCount: number
    createdAt: string
    updatedAt: string
}

export type AdminInquiry = {
    id: string
    name: string
    email: string
    subject: string
    message: string
    status: 'UNREAD' | 'READ' | 'ARCHIVED'
    createdAt: string
    updatedAt: string
}

export type AdminRecognition = {
    id: string
    title: string
    type: 'AWARD' | 'EXHIBITION' | 'INSTITUTIONAL_COLLABORATION' | 'PRESS'
    date: string
    description: string
    published: boolean
    createdAt: string
    updatedAt: string
}

export type AdminTestimonial = {
    id: string
    clientName: string
    clientTitle: string | null
    text: string
    order: number
    published: boolean
    createdAt: string
    updatedAt: string
}

export type AdminMediaAsset = {
    id: string
    filename: string
    thumbnailUrl: string
    originalUrl: string
    width: number
    height: number
    size: number
    mimeType: string
    uploadedAt: string
    usedInArtworks: number
}

export type PageContentData = {
    homepage: {
        hero: { heading: string; subheading: string; artworkId: string | null }
        introduction: { heading: string; text: string }
        selectedWorks: { artworkIds: string[] }
        artistWorld: { heading: string; text: string; imageUrl: string | null }
        commissionInvitation: { heading: string; text: string }
        contactInvitation: { heading: string; text: string }
    }
    about: {
        biography: { text: string; portraitUrl: string | null }
        philosophy: { heading: string; text: string }
        studio: { heading: string; text: string; imageUrl: string | null }
    }
    commissions: {
        process: { heading: string; steps: { title: string; description: string }[] }
        examples: { artworkIds: string[] }
        stories: { id: string; title: string; text: string }[]
        invitation: { heading: string; text: string }
    }
}

// ─── Convert public mock artworks to admin shape ──────────────────────────────

const statusMap: Record<string, AdminArtwork['availabilityStatus']> = {
    available:     'AVAILABLE',
    sold:          'SOLD',
    on_commission: 'ON_COMMISSION',
    not_for_sale:  'NOT_FOR_SALE',
}

export const adminArtworks: AdminArtwork[] = mockArtworks.map((a, i) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    medium: a.medium,
    dimensions: a.dimensions,
    year: a.year,
    availabilityStatus: statusMap[a.availabilityStatus],
    published: true,
    collectionId: a.collectionId,
    collection: { id: a.collection.id, name: a.collection.name, slug: a.collection.slug },
    thumbnailUrl: artSwatch(i),
    tags: a.tags,
    createdAt: a.createdAt,
    updatedAt: a.createdAt,
}))

export const adminCollections: AdminCollection[] = mockCollections.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    artworkCount: mockArtworks.filter(a => a.collectionId === c.id).length,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
}))

export const adminInquiries: AdminInquiry[] = [
    { id: '1', name: 'Priya Sharma',   email: 'priya@example.com',   subject: 'Commission inquiry',  message: 'I would love to commission a portrait of my mother for her 70th birthday. Could we discuss the process?', status: 'UNREAD',    createdAt: '2024-06-15T09:30:00Z', updatedAt: '2024-06-15T09:30:00Z' },
    { id: '2', name: 'Rahul Mehra',    email: 'rahul@example.com',   subject: 'Artwork purchase',    message: 'I am interested in the Ganga at Varanasi painting. Is it still available and what is the price?',         status: 'UNREAD',    createdAt: '2024-06-14T14:20:00Z', updatedAt: '2024-06-14T14:20:00Z' },
    { id: '3', name: 'Anita Gupta',    email: 'anita@example.com',   subject: 'General question',    message: 'Do you ship internationally? I am based in London and would love to add a Madhubani piece to my collection.', status: 'READ',   createdAt: '2024-06-12T11:45:00Z', updatedAt: '2024-06-13T08:00:00Z' },
    { id: '4', name: 'Vikram Joshi',   email: 'vikram@example.com',  subject: 'Commission inquiry',  message: 'We are renovating our office lobby and looking for a large-format institutional piece. Can we meet?',       status: 'READ',      createdAt: '2024-06-10T16:00:00Z', updatedAt: '2024-06-11T09:00:00Z' },
    { id: '5', name: 'Sunita Reddy',   email: 'sunita@example.com',  subject: 'Press or collaboration', message: 'I write for an art magazine and would love to feature your work in our upcoming issue on contemporary Indian artists.', status: 'ARCHIVED', createdAt: '2024-06-05T10:00:00Z', updatedAt: '2024-06-06T09:00:00Z' },
    { id: '6', name: 'Arjun Kapoor',   email: 'arjun@example.com',   subject: 'Commission inquiry',  message: 'My wedding is in December and I would love a painting of our special day. What would be involved?',        status: 'UNREAD',    createdAt: '2024-06-18T08:15:00Z', updatedAt: '2024-06-18T08:15:00Z' },
]

export const adminRecognition: AdminRecognition[] = mockRecognition.map((r, i) => ({
    id: r.id,
    title: r.title,
    type: r.type.toUpperCase() as AdminRecognition['type'],
    date: r.date,
    description: r.description,
    published: true,
    createdAt: r.date,
    updatedAt: r.date,
}))

export const adminTestimonials: AdminTestimonial[] = mockTestimonials.map((t, i) => ({
    id: t.id,
    clientName: t.clientName,
    clientTitle: t.clientTitle ?? null,
    text: t.text,
    order: i + 1,
    published: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
}))

export const adminMediaAssets: AdminMediaAsset[] = Array.from({ length: 12 }, (_, i) => ({
    id: String(i + 1),
    filename: `artwork-${i + 1}.jpg`,
    thumbnailUrl: artSwatch(i),
    originalUrl: artSwatch(i),
    width: 1200,
    height: 900,
    size: Math.floor(Math.random() * 3000000) + 500000,
    mimeType: 'image/jpeg',
    uploadedAt: `2024-0${Math.floor(i / 4) + 1}-${String((i % 28) + 1).padStart(2, '0')}`,
    usedInArtworks: i < 6 ? 1 : 0,
}))

export const adminPageContent: PageContentData = {
    homepage: {
        hero: {
            heading: 'Where pigment remembers what words forget',
            subheading: 'A Delhi studio where Madhubani lineage meets the slow patience of oil — each canvas a quiet conversation between the sitter, the season, and the light that holds them.',
            artworkId: '1',
        },
        introduction: {
            heading: 'The Hand Behind the Work',
            text: '[Artist introduction to be added]',
        },
        selectedWorks: { artworkIds: ['1', '2', '3', '4', '5', '6'] },
        artistWorld: {
            heading: 'The Way of Working',
            text: '"A painting begins long before the brush — in listening: to the sitter, to the silence, to the hour the light keeps changing its mind."',
            imageUrl: null,
        },
        commissionInvitation: {
            heading: 'Have a Painting Made',
            text: 'A canvas grown from your story — beginning, as always, with a conversation.',
        },
        contactInvitation: {
            heading: 'A single, unhurried conversation',
            text: 'Drawn to a piece, dreaming of a commission, or simply curious — the door is open.',
        },
    },
    about: {
        biography: {
            text: '[Artist biography to be added]',
            portraitUrl: null,
        },
        philosophy: {
            heading: 'What I Believe About Making Art',
            text: '[Artist philosophy to be added]',
        },
        studio: {
            heading: 'Where the Work Comes to Life',
            text: '[Studio description to be added]',
            imageUrl: null,
        },
    },
    commissions: {
        process: {
            heading: 'How We\'ll Work Together',
            steps: [
                { title: 'The Conversation', description: 'Every commission begins with listening.' },
                { title: 'Concept & Sketches', description: 'Composition, scale, palette — explored before paint is laid.' },
                { title: 'The Painting', description: 'The slow work, with progress updates throughout.' },
                { title: 'Delivery', description: 'Finished, dry, and delivered with care.' },
            ],
        },
        examples: { artworkIds: ['1', '2', '3'] },
        stories: [],
        invitation: {
            heading: 'The first step is simply to reach out',
            text: 'No obligation. Just a conversation about what you have in mind.',
        },
    },
}

// ─── Dashboard stats ──────────────────────────────────────────────────────────

export const adminDashboardStats = {
    artworkCount: adminArtworks.length,
    collectionCount: adminCollections.length,
    recognitionCount: adminRecognition.length,
    unreadInquiryCount: adminInquiries.filter(i => i.status === 'UNREAD').length,
    artworksByStatus: {
        AVAILABLE:     adminArtworks.filter(a => a.availabilityStatus === 'AVAILABLE').length,
        SOLD:          adminArtworks.filter(a => a.availabilityStatus === 'SOLD').length,
        ON_COMMISSION: adminArtworks.filter(a => a.availabilityStatus === 'ON_COMMISSION').length,
        NOT_FOR_SALE:  adminArtworks.filter(a => a.availabilityStatus === 'NOT_FOR_SALE').length,
    },
    recentInquiries: adminInquiries.slice(0, 5),
}

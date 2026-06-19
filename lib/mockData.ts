/**
 * Mock data for development and showcase.
 * Replace with real data from the database in production.
 */

export interface Image {
    url: string
    alt: string
    width: number
    height: number
    isPrimary?: boolean
}

export interface Artwork {
    id: string
    title: string
    slug: string
    description: string
    story: string
    medium: string
    dimensions: string
    year: number
    availabilityStatus: 'available' | 'sold' | 'on_commission' | 'not_for_sale'
    collectionId?: string
    images: Image[]
    colorPalette?: {
        from: string
        to: string
        direction?: string
    }
}

export interface Collection {
    id: string
    name: string
    slug: string
    description: string
}

export interface Recognition {
    id: string
    title: string
    type: 'award' | 'exhibition' | 'institutional_collaboration' | 'press'
    date: string
    description: string
}

export interface Testimonial {
    id: string
    clientName: string
    clientTitle?: string
    text: string
}

// Portrait swatch placeholder
export const portraitSwatch = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=700&fit=crop'

// Mock Collections
export const mockCollections: Collection[] = [
    {
        id: 'collection-1',
        name: 'Portraits',
        slug: 'portraits',
        description: 'A study of faces and the stories they hold',
    },
    {
        id: 'collection-2',
        name: 'Madhubani Dreams',
        slug: 'madhubani-dreams',
        description: 'Exploring traditional Indian forms in contemporary contexts',
    },
    {
        id: 'collection-3',
        name: 'Landscapes',
        slug: 'landscapes',
        description: 'The conversation between earth, light, and memory',
    },
    {
        id: 'collection-4',
        name: 'Spiritual Works',
        slug: 'spiritual-works',
        description: 'Sacred subjects and quiet meditations',
    },
]

// Mock Artworks
export const mockArtworks: Artwork[] = [
    {
        id: 'artwork-1',
        title: 'Where the Ganga meets the sky',
        slug: 'where-the-ganga-meets-the-sky',
        description: 'A meditation on water, light, and the sacred geography of place.',
        story: 'This piece began during a dawn walk along the riverbank. The interplay of mist and morning light spoke of timelessness and change happening simultaneously.',
        medium: 'Oil on canvas',
        dimensions: '36 × 48 in',
        year: 2024,
        availabilityStatus: 'available',
        collectionId: 'collection-3',
        images: [
            {
                url: 'https://images.unsplash.com/photo-1578321272176-36250aaf5504?w=1200&h=1500&fit=crop',
                alt: 'Where the Ganga meets the sky',
                width: 1200,
                height: 1500,
                isPrimary: true,
            },
        ],
        colorPalette: {
            from: '#e8d5c4',
            to: '#8b7d6b',
            direction: 'to right',
        },
    },
    {
        id: 'artwork-2',
        title: 'Quiet Resolve',
        slug: 'quiet-resolve',
        description: 'A portrait study in warm ochres and deep shadows. The subject — an unnamed village elder — sits with a stillness that speaks of decades of quiet dignity.',
        story: 'This piece began as a quick sketch during a visit to rural Rajasthan. The elder\'s face held such depth that the sketch became a full painting over the following weeks. The interplay of direct sunlight and interior shadow became the central tension of the work.',
        medium: 'Oil on canvas',
        dimensions: '60 × 80 cm',
        year: 2023,
        availabilityStatus: 'sold',
        collectionId: 'collection-1',
        images: [
            {
                url: 'https://images.unsplash.com/photo-1578321272176-36250aaf5504?w=800&h=1000&fit=crop',
                alt: 'Quiet Resolve portrait',
                width: 800,
                height: 1000,
                isPrimary: true,
            },
        ],
        colorPalette: {
            from: '#c19856',
            to: '#3d2817',
            direction: 'to bottom right',
        },
    },
    {
        id: 'artwork-3',
        title: 'Devotion in Line',
        slug: 'devotion-in-line',
        description: 'A contemporary interpretation of traditional Madhubani patterns, bringing ancient symbols into dialogue with modern sensibility.',
        story: 'Drawing on my family\'s heritage in Madhubani painting, I spent weeks studying the traditional line-work before reimagining it in oil. Each curve carries the memory of generations.',
        medium: 'Oil and ink on canvas',
        dimensions: '48 × 48 in',
        year: 2024,
        availabilityStatus: 'available',
        collectionId: 'collection-2',
        images: [
            {
                url: 'https://images.unsplash.com/photo-1577720643272-265fd3270b51?w=1000&h=1000&fit=crop',
                alt: 'Devotion in Line',
                width: 1000,
                height: 1000,
                isPrimary: true,
            },
        ],
        colorPalette: {
            from: '#f4e4d7',
            to: '#d4a574',
            direction: 'to right',
        },
    },
    {
        id: 'artwork-4',
        title: 'Threshold',
        slug: 'threshold',
        description: 'An exploration of liminal spaces — the moments between states, neither here nor there.',
        story: 'Inspired by architectural moments I discovered while traveling, this piece captures the feeling of standing at a doorway, suspended between two worlds.',
        medium: 'Oil on canvas',
        dimensions: '42 × 56 in',
        year: 2023,
        availabilityStatus: 'on_commission',
        collectionId: 'collection-4',
        images: [
            {
                url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1000&h=1300&fit=crop',
                alt: 'Threshold',
                width: 1000,
                height: 1300,
                isPrimary: true,
            },
        ],
        colorPalette: {
            from: '#a8c5d8',
            to: '#5a7a8f',
            direction: 'to bottom',
        },
    },
    {
        id: 'artwork-5',
        title: 'Evening Raga',
        slug: 'evening-raga',
        description: 'A visual sonnet inspired by classical Indian music — color as sound, movement as silence.',
        story: 'Created over several sessions of listening to late evening ragas, this work attempts to translate the emotional arc of Yaman into paint.',
        medium: 'Oil on linen',
        dimensions: '54 × 72 in',
        year: 2024,
        availabilityStatus: 'not_for_sale',
        collectionId: 'collection-4',
        images: [
            {
                url: 'https://images.unsplash.com/photo-1578926078328-123456789012?w=1200&h=1600&fit=crop',
                alt: 'Evening Raga',
                width: 1200,
                height: 1600,
                isPrimary: true,
            },
        ],
        colorPalette: {
            from: '#9b6b47',
            to: '#2d1810',
            direction: 'to bottom right',
        },
    },
    {
        id: 'artwork-6',
        title: 'The Listeners',
        slug: 'the-listeners',
        description: 'Three figures in a moment of shared attention — rendered in muted greens and earth tones.',
        story: 'A companion piece to earlier work, exploring how presence can be felt even in stillness. The title references a poem by Walter de la Mare that has haunted me for years.',
        medium: 'Oil on canvas',
        dimensions: '48 × 60 in',
        year: 2023,
        availabilityStatus: 'available',
        collectionId: 'collection-1',
        images: [
            {
                url: 'https://images.unsplash.com/photo-1578321272176-36250aaf5504?w=900&h=1125&fit=crop',
                alt: 'The Listeners',
                width: 900,
                height: 1125,
                isPrimary: true,
            },
        ],
        colorPalette: {
            from: '#8a9b6f',
            to: '#3d4a2a',
            direction: 'to right',
        },
    },
]

// Mock Recognition Entries
export const mockRecognition: Recognition[] = [
    {
        id: 'rec-1',
        title: 'National Contemporary Art Award',
        type: 'award',
        date: '2023-11-15',
        description: 'Recognized for excellence in figurative painting and cultural synthesis',
    },
    {
        id: 'rec-2',
        title: 'Kiran Nadar Museum Exhibition',
        type: 'exhibition',
        date: '2023-09-01',
        description: 'Solo exhibition titled "Conversations with Light" — 24 works spanning three years',
    },
    {
        id: 'rec-3',
        title: 'Commonwealth Arts Fellowship',
        type: 'institutional_collaboration',
        date: '2023-06-10',
        description: 'Selected as one of 12 emerging artists for a year-long residency and mentorship program',
    },
    {
        id: 'rec-4',
        title: 'Feature in Art India Quarterly',
        type: 'press',
        date: '2023-04-20',
        description: 'Cover story and 8-page feature exploring the intersection of heritage and contemporary practice',
    },
    {
        id: 'rec-5',
        title: 'Delhi Art Biennial',
        type: 'exhibition',
        date: '2023-02-01',
        description: 'Participating artist in the inaugural biennial, represented in group exhibition across five venues',
    },
    {
        id: 'rec-6',
        title: 'Lalit Kala Akademi Artist Grant',
        type: 'award',
        date: '2022-11-30',
        description: 'Annual grant for artistic research and development of new bodies of work',
    },
    {
        id: 'rec-7',
        title: 'International Art Fair Booth Feature',
        type: 'institutional_collaboration',
        date: '2022-10-15',
        description: 'Featured in IARTF 2022, Mumbai — represented by Vivan Gallery',
    },
    {
        id: 'rec-8',
        title: 'BBC Arts Profile',
        type: 'press',
        date: '2022-07-12',
        description: 'Profiled in BBC\'s "Artists to Watch" series, with video documentation of studio practice',
    },
]

// Mock Testimonials
export const mockTestimonials: Testimonial[] = [
    {
        id: 'test-1',
        clientName: 'Priya Sharma',
        clientTitle: 'Collector & Patron',
        text: 'The paintings in my home have become part of the rhythm of my days. Each time I look at them, they reveal something new — a shift in how the light lands, a detail I missed before. That\'s the mark of true artistry.',
    },
    {
        id: 'test-2',
        clientName: 'Rajesh Kapoor',
        clientTitle: 'Museum Director',
        text: 'Sameeksha\'s work bridges the ancient and the contemporary with such grace. Her pieces don\'t merely decorate a wall — they ask questions and invite contemplation.',
    },
    {
        id: 'test-3',
        clientName: 'Anjali Mehta',
        clientTitle: 'Commission Client',
        text: 'Working with Sameeksha on a commission was a journey, not a transaction. She listened deeply, asked the right questions, and created something far more meaningful than I had imagined. The portrait hangs in my living room as a reminder of that generosity of spirit.',
    },
    {
        id: 'test-4',
        clientName: 'Dr. Vikram Singh',
        clientTitle: 'Art Historian',
        text: 'Her work is a quiet rebellion — maintaining the integrity of traditional forms while speaking to contemporary anxieties. In an age of loud aesthetics, this restraint is radical.',
    },
]

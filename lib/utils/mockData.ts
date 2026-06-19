// Mock data for frontend prototypes
// This will be replaced with actual database queries later

/**
 * Generates an elegant abstract colour-field as an inline SVG data URI —
 * used in place of real artwork photography during the prototype phase.
 * Two soft gradient washes plus a couple of faint orbs give each "canvas"
 * a painterly, gallery-toned feel rather than a flat block.
 */
function swatch(from: string, to: string, orb: string): string {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='900'>
<defs>
<linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
<stop offset='0' stop-color='${from}'/>
<stop offset='1' stop-color='${to}'/>
</linearGradient>
<radialGradient id='o' cx='50%' cy='50%' r='50%'>
<stop offset='0' stop-color='${orb}' stop-opacity='0.55'/>
<stop offset='1' stop-color='${orb}' stop-opacity='0'/>
</radialGradient>
</defs>
<rect width='1200' height='900' fill='url(#g)'/>
<ellipse cx='340' cy='300' rx='460' ry='420' fill='url(#o)'/>
<ellipse cx='950' cy='720' rx='380' ry='340' fill='url(#o)' opacity='0.7'/>
</svg>`
    return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

// A curated set of warm, muted, museum-toned palettes — one per artwork.
const palettes: Array<[string, string, string]> = [
    ['#9a7865', '#e7c4b2', '#6a5245'], // terracotta
    ['#7e8ba3', '#c3cad8', '#4f5d75'], // dusty blue
    ['#8a9a7b', '#d3dcc7', '#5f6f4e'], // sage
    ['#8b6f86', '#d0bccb', '#5e4a5a'], // plum
    ['#c2a05c', '#ecdcae', '#917238'], // ochre
    ['#6a5245', '#a89d8a', '#3f342c'], // clay
]

export const artSwatch = (i: number) => {
    const [from, to, orb] = palettes[i % palettes.length]
    return swatch(from, to, orb)
}

// Soft portrait/studio fields (no text, just tone)
export const portraitSwatch = swatch('#cdbfae', '#ebe4d8', '#9a7865')
export const studioSwatch = swatch('#b3a892', '#e4ddcd', '#8d826f')

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
    collectionId: string
    collection: Collection
    images: ArtworkImage[]
    createdAt: string
}

export interface ArtworkImage {
    id: string
    url: string
    thumbnailUrl: string
    alt: string
    width: number
    height: number
    isPrimary: boolean
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

// Mock Collections
export const mockCollections: Collection[] = [
    {
        id: '1',
        name: 'Portraits',
        slug: 'portraits',
        description: 'Capturing the essence and personality of individuals through expressive portraiture.',
    },
    {
        id: '2',
        name: 'Landscapes',
        slug: 'landscapes',
        description: 'Natural scenes that evoke tranquility and connection with the environment.',
    },
    {
        id: '3',
        name: 'Madhubani',
        slug: 'madhubani',
        description: 'Traditional Indian folk art with intricate patterns and vibrant colors.',
    },
    {
        id: '4',
        name: 'Spiritual Works',
        slug: 'spiritual-works',
        description: 'Art inspired by spirituality, meditation, and inner reflection.',
    },
]

// Mock Artworks
export const mockArtworks: Artwork[] = [
    {
        id: '1',
        title: '[Artwork Title 1]',
        slug: 'artwork-1',
        description: '[Artwork description will be added by the artist]',
        story: '[The story behind this artwork will be shared by the artist]',
        medium: 'Oil on canvas',
        dimensions: '24 x 36 inches',
        year: 2024,
        availabilityStatus: 'available',
        collectionId: '1',
        collection: mockCollections[0],
        images: [
            {
                id: '1',
                url: artSwatch(0),
                thumbnailUrl: artSwatch(0),
                alt: '[Artwork Title 1]',
                width: 1200,
                height: 900,
                isPrimary: true,
            },
        ],
        createdAt: '2024-01-15',
    },
    {
        id: '2',
        title: '[Artwork Title 2]',
        slug: 'artwork-2',
        description: '[Artwork description will be added by the artist]',
        story: '[The story behind this artwork will be shared by the artist]',
        medium: 'Acrylic on canvas',
        dimensions: '30 x 40 inches',
        year: 2024,
        availabilityStatus: 'available',
        collectionId: '2',
        collection: mockCollections[1],
        images: [
            {
                id: '2',
                url: artSwatch(1),
                thumbnailUrl: artSwatch(1),
                alt: '[Artwork Title 2]',
                width: 1200,
                height: 900,
                isPrimary: true,
            },
        ],
        createdAt: '2024-02-01',
    },
    {
        id: '3',
        title: '[Artwork Title 3]',
        slug: 'artwork-3',
        description: '[Artwork description will be added by the artist]',
        story: '[The story behind this artwork will be shared by the artist]',
        medium: 'Watercolor on paper',
        dimensions: '18 x 24 inches',
        year: 2023,
        availabilityStatus: 'sold',
        collectionId: '3',
        collection: mockCollections[2],
        images: [
            {
                id: '3',
                url: artSwatch(2),
                thumbnailUrl: artSwatch(2),
                alt: '[Artwork Title 3]',
                width: 1200,
                height: 900,
                isPrimary: true,
            },
        ],
        createdAt: '2023-11-20',
    },
    {
        id: '4',
        title: '[Artwork Title 4]',
        slug: 'artwork-4',
        description: '[Artwork description will be added by the artist]',
        story: '[The story behind this artwork will be shared by the artist]',
        medium: 'Mixed media',
        dimensions: '36 x 48 inches',
        year: 2024,
        availabilityStatus: 'available',
        collectionId: '4',
        collection: mockCollections[3],
        images: [
            {
                id: '4',
                url: artSwatch(3),
                thumbnailUrl: artSwatch(3),
                alt: '[Artwork Title 4]',
                width: 1200,
                height: 900,
                isPrimary: true,
            },
        ],
        createdAt: '2024-03-10',
    },
    {
        id: '5',
        title: '[Artwork Title 5]',
        slug: 'artwork-5',
        description: '[Artwork description will be added by the artist]',
        story: '[The story behind this artwork will be shared by the artist]',
        medium: 'Oil on canvas',
        dimensions: '20 x 30 inches',
        year: 2024,
        availabilityStatus: 'available',
        collectionId: '1',
        collection: mockCollections[0],
        images: [
            {
                id: '5',
                url: artSwatch(4),
                thumbnailUrl: artSwatch(4),
                alt: '[Artwork Title 5]',
                width: 1200,
                height: 900,
                isPrimary: true,
            },
        ],
        createdAt: '2024-04-05',
    },
    {
        id: '6',
        title: '[Artwork Title 6]',
        slug: 'artwork-6',
        description: '[Artwork description will be added by the artist]',
        story: '[The story behind this artwork will be shared by the artist]',
        medium: 'Acrylic on canvas',
        dimensions: '24 x 36 inches',
        year: 2023,
        availabilityStatus: 'available',
        collectionId: '2',
        collection: mockCollections[1],
        images: [
            {
                id: '6',
                url: artSwatch(5),
                thumbnailUrl: artSwatch(5),
                alt: '[Artwork Title 6]',
                width: 1200,
                height: 900,
                isPrimary: true,
            },
        ],
        createdAt: '2023-12-15',
    },
]

// Mock Recognition
export const mockRecognition: Recognition[] = [
    {
        id: '1',
        title: '[Award Title 1]',
        type: 'award',
        date: '2024-01-01',
        description: '[Award details will be added by the artist]',
    },
    {
        id: '2',
        title: '[Exhibition Name 1]',
        type: 'exhibition',
        date: '2023-11-01',
        description: '[Exhibition details will be added by the artist]',
    },
    {
        id: '3',
        title: '[Collaboration Details]',
        type: 'institutional_collaboration',
        date: '2023-09-01',
        description: '[Collaboration details will be added by the artist]',
    },
]

// Mock Testimonials
export const mockTestimonials: Testimonial[] = [
    {
        id: '1',
        clientName: '[Client Name]',
        clientTitle: '[Client Title/Organization]',
        text: '[Client testimonial will be added by the artist]',
    },
    {
        id: '2',
        clientName: '[Client Name]',
        text: '[Client testimonial will be added by the artist]',
    },
]

// Mock Homepage Content
export const mockHomepageContent = {
    hero: {
        heading: '[Artist Name]',
        subheading: '[Artist tagline or brief introduction]',
        artworkId: '1',
    },
    introduction: {
        heading: 'About the Artist',
        text: '[Artist introduction will be added - a compelling narrative about who Sameeksha is, her artistic journey, and what drives her work.]',
    },
    selectedWorks: {
        artworkIds: ['1', '2', '3', '4', '5', '6'],
    },
    artistWorld: {
        heading: 'Artistic Philosophy',
        text: '[The artist\'s philosophy and approach to art will be described here - what inspires her, her techniques, and her artistic vision.]',
    },
    commissionInvitation: {
        heading: 'Commission Your Own Artwork',
        text: '[Information about commissioning custom artwork will be added - the types of commissions accepted and the collaborative process.]',
    },
    contactInvitation: {
        heading: 'Get In Touch',
        text: '[Contact invitation text will be added by the artist]',
    },
}

// Mock About Content
export const mockAboutContent = {
    biography: '[Artist biography will be added - Sameeksha\'s background, training, artistic evolution, and personal story.]',
    philosophy: '[Artist philosophy will be added - what art means to Sameeksha, her approach, and her vision.]',
    studioInfo: '[Studio information will be added if applicable]',
}

// Mock Commission Content
export const mockCommissionContent = {
    process: {
        heading: 'Commission Process',
        steps: [
            {
                title: 'Initial Consultation',
                description: '[Step details will be added by the artist]',
            },
            {
                title: 'Concept Development',
                description: '[Step details will be added by the artist]',
            },
            {
                title: 'Creation',
                description: '[Step details will be added by the artist]',
            },
            {
                title: 'Delivery',
                description: '[Step details will be added by the artist]',
            },
        ],
    },
    exampleArtworkIds: ['1', '2', '3'],
    stories: [
        {
            id: '1',
            title: '[Commission Story Title]',
            text: '[Story about a commission project will be added by the artist]',
        },
    ],
    invitation: {
        heading: 'Begin Your Commission',
        text: '[Commission invitation text will be added by the artist]',
    },
}

// Mock data for frontend prototypes
// This will be replaced with actual database queries later

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

const palettes: Array<[string, string, string]> = [
    ['#9a7865', '#e7c4b2', '#6a5245'], // terracotta
    ['#7e8ba3', '#c3cad8', '#4f5d75'], // dusty blue
    ['#8a9a7b', '#d3dcc7', '#5f6f4e'], // sage
    ['#8b6f86', '#d0bccb', '#5e4a5a'], // plum
    ['#c2a05c', '#ecdcae', '#917238'], // ochre
    ['#6a5245', '#a89d8a', '#3f342c'], // clay
    ['#7a6a55', '#d4c4a8', '#5c4f3a'], // parchment
    ['#5c7a6a', '#b8d4c4', '#3a5c4f'], // muted teal
    ['#9a6565', '#e4b8b8', '#6a4545'], // dusty rose
    ['#6a7a9a', '#c4d0e4', '#4a5a7a'], // slate blue
    ['#8a7a4a', '#d4c88a', '#6a5a2a'], // antique gold
    ['#7a5a6a', '#d0b0c0', '#5a3a4a'], // mauve
]

export const artSwatch = (i: number) => {
    const [from, to, orb] = palettes[i % palettes.length]
    return swatch(from, to, orb)
}

export const portraitSwatch = swatch('#cdbfae', '#ebe4d8', '#9a7865')
export const studioSwatch = swatch('#b3a892', '#e4ddcd', '#8d826f')

// ─── Tag system ──────────────────────────────────────────────────────────────
// Tags are cross-cutting — an artwork can have multiple.
// They cover medium, subject, style, and availability so visitors can
// slice across collections in ways the artist didn't pre-plan.

export const TAG_GROUPS = {
    medium: {
        label: 'Medium',
        tags: ['Oil', 'Acrylic', 'Watercolour', 'Mixed Media', 'Ink', 'Gouache'],
    },
    subject: {
        label: 'Subject',
        tags: ['Portrait', 'Figure', 'Landscape', 'Devotional', 'Abstract', 'Flora', 'Architecture'],
    },
    style: {
        label: 'Style',
        tags: ['Madhubani', 'Realist', 'Impressionist', 'Folk', 'Contemporary'],
    },
    availability: {
        label: 'Availability',
        tags: ['Available', 'Sold', 'On Commission'],
    },
} as const

export type TagGroup = keyof typeof TAG_GROUPS

export interface ColorPalette {
    from: string
    to: string
    direction?: string
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
    coverIndex?: number // which palette to use for the cover swatch
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
    collectionId: string
    collection: Collection
    images: ArtworkImage[]
    tags: string[]
    colorPalette?: ColorPalette
    createdAt: string
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

// ─── Collections ─────────────────────────────────────────────────────────────

export const mockCollections: Collection[] = [
    {
        id: '1',
        name: 'Portraits',
        slug: 'portraits',
        description: 'Capturing the essence and personality of individuals through expressive portraiture — from intimate studies to large-format commissions.',
        coverIndex: 0,
    },
    {
        id: '2',
        name: 'Landscapes',
        slug: 'landscapes',
        description: 'Natural scenes that evoke stillness and connection — river ghats at dusk, Himalayan light, and the quiet geometry of fields.',
        coverIndex: 2,
    },
    {
        id: '3',
        name: 'Madhubani',
        slug: 'madhubani',
        description: 'Traditional Bihar folk art rendered in ink and natural pigment — gods, animals, and the stories they carry.',
        coverIndex: 4,
    },
    {
        id: '4',
        name: 'Spiritual Works',
        slug: 'spiritual-works',
        description: 'Devotional subjects drawn from Hindu and Buddhist traditions — painted slowly, with intention, as a meditative practice.',
        coverIndex: 3,
    },
]

// ─── Helper to build a mock artwork ──────────────────────────────────────────

function makeArtwork(
    id: string,
    title: string,
    medium: string,
    dimensions: string,
    year: number,
    status: Artwork['availabilityStatus'],
    collectionIndex: number,
    tags: string[],
    paletteIndex: number,
    createdAt: string,
): Artwork {
    const col = mockCollections[collectionIndex]
    const [from, to] = palettes[paletteIndex % palettes.length]
    return {
        id,
        title,
        slug: `artwork-${id}`,
        description: '[Artwork description will be added by the artist]',
        story: '[The story behind this artwork will be shared by the artist]',
        medium,
        dimensions,
        year,
        availabilityStatus: status,
        collectionId: col.id,
        collection: col,
        tags,
        colorPalette: { from, to, direction: 'to bottom right' },
        images: [{
            id,
            url: artSwatch(paletteIndex),
            thumbnailUrl: artSwatch(paletteIndex),
            alt: title,
            width: 1200,
            height: 900,
            isPrimary: true,
        }],
        createdAt,
    }
}

// ─── Artworks — 18 entries spanning all collections and tags ─────────────────
// Enough to show the filter system working meaningfully in the prototype.

export const mockArtworks: Artwork[] = [
    makeArtwork('1',  '[Portrait — Study in Ochre]',      'Oil on canvas',         '24 × 36 in', 2024, 'available',     0, ['Oil', 'Portrait', 'Realist'],               0,  '2024-01-15'),
    makeArtwork('2',  '[Portrait — The Matriarch]',       'Oil on canvas',         '30 × 40 in', 2023, 'sold',          0, ['Oil', 'Portrait', 'Figure', 'Realist'],     6,  '2023-08-10'),
    makeArtwork('3',  '[Portrait — Dusk Light]',          'Acrylic on canvas',     '20 × 24 in', 2024, 'available',     0, ['Acrylic', 'Portrait', 'Contemporary'],      9,  '2024-03-22'),
    makeArtwork('4',  '[Portrait — Commission I]',        'Oil on canvas',         '36 × 48 in', 2023, 'on_commission', 0, ['Oil', 'Portrait', 'Figure'],                1,  '2023-11-05'),
    makeArtwork('5',  '[Portrait — Young Scholar]',       'Watercolour on paper',  '18 × 24 in', 2022, 'sold',          0, ['Watercolour', 'Portrait', 'Realist'],       7,  '2022-06-18'),

    makeArtwork('6',  '[Ganga at Varanasi]',              'Oil on canvas',         '36 × 48 in', 2024, 'available',     1, ['Oil', 'Landscape', 'Realist'],              2,  '2024-02-01'),
    makeArtwork('7',  '[Himalayan Morning]',              'Acrylic on canvas',     '24 × 36 in', 2023, 'available',     1, ['Acrylic', 'Landscape', 'Impressionist'],    8,  '2023-07-14'),
    makeArtwork('8',  '[Monsoon Fields]',                 'Oil on canvas',         '30 × 40 in', 2023, 'sold',          1, ['Oil', 'Landscape', 'Flora'],                5,  '2023-04-29'),
    makeArtwork('9',  '[River Study — Twilight]',         'Watercolour on paper',  '14 × 20 in', 2022, 'available',     1, ['Watercolour', 'Landscape', 'Impressionist'],3,  '2022-09-03'),
    makeArtwork('10', '[Old Delhi Rooftops]',             'Mixed Media',           '20 × 30 in', 2024, 'available',     1, ['Mixed Media', 'Architecture', 'Contemporary'],10, '2024-04-11'),

    makeArtwork('11', '[Madhubani — Radha Krishna]',      'Ink on paper',          '18 × 24 in', 2024, 'available',     2, ['Ink', 'Madhubani', 'Folk', 'Devotional'],   4,  '2024-01-28'),
    makeArtwork('12', '[Madhubani — Fish Motif]',         'Ink on paper',          '12 × 16 in', 2023, 'sold',          2, ['Ink', 'Madhubani', 'Folk'],                 11, '2023-10-07'),
    makeArtwork('13', '[Madhubani — Peacock Panel]',      'Gouache on paper',      '24 × 36 in', 2023, 'available',     2, ['Gouache', 'Madhubani', 'Folk', 'Flora'],    0,  '2023-06-20'),
    makeArtwork('14', '[Madhubani — Wedding Scene]',      'Ink on paper',          '18 × 24 in', 2022, 'not_for_sale',  2, ['Ink', 'Madhubani', 'Folk'],                 7,  '2022-03-15'),

    makeArtwork('15', '[Lakshmi — Gold Study]',           'Oil on canvas',         '24 × 30 in', 2024, 'available',     3, ['Oil', 'Devotional', 'Realist'],             4,  '2024-02-14'),
    makeArtwork('16', '[Ganesh — Ink on Black]',          'Ink on paper',          '18 × 24 in', 2023, 'available',     3, ['Ink', 'Devotional', 'Contemporary'],        6,  '2023-12-01'),
    makeArtwork('17', '[Meditating Figure]',              'Acrylic on canvas',     '30 × 36 in', 2024, 'on_commission', 3, ['Acrylic', 'Figure', 'Devotional', 'Abstract'],2, '2024-03-05'),
    makeArtwork('18', '[Saraswati — Classical Study]',    'Oil on canvas',         '36 × 48 in', 2022, 'sold',          3, ['Oil', 'Devotional', 'Realist'],             9,  '2022-07-22'),
]

// ─── Recognition ─────────────────────────────────────────────────────────────

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
    {
        id: '4',
        title: '[Press Feature]',
        type: 'press',
        date: '2023-06-15',
        description: '[Press details will be added by the artist]',
    },
    {
        id: '5',
        title: '[Award Title 2]',
        type: 'award',
        date: '2022-12-01',
        description: '[Award details will be added by the artist]',
    },
]

// ─── Testimonials ─────────────────────────────────────────────────────────────

export const mockTestimonials: Testimonial[] = [
    {
        id: '1',
        clientName: '[Client Name]',
        clientTitle: '[Client Title / Organization]',
        text: '[Client testimonial will be added by the artist — the experience of commissioning a work, receiving it, and living with it]',
    },
    {
        id: '2',
        clientName: '[Client Name]',
        clientTitle: '[City, Country]',
        text: '[A second testimonial — ideally from a different context, perhaps a collector rather than a commission client]',
    },
    {
        id: '3',
        clientName: '[Client Name]',
        text: '[A third voice — perhaps an institution or gallery that has worked with the artist]',
    },
]

/**
 * Database Seed Script
 *
 * Populates the database with sample data for development:
 * - Admin user
 * - Collections (Portraits, Landscapes, Spiritual Works)
 * - Artworks (published, with placeholder image references)
 * - Recognition entries (award, exhibition, press)
 * - Testimonials
 * - PageContent for homepage, about, commissions
 *
 * Usage: npm run db:seed
 */

import { PrismaClient, AvailabilityStatus, RecognitionType } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
    console.log('\n==============================');
    console.log('  Starting database seed...');
    console.log('==============================\n');

    // ─── Admin User ─────────────────────────────────────────────────────────────
    console.log('→ Creating admin user...');
    const passwordHash = await argon2.hash('changeme123');

    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@sameekshaarts.com' },
        update: { passwordHash }, // keep password fresh on re-seed
        create: {
            email: 'admin@sameekshaarts.com',
            name: 'Sameeksha',
            passwordHash,
        },
    });
    console.log(`  ✓ Admin user: ${adminUser.email}`);

    // ─── Collections ────────────────────────────────────────────────────────────
    console.log('\n→ Creating collections...');

    const portraitsCollection = await prisma.collection.upsert({
        where: { slug: 'portraits' },
        update: {},
        create: {
            name: 'Portraits',
            slug: 'portraits',
            description:
                'A deeply personal series of portrait paintings exploring the inner world of the subject through expressive brushwork, colour, and light. Each piece captures not just likeness, but the silent story behind the eyes.',
        },
    });

    const landscapesCollection = await prisma.collection.upsert({
        where: { slug: 'landscapes' },
        update: {},
        create: {
            name: 'Landscapes',
            slug: 'landscapes',
            description:
                'Landscapes that go beyond the visual — evoking the sensory memory of place. From misty mountain valleys to sun-drenched riverbanks, these works invite the viewer to pause and inhabit the scene.',
        },
    });

    const spiritualCollection = await prisma.collection.upsert({
        where: { slug: 'spiritual-works' },
        update: {},
        create: {
            name: 'Spiritual Works',
            slug: 'spiritual-works',
            description:
                'Rooted in Indian spiritual tradition, this collection draws on sacred geometry, mythology, and devotion. The works serve as both visual meditations and an exploration of the divine as experienced through form and colour.',
        },
    });

    console.log(`  ✓ ${portraitsCollection.name}`);
    console.log(`  ✓ ${landscapesCollection.name}`);
    console.log(`  ✓ ${spiritualCollection.name}`);

    // ─── Artworks ───────────────────────────────────────────────────────────────
    console.log('\n→ Creating artworks...');

    const artworkSeeds = [
        {
            title: 'Quiet Resolve',
            slug: 'quiet-resolve',
            description:
                'A portrait study in warm ochres and deep shadows. The subject — an unnamed village elder — sits with a stillness that speaks of decades of quiet dignity.',
            story:
                "This piece began as a quick sketch during a visit to rural Rajasthan. The elder's face held such depth that the sketch became a full painting over the following weeks. The interplay of direct sunlight and interior shadow became the central tension of the work.",
            medium: 'Oil on canvas',
            dimensions: '60 × 80 cm',
            year: 2023,
            availabilityStatus: AvailabilityStatus.AVAILABLE,
            published: true,
            collectionId: portraitsCollection.id,
        },
        {
            title: 'Morning River',
            slug: 'morning-river',
            description:
                'Golden hour on the banks of the Yamuna. Mist lifts off the water as the first boats push out from the ghats, their reflections dissolving in the gentle current.',
            story:
                'Painted on-location across three mornings in February. The challenge was capturing light that exists only for twenty minutes — long enough to be felt, short enough to remain elusive. Multiple studies were made before this final composition emerged.',
            medium: 'Watercolour on archival paper',
            dimensions: '50 × 70 cm',
            year: 2023,
            availabilityStatus: AvailabilityStatus.SOLD,
            published: true,
            collectionId: landscapesCollection.id,
        },
        {
            title: 'Ganesha in Vermillion',
            slug: 'ganesha-in-vermillion',
            description:
                'A devotional rendering of Ganesha as the remover of obstacles, rendered in deep vermillion and gold leaf. The mandala background grounds the figure in sacred geometry.',
            story:
                'Commissioned as a wedding gift, then retained in the artist\'s collection with the client\'s blessing. The gold leaf was applied by hand over three sessions to achieve the luminous depth required.',
            medium: 'Acrylic and gold leaf on canvas',
            dimensions: '90 × 90 cm',
            year: 2022,
            availabilityStatus: AvailabilityStatus.NOT_FOR_SALE,
            published: true,
            collectionId: spiritualCollection.id,
        },
        {
            title: 'The Weaver',
            slug: 'the-weaver',
            description:
                'A portrait of a Banaras silk weaver at her loom. The rhythmic geometry of the textile contrasts with the organic, human focus of her hands and face.',
            story:
                'Part of an ongoing documentation project of traditional Indian craft communities. The weaver, Kalawati Devi, has been working the loom for over forty years. She agreed to sit only after being shown earlier portraits in the series.',
            medium: 'Oil on linen',
            dimensions: '75 × 100 cm',
            year: 2024,
            availabilityStatus: AvailabilityStatus.AVAILABLE,
            published: true,
            collectionId: portraitsCollection.id,
        },
        {
            title: 'Valley After Rain',
            slug: 'valley-after-rain',
            description:
                'The Western Ghats after a monsoon downpour. Every surface glistens; the air itself seems green. Painted in one sustained session while the memory of the storm was still fresh.',
            story:
                'The storm lasted three hours and left the valley transformed. Working from memory and a handful of phone photographs, this painting attempts to capture not the visual fact but the atmospheric feeling — that particular clarity that only rain produces.',
            medium: 'Oil on canvas',
            dimensions: '80 × 60 cm',
            year: 2024,
            availabilityStatus: AvailabilityStatus.ON_COMMISSION,
            published: true,
            collectionId: landscapesCollection.id,
        },
    ];

    const createdArtworks: { title: string; id: string }[] = [];
    for (const artwork of artworkSeeds) {
        const created = await prisma.artwork.upsert({
            where: { slug: artwork.slug },
            update: {
                title: artwork.title,
                description: artwork.description,
                story: artwork.story,
                medium: artwork.medium,
                dimensions: artwork.dimensions,
                year: artwork.year,
                availabilityStatus: artwork.availabilityStatus,
                published: artwork.published,
                collectionId: artwork.collectionId,
            },
            create: artwork,
        });
        createdArtworks.push({ title: created.title, id: created.id });
        console.log(`  ✓ ${created.title} (${created.availabilityStatus})`);
    }

    // ─── Recognition ────────────────────────────────────────────────────────────
    console.log('\n→ Creating recognition entries...');

    const recognitionSeeds = [
        {
            title: 'National Award for Excellence in Painting',
            type: RecognitionType.AWARD,
            date: new Date('2023-11-15'),
            description:
                'Awarded by the Lalit Kala Akademi in recognition of outstanding contribution to contemporary Indian painting. The jury cited the artist\'s ability to "bridge traditional idiom with a distinctly contemporary sensibility."',
            published: true,
        },
        {
            title: 'Solo Exhibition — Threads of Light, Ahmedabad',
            type: RecognitionType.EXHIBITION,
            date: new Date('2024-02-10'),
            description:
                'A solo show of thirty works spanning portraits, landscapes, and spiritual pieces. Hosted at the Amdavad ni Gufa gallery over three weeks. The exhibition attracted over 2,000 visitors and resulted in twelve sales.',
            published: true,
        },
        {
            title: 'Group Show — Colours of the Subcontinent, New Delhi',
            type: RecognitionType.EXHIBITION,
            date: new Date('2023-03-22'),
            description:
                'Participated in a curated group exhibition at the India Habitat Centre alongside fourteen other contemporary artists. Three works were shown, with "Morning River" being acquired by a private collector.',
            published: true,
        },
        {
            title: '"Painting the Soul of India" — The Hindu Arts Supplement',
            type: RecognitionType.PRESS,
            date: new Date('2024-03-08'),
            description:
                'A two-page feature profile in The Hindu\'s arts supplement. The piece traced the artist\'s journey from early figurative work to the current, more contemplative series. Included an interview and four reproductions.',
            published: true,
        },
        {
            title: 'Artist-in-Residence — Sanskriti Kendra, New Delhi',
            type: RecognitionType.INSTITUTIONAL_COLLABORATION,
            date: new Date('2022-09-01'),
            description:
                'Six-week residency at Sanskriti Kendra\'s Anupam Kher Centre. The residency culminated in a presentation of new works developed on-site, exploring the intersection of craft heritage and contemporary painting practice.',
            published: true,
        },
    ];

    for (const recognition of recognitionSeeds) {
        await prisma.recognition.upsert({
            where: {
                // Recognition has no unique field besides id, so we match on title + type
                id: (
                    await prisma.recognition.findFirst({
                        where: { title: recognition.title, type: recognition.type },
                        select: { id: true },
                    })
                )?.id ?? 'new',
            },
            update: {
                description: recognition.description,
                date: recognition.date,
                published: recognition.published,
            },
            create: recognition,
        });
        console.log(`  ✓ [${recognition.type}] ${recognition.title}`);
    }

    // ─── Testimonials ────────────────────────────────────────────────────────────
    console.log('\n→ Creating testimonials...');

    const testimonialSeeds = [
        {
            clientName: 'Meera Rajagopalan',
            clientTitle: 'Art Collector, Chennai',
            text: 'Sameeksha\'s portrait of my grandmother is one of my most treasured possessions. She managed to capture not just the likeness but the quality of spirit — something I\'ve never seen another artist achieve so precisely. The work arrived beautifully framed and exactly on schedule.',
            order: 1,
            published: true,
        },
        {
            clientName: 'Arjun Mehta',
            clientTitle: 'Interior Architect, Mumbai',
            text: 'I commissioned three landscape pieces for a residential project. Sameeksha worked closely with us to ensure the palette and scale were exactly right. The clients were overwhelmed — they told me the paintings made the house feel complete. I\'ll be working with her again.',
            order: 2,
            published: true,
        },
        {
            clientName: 'Priya & Suresh Nair',
            clientTitle: 'Commissioned a wedding gift',
            text: 'We asked for something unique for our daughter\'s wedding — a piece that would last. What we received was extraordinary. The "Ganesha in Vermillion" now hangs in their living room and every visitor asks about it. Worth every rupee.',
            order: 3,
            published: true,
        },
        {
            clientName: 'Dr. Ravi Shankar',
            clientTitle: 'Professor of Fine Arts, BHU',
            text: 'I follow Sameeksha\'s work closely and attended the Ahmedabad exhibition. The maturity of vision in the recent portrait series is remarkable. "The Weaver" in particular is a work of genuine significance — it will age very well.',
            order: 4,
            published: true,
        },
    ];

    for (const testimonial of testimonialSeeds) {
        const existing = await prisma.testimonial.findFirst({
            where: { clientName: testimonial.clientName },
            select: { id: true },
        });
        if (existing) {
            await prisma.testimonial.update({ where: { id: existing.id }, data: testimonial });
        } else {
            await prisma.testimonial.create({ data: testimonial });
        }
        console.log(`  ✓ ${testimonial.clientName}`);
    }

    // ─── Page Content ────────────────────────────────────────────────────────────
    console.log('\n→ Creating page content...');

    // Homepage
    await prisma.pageContent.upsert({
        where: { page: 'homepage' },
        update: {},
        create: {
            page: 'homepage',
            content: {
                hero: {
                    artworkId: createdArtworks[0]?.id ?? null,
                    heading: 'Painting Stories in Colour',
                    subheading:
                        'Original works exploring portraiture, landscape, and the spiritual traditions of India.',
                },
                introduction: {
                    heading: 'About the Artist',
                    text: 'Sameeksha is a Delhi-based painter working primarily in oil and watercolour. Her practice spans portraiture, landscape, and devotional art, and is informed by extensive research into traditional Indian painting techniques alongside a contemporary sensibility. She has exhibited nationally and her work is held in private and institutional collections across India.',
                },
                selectedWorks: {
                    artworkIds: createdArtworks.slice(0, 3).map((a) => a.id),
                },
                artistWorld: {
                    heading: 'The Studio',
                    text: 'Step into the creative process — from the initial sketch to the final glaze. Explore the materials, inspirations, and decisions that shape each work.',
                },
                commissionInvitation: {
                    heading: 'Commission a Painting',
                    text: 'Every commission begins with a conversation. Whether you have a clear vision or are looking for guidance, the result will be a work made entirely for you.',
                },
                contactInvitation: {
                    heading: 'Get in Touch',
                    text: 'For commissions, exhibition enquiries, or to discuss available works, reach out directly.',
                },
            },
        },
    });
    console.log('  ✓ Homepage');

    // About page
    await prisma.pageContent.upsert({
        where: { page: 'about' },
        update: {},
        create: {
            page: 'about',
            content: {
                biography: {
                    text: 'Sameeksha grew up in a family that valued the arts — her grandmother was a trained classical dancer, and the rhythms of performance and visual culture were woven into daily life from the beginning. She studied Fine Arts at the Faculty of Fine Arts, Baroda, before relocating to Delhi to develop her independent practice.\n\nHer early work was largely figurative, rooted in the traditions of the Bengal School and the Baroda School\'s more experimental lineage. Over time, she developed a distinctive approach that draws on both: the contemplative attention to surface and light of the older tradition, and the conceptual rigour of the contemporary.\n\nToday her practice spans portraiture, landscape, and devotional work. Each series is informed by extended research — she has spent time with weavers in Banaras, monks in Rishikesh, and farmers in the Deccan — and by a conviction that painting\'s power lies in its capacity to slow time and deepen attention.',
                    portraitUrl: null,
                },
                philosophy: {
                    heading: 'On Painting',
                    text: 'A painting is a record of sustained attention. The act of looking — really looking — at a face, a landscape, or a sacred image, and then translating that looking into paint: this is the discipline and the pleasure of the practice. I\'m interested in the friction between what I see and what I can make the paint do. That gap is where the work lives.',
                },
                studio: {
                    heading: 'The Studio',
                    text: 'The studio is in South Delhi, a converted storage room with north-facing light. It holds about thirty canvases at any given time in various states of completion, along with reference material — photographs, sketches, books, and printed textiles collected on research trips. Visitors are welcome by appointment.',
                    imageUrl: null,
                },
                education: [
                    {
                        year: '2010–2014',
                        institution: 'Faculty of Fine Arts, M.S. University of Baroda',
                        qualification: 'Bachelor of Fine Arts',
                    },
                    {
                        year: '2014–2016',
                        institution: 'Faculty of Fine Arts, M.S. University of Baroda',
                        qualification: 'Master of Fine Arts (Painting)',
                    },
                ],
            },
        },
    });
    console.log('  ✓ About');

    // Commissions page
    await prisma.pageContent.upsert({
        where: { page: 'commissions' },
        update: {},
        create: {
            page: 'commissions',
            content: {
                introduction: {
                    heading: 'Commission a Work',
                    text: 'A commission is a collaboration. From the first conversation to the final canvas, each step is undertaken with care and transparency. The result is a painting made specifically for you — or for someone you want to honour.',
                },
                process: {
                    heading: 'The Process',
                    steps: [
                        {
                            title: 'Initial Conversation',
                            description:
                                'We begin with a conversation — by email, phone, or in person — about what you\'re looking for. Subject, size, palette, mood, timeline, and budget are all discussed at this stage.',
                        },
                        {
                            title: 'Concept & Quote',
                            description:
                                'A detailed brief is drawn up and a quote provided. For portraits, reference photographs are gathered and discussed. For landscapes, site visits may be arranged where possible.',
                        },
                        {
                            title: 'Preliminary Sketch',
                            description:
                                'A compositional sketch is shared for approval before work begins on canvas. This is the moment to request adjustments to proportion, composition, or mood.',
                        },
                        {
                            title: 'Creation',
                            description:
                                'Work proceeds on canvas. For oils, this typically takes six to twelve weeks depending on complexity and size. Progress photographs are shared at key stages.',
                        },
                        {
                            title: 'Approval & Delivery',
                            description:
                                'The finished work is photographed professionally and shared for final approval. Delivery is arranged by hand or via specialist art courier, fully insured.',
                        },
                    ],
                },
                pricing: {
                    heading: 'Pricing',
                    text: 'Pricing depends on medium, size, and complexity. Portraits begin at ₹25,000 for a small oil on canvas. Landscapes and spiritual works are similarly priced. A 50% deposit is required to begin; the balance is due on completion. All prices include professional framing and delivery within India.',
                },
                examples: {
                    heading: 'Selected Commissions',
                    artworkIds: [createdArtworks[2]?.id ?? null, createdArtworks[3]?.id ?? null].filter(
                        Boolean
                    ),
                },
                invitation: {
                    heading: 'Begin Your Commission',
                    text: 'The best way to start is a conversation. Get in touch with a brief description of what you have in mind — even the vaguest idea is a beginning.',
                    ctaLabel: 'Get in Touch',
                },
            },
        },
    });
    console.log('  ✓ Commissions');

    // ─── Summary ──────────────────────────────────────────────────────────────
    console.log('\n==============================');
    console.log('  Seed completed successfully!');
    console.log('==============================\n');
    console.log('Admin credentials:');
    console.log('  Email:    admin@sameekshaarts.com');
    console.log('  Password: changeme123');
    console.log('\n⚠️  Change the admin password after your first login.\n');
}

main()
    .catch((e) => {
        console.error('\n✗ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

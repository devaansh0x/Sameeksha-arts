import type { Metadata, Viewport } from 'next'
import { Inter, Cormorant_Garamond, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import ScrollProgress from '@/components/common/ScrollProgress'
import PageTransition from '@/components/common/PageTransition'

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-sans',
    display: 'swap',
    weight: ['200', '300', '400', '500', '600'],
})

const cormorantGaramond = Cormorant_Garamond({
    subsets: ['latin'],
    variable: '--font-serif',
    display: 'swap',
    weight: ['300', '400', '500', '600'],
    style: ['normal', 'italic'],
})

const playfairDisplay = Playfair_Display({
    subsets: ['latin'],
    variable: '--font-display',
    display: 'swap',
    weight: ['400', '500', '600', '700'],
    style: ['normal', 'italic'],
})

export const metadata: Metadata = {
    title: 'Sameeksha Arts | Contemporary Indian Artist',
    description: 'Explore the portfolio of Sameeksha, a contemporary Indian artist specialising in portraits, landscapes, and traditional art forms.',
    keywords: ['artist', 'contemporary art', 'Indian artist', 'portraits', 'commissions', 'art gallery', 'oil painting', 'Madhubani'],
    authors: [{ name: 'Sameeksha' }],
    openGraph: {
        title: 'Sameeksha Arts',
        description: 'Contemporary Indian artist — oil paintings, portraits, Madhubani, and commissions.',
        type: 'website',
    },
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`
    return (
        <html lang="en" className={`${inter.variable} ${cormorantGaramond.variable} ${playfairDisplay.variable} scroll-smooth`} suppressHydrationWarning>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
                <script dangerouslySetInnerHTML={{ __html: themeScript }} />
            </head>
            <body className="font-sans">
                <ScrollProgress />
                <Providers>
                    <PageTransition>
                        {children}
                    </PageTransition>
                </Providers>
            </body>
        </html>
    )
}

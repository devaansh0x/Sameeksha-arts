import type { Config } from 'tailwindcss'

const config: Config = {
    darkMode: 'class',
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Softer, more sophisticated museum palette
                primary: {
                    50: '#fdfcfa',
                    100: '#f7f5f0',
                    200: '#ebe8df',
                    300: '#dad5c8',
                    400: '#c4bead',
                    500: '#a89d8a',
                    600: '#8d826f',
                    700: '#746a5a',
                    800: '#635649',
                    900: '#52473d',
                },
                accent: {
                    50: '#fef9f7',
                    100: '#fdf4f0',
                    200: '#fae9e1',
                    300: '#f3dace',
                    400: '#e7c4b2',
                    500: '#d4a890',
                    600: '#b8927e',
                    700: '#9a7865',
                    800: '#806353',
                    900: '#6a5245',
                },
                neutral: {
                    50: '#fafafa',
                    100: '#f5f5f5',
                    200: '#e8e8e8',
                    300: '#d4d4d4',
                    400: '#a3a3a3',
                    500: '#737373',
                    600: '#5c5c5c',
                    700: '#404040',
                    800: '#2d2d2d',
                    900: '#1a1a1a',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                serif: ['Cormorant Garamond', 'Georgia', 'serif'],
                display: ['Playfair Display', 'Georgia', 'serif'],
            },
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '100': '25rem',
                '112': '28rem',
                '128': '32rem',
            },
            fontSize: {
                '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
                'display-lg': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
                'display-md': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
                'display-sm': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
            },
            maxWidth: {
                '8xl': '88rem',
                '9xl': '96rem',
            },
            aspectRatio: {
                '4/3': '4 / 3',
                '3/4': '3 / 4',
                '5/4': '5 / 4',
                '4/5': '4 / 5',
            },
            keyframes: {
                'fade-up': {
                    '0%': { opacity: '0', transform: 'translateY(30px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'kenburns': {
                    '0%': { transform: 'scale(1) translate(0, 0)' },
                    '100%': { transform: 'scale(1.12) translate(-1.5%, -1.5%)' },
                },
                'shimmer': {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                'float-slow': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-12px)' },
                },
                'reveal-line': {
                    '0%': { transform: 'scaleX(0)' },
                    '100%': { transform: 'scaleX(1)' },
                },
                'marquee': {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-50%)' },
                },
            },
            animation: {
                'fade-up': 'fade-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'fade-in': 'fade-in 1.2s ease-out forwards',
                'kenburns': 'kenburns 20s ease-out forwards',
                'shimmer': 'shimmer 2.5s linear infinite',
                'float-slow': 'float-slow 6s ease-in-out infinite',
                'reveal-line': 'reveal-line 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'marquee': 'marquee 40s linear infinite',
            },
            boxShadow: {
                'luxe': '0 30px 60px -15px rgba(106, 82, 69, 0.18)',
                'luxe-lg': '0 50px 100px -20px rgba(106, 82, 69, 0.25)',
                'inner-luxe': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.5)',
            },
            transitionTimingFunction: {
                'luxe': 'cubic-bezier(0.16, 1, 0.3, 1)',
            },
        },
    },
    plugins: [],
}

export default config

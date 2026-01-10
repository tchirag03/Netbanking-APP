/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#0c4a6e',      // sky-900 (darker sky for primary)
                secondary: '#334155',     // slate-700
                accent: '#0369a1',        // sky-700
                background: '#000000',    // pure black
                surface: '#1e293b',       // slate-800 (for cards)
                textPrimary: '#ffffff',   // white
                textSecondary: '#cbd5e1', // slate-300
            },
            fontFamily: {
                sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
            },
            backdropBlur: {
                'glass': '12px',
            },
            backgroundColor: {
                'glass-white': 'rgba(245, 245, 247, 0.1)',
                'glass-black': 'rgba(10, 10, 10, 0.6)',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
            },
            animation: {
                'shimmer': 'shimmer 2s linear infinite',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'scan': 'scan 2s ease-in-out infinite',
            },
            keyframes: {
                shimmer: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                },
                scan: {
                    '0%, 100%': { transform: 'translateY(-100%)' },
                    '50%': { transform: 'translateY(100%)' },
                },
            },
        },
    },
    plugins: [],
}

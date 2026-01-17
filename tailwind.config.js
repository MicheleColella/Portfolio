/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#050505",
                foreground: "#fcfcfc",
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            animation: {
                "shimmer": "shimmer 2s linear infinite",
                "noise": "noise 0.5s steps(2) infinite",
                "shimmer-down": "shimmerDown 2s ease-in-out infinite",
                "infinite-scroll": "infinite-scroll 25s linear infinite",
                "spin-slow": "spin 12s linear infinite",
            },
            keyframes: {
                shimmer: {
                    from: { backgroundPosition: "0 0" },
                    to: { backgroundPosition: "-200% 0" },
                },
                noise: {
                    "0%": { transform: "translate(0, 0)" },
                    "10%": { transform: "translate(-5%, -5%)" },
                    "20%": { transform: "translate(-10%, 5%)" },
                },
                "infinite-scroll": {
                    from: { transform: "translateX(0)" },
                    to: { transform: "translateX(-100%)" },
                }
            }
        },
    },
    plugins: [],
}

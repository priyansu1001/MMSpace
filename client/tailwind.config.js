/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#eff6ff',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                },
                secondary: {
                    500: '#10b981',
                    600: '#059669',
                },
                gray: {
                    700: '#1f1f1f',
                    800: '#181818',
                    900: '#101010',
                },
                slate: {
                    600: '#222222',
                    700: '#1b1b1b',
                    800: '#141414',
                    900: '#0f0f0f',
                    950: '#0a0a0a',
                }
            }
        },
    },
    plugins: [],
}
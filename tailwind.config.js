/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        eb: {
          bg: '#05080f',
          surface: '#0b1018',
          'surface-2': '#111722',
          'surface-3': '#18202e',
          border: '#1c2840',
          'border-2': '#243050',
          text: '#dde5f0',
          muted: '#5e7291',
          'muted-2': '#36485e',
          gold: '#c8963a',
          'gold-lt': '#e8b85a',
          'gold-dim': '#7a5520',
          blue: '#4e8ec4',
          'blue-lt': '#7aadde',
          green: '#3a9e76',
        },
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeUp 0.4s ease both',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

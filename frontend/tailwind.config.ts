import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: '#0b0e1a', soft: '#11142b', card: '#161a36', border: '#232847' },
        brand: { yellow: '#f7c521', orange: '#ff8c2b', green: '#22c55e', red: '#ef4444', pink: '#ff3a8c' },
        muted: '#8a8fb0'
      },
      boxShadow: {
        glow: '0 0 60px rgba(247, 197, 33, 0.18)',
        card: '0 4px 24px rgba(0,0,0,0.4)'
      },
      backgroundImage: {
        'grid-fade': 'radial-gradient(circle at 50% 30%, rgba(247,197,33,0.12), transparent 60%)',
        'hero-glow': 'radial-gradient(60% 60% at 70% 50%, rgba(255,140,43,0.25), transparent 70%)'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
export default config;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        aurora: {
          steel: '#9ab1d1',
          deep: '#5a7ba6',
          champagne: '#e6decc',
          graphite: '#1e2229',
        },
      },
      fontFamily: {
        display: ['"Clash Display"', 'Geist', 'system-ui', 'sans-serif'],
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
      backdropBlur: {
        xs: '4px',
        '3xl': '64px',
      },
      animation: {
        'aurora-drift': 'aurora-drift 28s ease-in-out infinite',
        'aurora-drift-slow': 'aurora-drift 42s ease-in-out infinite reverse',
        'gradient-flow': 'gradient-flow 8s ease infinite',
        'shimmer': 'shimmer 2.4s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
        'conic-rotate': 'conic-rotate 6s linear infinite',
        'glow-pulse': 'glow-pulse 4s ease-in-out infinite',
        'marquee': 'marquee 30s linear infinite',
        'letter-in': 'letter-in 0.9s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
      keyframes: {
        'aurora-drift': {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '33%': { transform: 'translate3d(8%, -6%, 0) scale(1.12)' },
          '66%': { transform: 'translate3d(-6%, 8%, 0) scale(0.95)' },
        },
        'gradient-flow': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        'shimmer': {
          '0%': { 'background-position': '-200% 0' },
          '100%': { 'background-position': '200% 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'conic-rotate': {
          '0%': { '--angle': '0deg' },
          '100%': { '--angle': '360deg' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.05)' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'letter-in': {
          '0%': { opacity: '0', transform: 'translateY(40%) rotateX(-40deg)', filter: 'blur(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0) rotateX(0)', filter: 'blur(0)' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)',
        'glass-lg': '0 24px 64px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.18)',
        'glow-steel': '0 0 40px -5px rgba(90, 123, 166, 0.45)',
        'glow-champagne': '0 0 40px -5px rgba(230, 222, 204, 0.35)',
      },
    },
  },
  plugins: [],
}

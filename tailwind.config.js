/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: '#43e77e',
        'brand-light': 'rgba(67, 231, 126, 0.16)',
        'brand-deep': '#94ffbb',
        'near-black': '#edf8f0',
        'gray-900': '#070a09',
        'gray-700': '#d4e1d8',
        'gray-500': '#9aada1',
        'gray-400': '#7f9488',
        'gray-200': 'rgba(235, 255, 242, 0.18)',
        'gray-100': 'rgba(255, 255, 255, 0.08)',
        'gray-50': 'rgba(255, 255, 255, 0.05)',
        'error-red': '#ff7b83',
        'warn-amber': '#f0c36a',
        'info-blue': '#88c7ff',
      },
      fontFamily: {
        sans: ['Inter', 'Inter Fallback', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Geist Mono', 'Geist Mono Fallback', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        'pill': '9999px',
        'card': '16px',
        'featured': '24px',
      },
      boxShadow: {
        'card': '0 22px 55px rgba(0,0,0,0.28)',
        'button': '0 8px 20px rgba(0,0,0,0.24)',
      },
      letterSpacing: {
        'display': '-0.02em',
        'tight-display': '-0.04em',
      },
    },
  },
  plugins: [],
}

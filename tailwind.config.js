/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: '#18E299',
        'brand-light': '#d4fae8',
        'brand-deep': '#0fa76e',
        'near-black': '#0d0d0d',
        'gray-900': '#0d0d0d',
        'gray-700': '#333333',
        'gray-500': '#666666',
        'gray-400': '#888888',
        'gray-200': '#e5e5e5',
        'gray-100': '#f5f5f5',
        'gray-50': '#fafafa',
        'error-red': '#d45656',
        'warn-amber': '#c37d0d',
        'info-blue': '#3772cf',
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
        'card': 'rgba(0,0,0,0.03) 0px 2px 4px',
        'button': 'rgba(0,0,0,0.06) 0px 1px 2px',
      },
      letterSpacing: {
        'display': '-0.02em',
        'tight-display': '-0.04em',
      },
    },
  },
  plugins: [],
}

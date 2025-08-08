module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto'],
      },
      boxShadow: {
        bubble: '0 10px 30px rgba(43,111,255,0.18)',
      },
      transitionTimingFunction: {
        'in-expo': 'cubic-bezier(.2,.9,.3,1)',
      },
      colors: {
        'brand-blue': {
          50: '#f8fbff',
          100: '#eef7ff',
          500: '#2b6fff',
        },
      },
    },
  },
  plugins: [],
}

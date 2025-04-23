/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: true,
  },
  experimental: {
    optimizeUniversalDefaults: false,
  },
  future: {
    disableColorOpacityUtilitiesByDefault: true,
  },
};
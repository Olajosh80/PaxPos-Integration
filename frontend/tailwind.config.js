/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Scan all relevant files in src
  ],
  theme: {
    extend: {
      // You can extend the default Tailwind theme here
      // For example, adding custom colors, fonts, spacing, etc.
      // colors: {
      //   'brand-primary': '#007bff',
      //   'brand-secondary': '#6c757d',
      // },
    },
  },
  plugins: [
    // Add any Tailwind plugins here, e.g., @tailwindcss/forms, @tailwindcss/typography
  ],
}

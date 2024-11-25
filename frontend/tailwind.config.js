/** @type {import('tailwindcss').Config} */

export default {
  content: ['./src/**/*.{html,js,vue}'],
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [import('flowbite/plugin')],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Đảm bảo có dòng này để quét file trong src
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
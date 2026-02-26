// tailwind.config.ts

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./shared/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        nunito: ["var(--font-nunito-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

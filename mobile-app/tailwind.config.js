module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#2563EB', light: '#3B82F6', dark: '#1D4ED8' },
        secondary: { DEFAULT: '#7C3AED', light: '#8B5CF6', dark: '#6D28D9' },
      },
    },
  },
  plugins: [],
};

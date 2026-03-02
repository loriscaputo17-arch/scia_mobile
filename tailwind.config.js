/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#001c38",      // blu scuro navy — colore principale app
        secondary: "#0a7ea4",    // blu accent
        background: "#f5f5f5",   // sfondo chiaro
        surface: "#ffffff",
        error: "#ef4444",
        success: "#22c55e",
        warning: "#f59e0b",
        "text-primary": "#11181C",
        "text-secondary": "#687076",
        "text-inverse": "#ffffff",
      },
    },
  },
  plugins: [],
};

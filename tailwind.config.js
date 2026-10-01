/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        tozai: {
          DEFAULT: '#009bbf',
          light: '#28b8dc',
          dark: '#007896',
          bg: '#002530',
        },
        rapid: {
          DEFAULT: '#ef4444', // 快速の赤/朱色
          subtle: '#fee2e2',
          badge: '#dc2626',
        },
        local: {
          DEFAULT: '#64748b', // 各停のグレー
          light: '#94a3b8',
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}

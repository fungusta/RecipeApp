import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FBBB4B',
          50: '#FEF7E6',
          100: '#FDEDCC',
          200: '#FBD999',
          300: '#F9C566',
          400: '#FBB133',
          500: '#FBBB4B',
          600: '#E6A844',
          700: '#CC953D',
          800: '#B38236',
          900: '#996F2F',
        },
      },
    },
  },
  plugins: [],
}

export default config

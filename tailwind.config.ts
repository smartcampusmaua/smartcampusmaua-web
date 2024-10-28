import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ['class', 'selector'],

  theme: {
    extend: {
      fontFamily: {
        'montserrat': ['"Montserrat"', 'sans-serif'],
        'outfit': ['Outfit', 'sans-serif']
      },
      colors: {
        'gms-primary': '#77DD42',
        'gms-secondary': '#48C477',
        'gms-tertiary': '#011627',
        'maua_blue': '#1c2a90'
      },
      boxShadow: {
        'inner-light': 'inset 0 0 5px rgba(0,0,0,.2)',
        'inner-dark': 'inset 0 0 5px rgba(0,0,0,.8)',
      }
    },
    screens: {
      'sm': '640px',
      // => @media (min-width: 640px) { ... }

      'md': '768px',
      // => @media (min-width: 768px) { ... }

      'lg': '1024px',
      // => @media (min-width: 1024px) { ... }

      'xl': '1280px',
      // => @media (min-width: 1280px) { ... }

      '2xl': '1536px',
      // => @media (min-width: 1536px) { ... }

      '3xl': '1920px'
    }
  },
};
export default config;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  prefix: 'bsc-',
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: 'var(--theme-bsc-white)',
      black: 'var(--theme-bsc-black)',
      primary: {
        1: 'var(--theme-bsc-primary-1)',
        2: 'var(--theme-bsc-primary-2)',
        3: 'var(--theme-bsc-primary-3)',
        4: 'var(--theme-bsc-primary-4)',
        5: 'var(--theme-bsc-primary-5)',
      },
      gray: {
        1: 'var(--theme-bsc-gray-1)',
        2: 'var(--theme-bsc-gray-2)',
        3: 'var(--theme-bsc-gray-3)',
        4: 'var(--theme-bsc-gray-4)',
        5: 'var(--theme-bsc-gray-5)',
      },
      mono: {
        dark: {
          1: 'var(--theme-bsc-mono-dark-1)',
          2: 'var(--theme-bsc-mono-dark-2)',
          3: 'var(--theme-bsc-mono-dark-3)',
        },
        light: {
          1: 'var(--theme-bsc-mono-light-1)',
          2: 'var(--theme-bsc-mono-light-2)',
          3: 'var(--theme-bsc-mono-light-3)',
        },
      },
      info: 'var(--theme-bsc-info)',
      success: 'var(--theme-bsc-success)',
      warning: 'var(--theme-bsc-warning)',
      error: 'var(--theme-bsc-error)',
    },
    extend: {
      keyframes: {
        bounce: {
          '50%': { transform: 'scale(1.2)' },
          '75%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        bounce: 'bounce 0.4s ease-in-out forwards 0.2s',
      },
    },
  },
  plugins: [],
};

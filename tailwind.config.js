import { heroui } from '@heroui/react';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
    // O @heroui/theme nem sempre é içado para o topo do node_modules; com o npm
    // fica aninhado dentro do @heroui/react. Cobrimos os dois sítios para que o
    // Tailwind gere as classes dos componentes HeroUI (caso contrário renderizam sem estilo).
    './node_modules/@heroui/theme/dist/**/*.{js,jsx,ts,tsx}',
    './node_modules/@heroui/react/node_modules/@heroui/theme/dist/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  darkMode: 'class',
  plugins: [
    heroui({
      // Raio de canto uniforme (md) em toda a app: small/medium/large apontam
      // todos para o mesmo valor, por isso qualquer componente HeroUI fica md.
      layout: {
        radius: {
          small: '0.375rem',
          medium: '0.375rem',
          large: '0.375rem',
        },
      },
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: '#0f766e',
              foreground: '#ffffff',
            },
          },
        },
      },
    }),
  ],
};

/** @type {import('tailwindcss').Config} */

// Paleta de três cores: amarelo predominante, preto nas linhas e no texto,
// branco nas superfícies. Os valores vivem também em src/style/theme.ts, para
// as props que não aceitam className (ícone, ActivityIndicator, tabBarStyle).
// Mudar uma cor exige mudar nos dois lugares.
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          // Amarelo saturado de sinalização. Texto preto sobre ele dá ~12:1 de
          // contraste; texto branco dá 1,6:1 e por isso nunca é usado aqui.
          DEFAULT: '#FFC800',
          dark: '#C98A00',   // só preenchimento: estado pressionado de botão amarelo
          light: '#FFF6D6',  // lavagem clara: foco de campo, fundo de seleção
        },
        ink: {
          DEFAULT: '#111111', // texto principal e todas as linhas
          soft: '#4A4A4A',    // texto secundário
          muted: '#8A8A8A',   // placeholder e desabilitado
        },
        // Única cor fora da paleta. Ação destrutiva (remover item, excluir
        // conta) perde o aviso se for preta igual ao resto, e confundir
        // "remover" com "confirmar" num tablet de salão sai caro.
        danger: {
          DEFAULT: '#D92D20',
          light: '#FEF3F2',
        },
      },
    },
  },
  plugins: [],
};

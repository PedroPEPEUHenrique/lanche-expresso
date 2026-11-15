/** @type {import('tailwindcss').Config} */

// Maximalismo + futurismo + cyberpunk: neon sobre quase-preto.
// Os valores vivem também em src/style/theme.ts, para as props que não aceitam
// className. Mudar uma cor exige mudar nos dois lugares.
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Fundos, do mais profundo ao mais elevado.
        void: '#05060A',
        surface: '#0D0F1A',
        raised: '#151829',
        line: '#2A2F4A',

        // Tríade neon. `neon` é a primária e sempre recebe texto `void`.
        neon: {
          DEFAULT: '#FCEE0A',
          dim: 'rgba(252, 238, 10, 0.38)',
          ghost: 'rgba(252, 238, 10, 0.12)',
        },
        cyan: {
          DEFAULT: '#00E5FF',
          dim: 'rgba(0, 229, 255, 0.38)',
          ghost: 'rgba(0, 229, 255, 0.12)',
        },
        magenta: {
          DEFAULT: '#FF2D95',
          dim: 'rgba(255, 45, 149, 0.38)',
          ghost: 'rgba(255, 45, 149, 0.12)',
        },

        text: '#EAECF5',
        muted: '#7C819E',
        danger: {
          DEFAULT: '#FF3B5C',
          ghost: 'rgba(255, 59, 92, 0.12)',
        },
      },
      letterSpacing: {
        // Rótulo técnico em caixa alta pede respiro entre letras, senão vira
        // bloco ilegível nos tamanhos pequenos que o estilo usa.
        tecnico: '2px',
        largo: '4px',
      },
    },
  },
  plugins: [],
};

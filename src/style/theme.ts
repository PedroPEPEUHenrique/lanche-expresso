import { Platform } from 'react-native';

/**
 * Sistema visual: maximalismo + futurismo + cyberpunk.
 *
 * O amarelo continua sendo a cor primária, mas o fundo inverteu: neon sobre
 * quase-preto é a assinatura do gênero, e amarelo elétrico é justamente o que
 * mais brilha nesse contexto. Ciano e magenta entram como acentos — a tríade
 * neon clássica.
 *
 * Contraste conferido contra a superfície #0D0F1A:
 *   neon    15.5:1   ciano 12:1   texto 15:1   magenta 5.4:1   apagado 4.8:1
 * Todos passam; o magenta só é usado em peso bold ou corpo grande.
 */
export const theme = {
  /** Fundo mais profundo da tela. */
  void: '#05060A',
  /** Superfície de cartão. */
  surface: '#0D0F1A',
  /** Superfície elevada: modal, cabeçalho de cartão. */
  raised: '#151829',
  /** Linha estrutural fria, para o desenho que não deve brilhar. */
  line: '#2A2F4A',

  /** Amarelo elétrico. Primária — ação, foco, destaque. Recebe texto `void`. */
  neon: '#FCEE0A',
  /** Ciano. Informação, estado em andamento, dados técnicos. */
  cyan: '#00E5FF',
  /** Magenta. Acento de alta energia, alertas de atenção. */
  magenta: '#FF2D95',

  text: '#EAECF5',
  muted: '#7C819E',
  danger: '#FF3B5C',

  /**
   * Versões translúcidas, para o halo.
   *
   * O Android não desenha sombra colorida (elevation é sempre cinza), então o
   * brilho é simulado com camadas de borda semitransparente em vez de
   * shadowColor — ver o componente Halo.
   */
  neonFraco: 'rgba(252, 238, 10, 0.18)',
  neonMedio: 'rgba(252, 238, 10, 0.38)',
  cyanFraco: 'rgba(0, 229, 255, 0.18)',
  cyanMedio: 'rgba(0, 229, 255, 0.38)',
  magentaFraco: 'rgba(255, 45, 149, 0.18)',
  dangerFraco: 'rgba(255, 59, 92, 0.18)',
  linhaFraca: 'rgba(42, 47, 74, 0.6)',

  /**
   * Monoespaçada do sistema. Números e rótulos técnicos pedem largura fixa —
   * um total que muda de largura a cada centavo dança na tela. Sem fonte
   * externa de propósito: baixar família custa peso de bundle e um flash de
   * texto sem estilo na abertura, por um ganho pequeno aqui.
   */
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) as string,
} as const;

export default theme;

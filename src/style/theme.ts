/**
 * Cores para as props que não aceitam className: `color` de Ionicons e
 * ActivityIndicator, `placeholderTextColor`, `tabBarStyle`.
 *
 * Existe porque o app tinha 34 ocorrências do azul da marca escritas à mão em
 * hexadecimal, espalhadas por 15 arquivos — trocar a cor exigia caçar todas.
 * Os mesmos valores estão em tailwind.config.js, que serve às classes.
 */
export const theme = {
  /**
   * Amarelo da marca. Só aparece como preenchimento, e só recebe preto em cima.
   *
   * Nunca como primeiro plano sobre branco: o amarelo mais escuro que ainda
   * parece amarelo chega a ~2,9:1 contra o branco, abaixo do mínimo de 4,5:1
   * para texto. Por isso preço, link e ícone em foco são preto, e o amarelo
   * entra atrás deles.
   */
  brand: '#FFC800',
  /** Lavagem amarela clara: campo em foco, item selecionado. */
  brandLight: '#FFF6D6',

  /** Preto das linhas e do texto principal. */
  ink: '#111111',
  /** Texto secundário. */
  inkSoft: '#4A4A4A',
  /** Placeholder, ícone inativo, desabilitado. */
  inkMuted: '#8A8A8A',

  white: '#FFFFFF',

  /** Ação destrutiva. Ver a justificativa em tailwind.config.js. */
  danger: '#D92D20',
} as const;

export default theme;

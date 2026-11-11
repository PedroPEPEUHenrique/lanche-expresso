/** Papéis do app. O token carrega um deles e decide quais rotas abrem. */
export type Papel = 'gestor' | 'garcom' | 'cozinha';

/** Fluxo de uma rodada na cozinha. Espelha o FLUXO de servPedido.js. */
export type StatusRodada = 'enviado' | 'em_preparo' | 'pronto' | 'entregue' | 'cancelado';

export interface Produto {
  idProduto: number;
  idProdutoCategoria: number;
  nome: string;
  descricao: string;
  valor: number;
  icone?: string;
  ativo: boolean;
}

export interface ProdutoCategoria {
  idProdutoCategoria: number;
  categoria: string;
  ordem: number;
}

/** Uma mesa no mapa do salão. `ocupada` vem derivado da API. */
export interface Mesa {
  idMesa: number;
  numero: string;
  setor?: string;
  capacidade?: number;
  ocupada: boolean;
  idComanda?: number | null;
  dtAbertura?: string | null;
  vlTotal?: number | null;
  nomeGarcom?: string | null;
}

export interface ItemRodada {
  idItensPedido: number;
  idProduto: number;
  nomeProduto: string;
  observacao?: string | null;
  quantidade: number;
  vlUnitario: number;
  vlTotal: number;
}

export interface Rodada {
  idPedido: number;
  idComanda: number | null;
  status: StatusRodada;
  dtPedido: string;
  vlTotal: number;
  numeroMesa?: string;
  nomeGarcom?: string;
  itens: ItemRodada[];
}

export interface Comanda {
  idComanda: number;
  idMesa: number;
  numeroMesa: string;
  setor?: string;
  status: 'aberta' | 'fechada' | 'cancelada';
  vlTotal: number;
  dtAbertura: string;
  nomeGarcom?: string;
  rodadas: Rodada[];
}

/**
 * Item que o garçom montou mas ainda não enviou.
 *
 * Guarda preço só para mostrar o total na tela enquanto ele monta a rodada.
 * O valor que vale é o que a API calcula no envio — este aqui é estimativa de
 * interface, e some assim que a rodada vira Rodada.
 */
export interface ItemRascunho {
  idProduto: number;
  nome: string;
  valor: number;
  quantidade: number;
  observacao?: string;
}

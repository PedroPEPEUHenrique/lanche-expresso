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
  /** Está no cardápio. Decisão de cardápio, rara. */
  ativo: boolean;
  /** Tem hoje. "Acabou o filé", um toque, toda noite. */
  disponivel: boolean;
}

/** Uma categoria com seus produtos, como a tela do gestor consome. */
export interface SecaoCardapio extends ProdutoCategoria {
  produtos: Produto[];
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

// ---------------------------------------------------------------------------
// Equipe (Fase 3)
// ---------------------------------------------------------------------------

export interface Funcionario {
  idFuncionario: number;
  idUsuario: number;
  nome: string;
  email: string;
  telefone?: string;
  papel: Papel;
  /** Desligar é desativar: o histórico de vendas da pessoa é preservado. */
  ativo: boolean;
  dtAdmissao: string;
}

// ---------------------------------------------------------------------------
// Caixa (Fase 4)
// ---------------------------------------------------------------------------

export interface MovimentoCaixa {
  idMovimento: number;
  /** 'venda' nasce do fechamento da comanda; os outros são manuais. */
  tipo: 'venda' | 'venda_externa' | 'despesa' | 'sangria' | 'suprimento';
  descricao: string;
  valor: number;
  numeroMesa?: string;
  nomeFuncionario?: string;
  dtMovimento: string;
}

export interface ResumoCaixa {
  vlAbertura: number;
  vendas: number;
  vendasExternas: number;
  suprimentos: number;
  despesas: number;
  sangrias: number;
  movimentos: number;
  /** Quanto deveria haver na gaveta. */
  vlEsperado: number;
  vlInformado: number | null;
  /** Positivo = sobrou; negativo = faltou. null enquanto o caixa está aberto. */
  vlDiferenca: number | null;
}

export interface Caixa {
  idCaixa: number;
  status: 'aberto' | 'fechado';
  dtAbertura: string;
  dtFechamento: string | null;
  nomeAbertura?: string;
  resumo: ResumoCaixa;
  movimentos: MovimentoCaixa[];
}

// ---------------------------------------------------------------------------
// Relatórios (Fase 4)
// ---------------------------------------------------------------------------

export interface PainelRelatorio {
  periodo: { de: string; ate: string };
  resumo: {
    comandas: number;
    faturamento: number;
    ticketMedio: number;
    rodadasCanceladas: number;
  };
  porDia: { dia: string; comandas: number; faturamento: number }[];
  maisVendidos: { nome: string; quantidade: number; faturamento: number }[];
  porHora: { hora: number; comandas: number; faturamento: number }[];
  equipe: {
    idFuncionario: number; nome: string; papel: Papel;
    comandas: number; faturamento: number;
  }[];
}

// ---------------------------------------------------------------------------
// Estoque (Fase 5)
// ---------------------------------------------------------------------------

export interface Insumo {
  idInsumo: number;
  nome: string;
  unidade: 'kg' | 'g' | 'l' | 'ml' | 'un';
  qtdAtual: number;
  qtdMinima: number;
  vlCustoMedio: number;
  /** Saldo no mínimo ou abaixo. */
  repor: boolean;
}

export interface FichaTecnica {
  idProduto: number;
  nome: string;
  valor: number;
  itens: {
    idInsumo: number; nome: string; unidade: string;
    quantidade: number; vlCustoMedio: number; vlCusto: number;
  }[];
  vlCusto: number;
  /** null quando não há ficha: sem receita o custo é desconhecido, não zero. */
  vlMargem: number | null;
  percMargem: number | null;
}

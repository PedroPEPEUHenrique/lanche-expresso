/**
 * Tipos do app.
 *
 * As formas que vêm da API não são declaradas aqui: elas são reexportadas de
 * `contrato.ts`, que é cópia gerada do contrato da API. Antes cada service
 * reconvertia a linha crua do banco à mão, e renomear uma coluna quebrava o
 * app em silêncio — o TypeScript não enxerga o servidor.
 *
 * Agora a mesma definição compila dos dois lados. Mudar um campo na API
 * quebra a compilação aqui, que é o que se quer.
 */

export type {
  Papel,
  StatusRodada,
  StatusComanda,
  TipoMovimentoCaixa,
  UnidadeInsumo,
  UsuarioContrato,
  EmpresaResumo,
  RespostaLogin,
  EscolhaDeEmpresa,
  Funcionario,
  DesempenhoDeFuncionario,
  Restaurante,
  Produto,
  ProdutoCategoria,
  SecaoCardapio,
  Mesa,
  ItemRodada,
  Rodada,
  Comanda,
  ComandaResumo,
  MovimentoCaixa,
  ResumoCaixa,
  Caixa,
  PainelRelatorio,
  Insumo,
  MovimentoEstoque,
  ItemFichaTecnica,
  FichaTecnica,
  ErroApi,
} from './contrato';

// ---------------------------------------------------------------------------
// Tipos que só existem no aparelho
//
// Não trafegam pela API, então não pertencem ao contrato.
// ---------------------------------------------------------------------------

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

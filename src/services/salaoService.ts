import { apiFetch } from './apiClient';
import { Mesa, Comanda, Rodada, Produto, ProdutoCategoria, ItemRascunho, StatusRodada } from '../types';

// A API devolve snake_case do MySQL; o app trabalha em camelCase. A conversão
// mora aqui, numa camada só, para nenhuma tela precisar conhecer o formato do
// banco.

export async function listarSalao(): Promise<Mesa[]> {
  return await apiFetch<Mesa[]>('/mesas', { mensagemErro: 'Erro ao carregar o salão' });
}

export async function abrirComanda(idMesa: number, observacao?: string): Promise<Comanda> {
  const data = await apiFetch<any>('/comandas', {
    method: 'POST',
    body: { idMesa, observacao },
    mensagemErro: 'Erro ao abrir a mesa',
  });
  return mapComanda(data);
}

export async function buscarComanda(idComanda: number): Promise<Comanda> {
  const data = await apiFetch<any>(`/comandas/${idComanda}`, {
    mensagemErro: 'Erro ao carregar a comanda',
  });
  return mapComanda(data);
}

/**
 * Envia uma rodada. O corpo leva produto, quantidade e observação — nunca
 * preço: quem calcula é o servidor, a partir do cardápio.
 *
 * `idLocal` vai junto para o envio ser idempotente; reenviar a mesma rodada
 * devolve a que já existe em vez de duplicar o prato na cozinha.
 */
export async function lancarRodada(
  idComanda: number,
  itens: ItemRascunho[],
  idLocal: string
): Promise<Rodada> {
  const data = await apiFetch<any>(`/comandas/${idComanda}/pedidos`, {
    method: 'POST',
    body: {
      idLocal,
      itens: itens.map((i) => ({
        idProduto: i.idProduto,
        quantidade: i.quantidade,
        observacao: i.observacao ?? '',
      })),
    },
    mensagemErro: 'Erro ao enviar para a cozinha',
  });
  return mapRodada(data);
}

export async function fecharComanda(idComanda: number, forcar = false): Promise<Comanda> {
  const data = await apiFetch<any>(`/comandas/${idComanda}/fechar`, {
    method: 'PATCH',
    body: { forcar },
    mensagemErro: 'Erro ao fechar a conta',
  });
  return mapComanda(data);
}

export async function listarFilaCozinha(): Promise<Rodada[]> {
  const data = await apiFetch<any[]>('/cozinha/fila', { mensagemErro: 'Erro ao carregar a fila' });
  return data.map(mapRodada);
}

export async function avancarStatus(idPedido: number, status: StatusRodada): Promise<Rodada> {
  const data = await apiFetch<any>(`/pedidos/${idPedido}/status`, {
    method: 'PATCH',
    body: { status },
    mensagemErro: 'Erro ao atualizar o pedido',
  });
  return mapRodada(data);
}

export async function listarCardapio(idEmpresa: number): Promise<{ categorias: ProdutoCategoria[]; produtos: Produto[] }> {
  const [cats, prods] = await Promise.all([
    apiFetch<any[]>(`/produto-categorias/${idEmpresa}`, { mensagemErro: 'Erro ao carregar o cardápio' }),
    apiFetch<any[]>(`/produtos/empresa/${idEmpresa}`, { mensagemErro: 'Erro ao carregar o cardápio' }),
  ]);
  return {
    categorias: cats.map((c) => ({
      idProdutoCategoria: c.id_produto_categoria,
      categoria: c.categoria,
      ordem: c.ordem,
    })),
    produtos: prods.map((p) => ({
      idProduto: p.id_produto,
      idProdutoCategoria: p.id_produto_categoria,
      nome: p.nome,
      descricao: p.descricao ?? '',
      valor: Number(p.valor),
      icone: p.icone ?? undefined,
      ativo: !!p.ativo,
      // Esta rota só devolve o que está no cardápio E tem hoje — a API filtra
      // pelos dois estados. O campo vem junto para o tipo ser o mesmo que a
      // tela do gestor usa.
      disponivel: p.disponivel === undefined ? true : !!p.disponivel,
    })),
  };
}

function mapRodada(p: any): Rodada {
  return {
    idPedido: p.id_pedido,
    idComanda: p.id_comanda ?? null,
    status: p.status,
    dtPedido: p.dt_pedido,
    vlTotal: Number(p.vl_total ?? 0),
    numeroMesa: p.numero_mesa ?? undefined,
    nomeGarcom: p.nome_garcom ?? undefined,
    itens: (p.itens ?? []).map((i: any) => ({
      idItensPedido: i.id_itens_pedido,
      idProduto: i.id_produto,
      nomeProduto: i.nome_produto ?? '',
      observacao: i.observacao ?? null,
      quantidade: i.quantidade,
      vlUnitario: Number(i.vl_unitario),
      vlTotal: Number(i.vl_total),
    })),
  };
}

function mapComanda(c: any): Comanda {
  return {
    idComanda: c.id_comanda,
    idMesa: c.id_mesa,
    numeroMesa: c.numero_mesa ?? '',
    setor: c.setor ?? undefined,
    status: c.status,
    vlTotal: Number(c.vl_total ?? 0),
    dtAbertura: c.dt_abertura,
    nomeGarcom: c.nome_garcom ?? undefined,
    rodadas: (c.rodadas ?? []).map(mapRodada),
  };
}

import { apiFetch } from './apiClient';
import {
  Mesa, Comanda, ComandaResumo, Rodada, Produto, ProdutoCategoria,
  ItemRascunho, StatusRodada,
} from '../types';

/**
 * Chamadas do salão.
 *
 * Sem conversão de nomes: a API responde no contrato, e o contrato é o tipo.
 * Antes este arquivo tinha 21 linhas traduzindo `id_pedido` para `idPedido` —
 * tradução que ninguém verificava e que quebrava calada quando uma coluna
 * mudava de nome.
 */

export async function listarSalao(): Promise<Mesa[]> {
  return await apiFetch<Mesa[]>('/mesas', { mensagemErro: 'Erro ao carregar o salão' });
}

export async function listarComandasAbertas(): Promise<ComandaResumo[]> {
  return await apiFetch<ComandaResumo[]>('/comandas', { mensagemErro: 'Erro ao carregar as comandas' });
}

export async function abrirComanda(idMesa: number, observacao?: string): Promise<Comanda> {
  return await apiFetch<Comanda>('/comandas', {
    method: 'POST',
    body: { idMesa, observacao },
    mensagemErro: 'Erro ao abrir a mesa',
  });
}

export async function buscarComanda(idComanda: number): Promise<Comanda> {
  return await apiFetch<Comanda>(`/comandas/${idComanda}`, {
    mensagemErro: 'Erro ao carregar a comanda',
  });
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
  return await apiFetch<Rodada>(`/comandas/${idComanda}/pedidos`, {
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
}

export async function fecharComanda(idComanda: number, forcar = false): Promise<Comanda> {
  return await apiFetch<Comanda>(`/comandas/${idComanda}/fechar`, {
    method: 'PATCH',
    body: { forcar },
    mensagemErro: 'Erro ao fechar a conta',
  });
}

export async function listarFilaCozinha(): Promise<Rodada[]> {
  return await apiFetch<Rodada[]>('/cozinha/fila', { mensagemErro: 'Erro ao carregar a fila' });
}

export async function avancarStatus(idPedido: number, status: StatusRodada): Promise<Rodada> {
  return await apiFetch<Rodada>(`/pedidos/${idPedido}/status`, {
    method: 'PATCH',
    body: { status },
    mensagemErro: 'Erro ao atualizar o pedido',
  });
}

export async function listarCardapio(
  idEmpresa: number
): Promise<{ categorias: ProdutoCategoria[]; produtos: Produto[] }> {
  const [categorias, produtos] = await Promise.all([
    apiFetch<ProdutoCategoria[]>(`/produto-categorias/${idEmpresa}`, { mensagemErro: 'Erro ao carregar o cardápio' }),
    apiFetch<Produto[]>(`/produtos/empresa/${idEmpresa}`, { mensagemErro: 'Erro ao carregar o cardápio' }),
  ]);
  return { categorias, produtos };
}

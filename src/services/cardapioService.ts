import { apiFetch } from './apiClient';
import { Produto, ProdutoCategoria, SecaoCardapio } from '../types';

/**
 * Cardápio do gestor.
 *
 * Sem conversão: a API responde no contrato.
 */

/** Inclui o que está em falta e o que saiu do cardápio — é aqui que volta. */
export async function listarCardapioCompleto(): Promise<SecaoCardapio[]> {
  return await apiFetch<SecaoCardapio[]>('/cardapio', { mensagemErro: 'Erro ao carregar o cardápio' });
}

/**
 * Marca o produto como em falta ou de volta. Envia só o booleano — é o gesto
 * mais frequente do dia e não deve arrastar nome, preço e categoria junto.
 */
export async function alternarDisponibilidade(idProduto: number, disponivel: boolean): Promise<void> {
  await apiFetch<void>(`/produtos/${idProduto}/disponibilidade`, {
    method: 'PATCH', body: { disponivel }, mensagemErro: 'Erro ao atualizar a disponibilidade',
  });
}

export async function criarProduto(dados: {
  nome: string; descricao?: string; valor: number; idProdutoCategoria: number;
}): Promise<void> {
  await apiFetch<void>('/produtos', { method: 'POST', body: dados, mensagemErro: 'Erro ao criar o produto' });
}

export async function atualizarProduto(idProduto: number, dados: {
  nome?: string; descricao?: string; valor?: number; idProdutoCategoria?: number; ativo?: 0 | 1;
}): Promise<void> {
  await apiFetch<void>(`/produtos/${idProduto}`, {
    method: 'PUT', body: dados, mensagemErro: 'Erro ao salvar o produto',
  });
}

export async function removerProduto(idProduto: number): Promise<void> {
  await apiFetch<void>(`/produtos/${idProduto}`, { method: 'DELETE', mensagemErro: 'Erro ao remover o produto' });
}

export async function criarCategoria(categoria: string, ordem?: number): Promise<void> {
  await apiFetch<void>('/produto-categorias', {
    method: 'POST', body: { categoria, ordem }, mensagemErro: 'Erro ao criar a categoria',
  });
}

export async function atualizarCategoria(id: number, categoria: string, ordem?: number): Promise<void> {
  await apiFetch<void>(`/produto-categorias/${id}`, {
    method: 'PUT', body: { categoria, ordem }, mensagemErro: 'Erro ao salvar a categoria',
  });
}

export async function removerCategoria(id: number): Promise<void> {
  await apiFetch<void>(`/produto-categorias/${id}`, {
    method: 'DELETE', mensagemErro: 'Erro ao remover a categoria',
  });
}

export type { Produto, ProdutoCategoria };

import { apiFetch } from './apiClient';
import { Restaurant, Product } from '../types';

const PUBLICO = { autenticado: false } as const;

export interface ApiCategory {
  id: string;
  name: string;
  emoji: string;
}

export async function listarEmpresas(): Promise<Restaurant[]> {
  const data = await apiFetch<any[]>('/empresas', { ...PUBLICO, mensagemErro: 'Erro ao buscar restaurantes' });
  return data.map(mapEmpresa);
}

export async function listarEmpresasPorCategoria(idCategoria: string): Promise<Restaurant[]> {
  const data = await apiFetch<any[]>(`/empresas/categoria/${idCategoria}`, {
    ...PUBLICO,
    mensagemErro: 'Erro ao buscar restaurantes por categoria',
  });
  return data.map(mapEmpresa);
}

export async function listarCategorias(): Promise<ApiCategory[]> {
  const data = await apiFetch<any[]>('/categorias', { ...PUBLICO, mensagemErro: 'Erro ao buscar categorias' });
  return data.map((c) => ({
    id: String(c.id_categoria),
    name: c.nome ?? '',
    emoji: c.emoji ?? '',
  }));
}

export async function listarProdutosPorEmpresa(idEmpresa: string): Promise<Product[]> {
  const data = await apiFetch<any[]>(`/produtos/empresa/${idEmpresa}`, {
    ...PUBLICO,
    mensagemErro: 'Erro ao buscar produtos',
  });
  return data.map(mapProduto);
}

/**
 * Traduz a linha de EMPRESA (snake_case, como vem do MySQL) para o modelo de
 * domínio do app. Exportado porque favoritos devolvem as mesmas colunas.
 */
export function mapEmpresa(e: any): Restaurant {
  const parts = [e.endereco, e.numero ? `nº ${e.numero}` : null, e.bairro].filter(Boolean);
  return {
    id: String(e.id_empresa),
    name: e.nome ?? '',
    address: parts.join(', '),
    image: e.icone ?? '',
    category: e.categoria ?? '',
    deliveryFee: e.taxa_entrega ?? 0,
    rating: e.avaliacao ?? 0,
    products: [],
  };
}

export function mapProduto(p: any): Product {
  return {
    id: String(p.id_produto),
    name: p.nome ?? '',
    description: p.descricao ?? '',
    price: p.valor ?? 0,
    image: p.icone ?? '',
  };
}

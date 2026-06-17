import { Restaurant, Product } from '../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface ApiCategory {
  id: string;
  name: string;
  emoji: string;
}

export async function listarEmpresas(): Promise<Restaurant[]> {
  const res = await fetch(`${API_URL}/empresas`);
  if (!res.ok) throw new Error('Erro ao buscar restaurantes');
  const data = await res.json();
  return data.map(mapEmpresa);
}

export async function listarEmpresasPorCategoria(idCategoria: string): Promise<Restaurant[]> {
  const res = await fetch(`${API_URL}/empresas/categoria/${idCategoria}`);
  if (!res.ok) throw new Error('Erro ao buscar restaurantes por categoria');
  const data = await res.json();
  return data.map(mapEmpresa);
}

export async function listarCategorias(): Promise<ApiCategory[]> {
  const res = await fetch(`${API_URL}/categorias`);
  if (!res.ok) throw new Error('Erro ao buscar categorias');
  const data = await res.json();
  return data.map((c: any) => ({
    id: String(c.id_categoria),
    name: c.nome ?? '',
    emoji: c.emoji ?? '',
  }));
}

export async function listarProdutosPorEmpresa(idEmpresa: string): Promise<Product[]> {
  const res = await fetch(`${API_URL}/produtos/empresa/${idEmpresa}`);
  if (!res.ok) throw new Error('Erro ao buscar produtos');
  const data = await res.json();
  return data.map(mapProduto);
}

function mapEmpresa(e: any): Restaurant {
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

function mapProduto(p: any): Product {
  return {
    id: String(p.id_produto),
    name: p.nome ?? '',
    description: p.descricao ?? '',
    price: p.valor ?? 0,
    image: p.icone ?? '',
  };
}

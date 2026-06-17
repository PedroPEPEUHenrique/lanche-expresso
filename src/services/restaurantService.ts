import { api } from './api';
import { Restaurant, Product } from '../types';

const EMOJI_MAP: Record<string, string> = {
  Pizza: '🍕',
  'Hambúrguer': '🍔',
  Japonesa: '🍣',
  'Açaí': '🍧',
  'Comida Goiana': '🌽',
  Padaria: '🥖',
  Bebidas: '🥤',
};

export interface ApiCategory {
  id: string;
  name: string;
  emoji: string;
}

function mapEmpresa(e: any): Restaurant {
  const parts = [e.endereco, e.numero, e.bairro].filter(Boolean);
  return {
    id: String(e.id_empresa),
    name: e.nome,
    image: e.icone || '',
    address: parts.length > 0 ? parts.join(', ') : (e.cidade || ''),
    category: '',
    deliveryFee: e.taxa_entrega ?? 0,
    rating: 0,
    products: [],
  };
}

function mapProduto(p: any): Product {
  return {
    id: String(p.id_produto),
    name: p.nome,
    description: p.descricao || '',
    price: p.valor,
    image: p.icone || '',
  };
}

export async function listarEmpresas(): Promise<Restaurant[]> {
  const data = await api.get<any[]>('/empresas');
  return data.map(mapEmpresa);
}

export async function listarEmpresasPorCategoria(idCategoria: string): Promise<Restaurant[]> {
  const data = await api.get<any[]>(`/empresas/categoria/${idCategoria}`);
  return data.map(mapEmpresa);
}

export async function listarCategorias(): Promise<ApiCategory[]> {
  const data = await api.get<any[]>('/categorias');
  return data.map((c) => ({
    id: String(c.id_categoria),
    name: c.categoria,
    emoji: EMOJI_MAP[c.categoria] || '🍽️',
  }));
}

export async function listarProdutosPorEmpresa(idEmpresa: string): Promise<Product[]> {
  const data = await api.get<any[]>(`/produtos/empresa/${idEmpresa}`);
  return data.map(mapProduto);
}

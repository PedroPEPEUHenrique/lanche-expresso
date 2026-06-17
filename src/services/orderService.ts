import { CartItem } from '../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface ApiOrder {
  id: string;
  date: string;
  restaurantName: string;
  restaurantImage: string;
  status: string;
  deliveryFee: number;
  total: number;
}

export async function criarPedido(
  items: CartItem[],
  userId: number,
  subtotal: number,
  deliveryFee: number,
  total: number
): Promise<void> {
  if (!items.length) throw new Error('Carrinho vazio');

  const idEmpresa = Number(items[0].restaurant.id);
  const itens = items.map((i) => ({
    idProduto: Number(i.product.id),
    observacao: i.observations ?? '',
    quantidade: i.quantity,
    vlUnitario: i.product.price,
    vlTotal: i.product.price * i.quantity,
  }));

  const res = await fetch(`${API_URL}/pedidos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idEmpresa,
      idUsuario: userId,
      vlSubtotal: subtotal,
      vlTaxaEntrega: deliveryFee,
      vlTotal: total,
      itens,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).mensagem || 'Erro ao criar pedido');
  }
}

export async function listarPedidosPorUsuario(userId: number): Promise<ApiOrder[]> {
  const res = await fetch(`${API_URL}/pedidos/usuario/${userId}`);
  if (!res.ok) throw new Error('Erro ao buscar pedidos');
  const data = await res.json();
  return data.map((p: any) => ({
    id: String(p.id_pedido),
    date: p.dt_pedido ?? '',
    restaurantName: p.nome_empresa ?? '',
    restaurantImage: p.icone_empresa ?? '',
    status: p.status ?? 'pendente',
    deliveryFee: p.vl_taxa_entrega ?? 0,
    total: p.vl_total ?? 0,
  }));
}

import { apiFetch } from './apiClient';
import { CartItem } from '../types';

export interface ApiOrder {
  id: string;
  date: string;
  restaurantName: string;
  restaurantImage: string;
  status: string;
  deliveryFee: number;
  total: number;
}

/**
 * O idUsuario não é enviado: a API o deriva do token, para que um cliente não
 * possa lançar pedido no nome de outra pessoa.
 */
export async function criarPedido(
  items: CartItem[],
  subtotal: number,
  deliveryFee: number,
  total: number
): Promise<void> {
  if (!items.length) throw new Error('Carrinho vazio');

  const itens = items.map((i) => ({
    idProduto: Number(i.product.id),
    observacao: i.observations ?? '',
    quantidade: i.quantity,
    vlUnitario: i.product.price,
    vlTotal: i.product.price * i.quantity,
  }));

  await apiFetch<void>('/pedidos', {
    method: 'POST',
    mensagemErro: 'Erro ao criar pedido',
    body: {
      idEmpresa: Number(items[0].restaurant.id),
      vlSubtotal: subtotal,
      vlTaxaEntrega: deliveryFee,
      vlTotal: total,
      itens,
    },
  });
}

export async function listarPedidosPorUsuario(userId: number): Promise<ApiOrder[]> {
  const data = await apiFetch<any[]>(`/pedidos/usuario/${userId}`, {
    mensagemErro: 'Erro ao buscar pedidos',
  });
  return data.map((p) => ({
    id: String(p.id_pedido),
    date: p.dt_pedido ?? '',
    restaurantName: p.nome_empresa ?? '',
    restaurantImage: p.icone_empresa ?? '',
    status: p.status ?? 'pendente',
    deliveryFee: p.vl_taxa_entrega ?? 0,
    total: p.vl_total ?? 0,
  }));
}

import { api } from './api';
import { CartItem } from '../types';

export interface ApiOrder {
  id: string;
  restaurantName: string;
  restaurantImage: string;
  date: string;
  status: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
}

function mapPedido(p: any): ApiOrder {
  return {
    id: String(p.id_pedido),
    restaurantName: p.nome_empresa,
    restaurantImage: p.icone_empresa || '',
    date: p.dt_pedido,
    status: p.status,
    subtotal: p.vl_subtotal,
    deliveryFee: p.vl_taxa_entrega,
    total: p.vl_total,
  };
}

export async function criarPedido(
  items: CartItem[],
  idUsuario: string,
  subtotal: number,
  deliveryFee: number,
  total: number
): Promise<void> {
  const restaurant = items[0].restaurant;
  await api.post('/pedidos', {
    idEmpresa: parseInt(restaurant.id),
    idUsuario: parseInt(idUsuario),
    vlSubtotal: subtotal,
    vlTaxaEntrega: deliveryFee,
    vlTotal: total,
    itens: items.map((i) => ({
      idProduto: parseInt(i.product.id),
      quantidade: i.quantity,
      vlUnitario: i.product.price,
      vlTotal: parseFloat((i.product.price * i.quantity).toFixed(2)),
      observacao: i.observations || '',
    })),
  });
}

export async function listarPedidosPorUsuario(idUsuario: string): Promise<ApiOrder[]> {
  const data = await api.get<any[]>(`/pedidos/usuario/${idUsuario}`);
  return data.map(mapPedido);
}

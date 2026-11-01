import { apiFetch } from './apiClient';
import { mapEmpresa } from './restaurantService';
import { Restaurant } from '../types';

export interface Favorite {
  /** Id do registro em USER_FAVORITO, necessário para desfavoritar. */
  idFavorito: number;
  restaurant: Restaurant;
}

export async function listarFavoritos(userId: number): Promise<Favorite[]> {
  const data = await apiFetch<any[]>(`/favoritos/usuario/${userId}`, {
    mensagemErro: 'Erro ao buscar favoritos',
  });
  return data.map((f) => ({
    idFavorito: f.id_favorito,
    restaurant: mapEmpresa(f),
  }));
}

/**
 * idProduto nulo favorita a empresa inteira. Devolve só o id do registro: a
 * tela já tem o Restaurant em mãos, então não há motivo para o servidor
 * reenviar os dados da empresa.
 */
export async function favoritarEmpresa(idEmpresa: string): Promise<number> {
  const f = await apiFetch<{ id_favorito: number }>('/favoritos', {
    method: 'POST',
    body: { idEmpresa: Number(idEmpresa) },
    mensagemErro: 'Erro ao favoritar',
  });
  return f.id_favorito;
}

export async function desfavoritar(idFavorito: number): Promise<void> {
  await apiFetch<void>(`/favoritos/${idFavorito}`, {
    method: 'DELETE',
    mensagemErro: 'Erro ao remover favorito',
  });
}

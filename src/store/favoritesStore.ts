import { create } from 'zustand';
import { Restaurant } from '../types';
import { useAuthStore } from './authStore';
import { listarFavoritos, favoritarEmpresa, desfavoritar } from '../services/favoriteService';

interface FavoritesState {
  favorites: Restaurant[];
  /** id do restaurante -> id do registro em USER_FAVORITO, usado para remover. */
  idsFavorito: Record<string, number>;
  loading: boolean;
  erro: string | null;
  carregar: () => Promise<void>;
  toggleFavorite: (restaurant: Restaurant) => Promise<void>;
  isFavorite: (id: string) => boolean;
  reset: () => void;
}

/**
 * A fonte de verdade dos favoritos é a API (tabela USER_FAVORITO), não o
 * armazenamento local: assim a lista acompanha o usuário entre dispositivos.
 * O store mantém apenas um cache em memória, com atualização otimista para o
 * toque no coração não esperar a ida ao servidor.
 */
const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  idsFavorito: {},
  loading: false,
  erro: null,

  carregar: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    set({ loading: true, erro: null });
    try {
      const favoritos = await listarFavoritos(userId);
      set({
        favorites: favoritos.map((f) => f.restaurant),
        idsFavorito: Object.fromEntries(favoritos.map((f) => [f.restaurant.id, f.idFavorito])),
        loading: false,
      });
    } catch (e) {
      set({ loading: false, erro: e instanceof Error ? e.message : 'Erro ao carregar favoritos' });
    }
  },

  toggleFavorite: async (restaurant) => {
    const { favorites, idsFavorito } = get();
    const favoritado = favorites.some((r) => r.id === restaurant.id);

    // Atualização otimista: a UI responde na hora e só desfaz se a API falhar.
    if (favoritado) {
      const idFavorito = idsFavorito[restaurant.id];
      const { [restaurant.id]: _, ...restantes } = idsFavorito;
      set({ favorites: favorites.filter((r) => r.id !== restaurant.id), idsFavorito: restantes });
      try {
        if (idFavorito) await desfavoritar(idFavorito);
      } catch {
        set({ favorites, idsFavorito });
      }
      return;
    }

    set({ favorites: [...favorites, restaurant] });
    try {
      const idFavorito = await favoritarEmpresa(restaurant.id);
      set((state) => ({ idsFavorito: { ...state.idsFavorito, [restaurant.id]: idFavorito } }));
    } catch {
      set({ favorites, idsFavorito });
    }
  },

  isFavorite: (id) => get().favorites.some((r) => r.id === id),

  reset: () => set({ favorites: [], idsFavorito: {}, loading: false, erro: null }),
}));

export function useFavorites() {
  return useFavoritesStore();
}

export { useFavoritesStore };

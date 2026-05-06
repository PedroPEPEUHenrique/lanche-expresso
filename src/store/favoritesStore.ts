import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Restaurant } from '../types';

interface FavoritesState {
  favorites: Restaurant[];
  toggleFavorite: (restaurant: Restaurant) => void;
  isFavorite: (id: string) => boolean;
}

const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggleFavorite: (restaurant) =>
        set((state) => {
          const exists = state.favorites.some((r) => r.id === restaurant.id);
          return {
            favorites: exists
              ? state.favorites.filter((r) => r.id !== restaurant.id)
              : [...state.favorites, restaurant],
          };
        }),
      isFavorite: (id) => get().favorites.some((r) => r.id === id),
    }),
    {
      name: 'favorites',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export function useFavorites() {
  return useFavoritesStore();
}

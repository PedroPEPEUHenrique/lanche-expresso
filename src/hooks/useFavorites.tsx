import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Restaurant } from '../data/mockData';

const STORAGE_KEY = 'favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Restaurant[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(json => {
      if (json) setFavorites(JSON.parse(json));
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  function toggleFavorite(restaurant: Restaurant) {
    setFavorites(prev => {
      const exists = prev.some(r => r.id === restaurant.id);
      return exists ? prev.filter(r => r.id !== restaurant.id) : [...prev, restaurant];
    });
  }

  function isFavorite(id: string) {
    return favorites.some(r => r.id === id);
  }

  return { favorites, toggleFavorite, isFavorite };
}
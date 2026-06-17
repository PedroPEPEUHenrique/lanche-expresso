import React, { useCallback, useEffect, useRef, useState, memo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Image, Animated, StyleSheet, FlatList, RefreshControl, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../store/cartStore';
import { useFavorites } from '../store/favoritesStore';
import { Restaurant } from '../types';
import {
  listarEmpresas,
  listarEmpresasPorCategoria,
  listarCategorias,
  ApiCategory,
} from '../services/restaurantService';

type RestaurantCardProps = {
  item: Restaurant;
  liked: boolean;
  onPress: () => void;
  onToggleFavorite: (item: Restaurant) => void;
};

const RestaurantCard = memo(({ item, liked, onPress, onToggleFavorite }: RestaurantCardProps) => {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
      <TouchableOpacity activeOpacity={1} onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress} className="flex-row items-center p-3">
        <Image source={{ uri: item.image || undefined }} className="w-20 h-20 rounded-xl bg-gray-100" />
        <View className="flex-1 ml-3">
          <Text className="text-base font-bold text-gray-800">{item.name}</Text>
          <Text className="text-xs text-gray-400 mt-1" numberOfLines={1}>{item.address}</Text>
          <View className="flex-row items-center gap-x-3 mt-2">
            <View className="flex-row items-center gap-x-1">
              <Ionicons name="bicycle-outline" size={12} color="#7EC8E3" />
              <Text className="text-xs text-gray-500">R$ {item.deliveryFee.toFixed(2)}</Text>
            </View>
            <View className="flex-row items-center gap-x-1">
              <Ionicons name="time-outline" size={12} color="#aaa" />
              <Text className="text-xs text-gray-400">30-45 min</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={() => onToggleFavorite(item)} className="p-2" hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={22} color={liked ? '#FF6B6B' : '#ccc'} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
});

export default function HomeScreen() {
  const { totalItems } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [emps, cats] = await Promise.all([listarEmpresas(), listarCategorias()]);
      setRestaurants(emps);
      setCategories(cats);
    } catch {
      // mantém dados anteriores em caso de falha
    }
  }, []);

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setSelectedCategory(null);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleCategoryPress = async (catId: string) => {
    const next = selectedCategory === catId ? null : catId;
    setSelectedCategory(next);
    setLoading(true);
    try {
      const data = next ? await listarEmpresasPorCategoria(next) : await listarEmpresas();
      setRestaurants(data);
    } catch {
      // mantém lista atual
    } finally {
      setLoading(false);
    }
  };

  const filtered = search
    ? restaurants.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
    : restaurants;

  const handlePress = useCallback(
    (item: Restaurant) =>
      router.push({ pathname: '/restaurant/[id]', params: { id: item.id, restaurant: JSON.stringify(item) } }),
    []
  );

  const renderItem = useCallback(
    ({ item }: { item: Restaurant }) => (
      <RestaurantCard item={item} liked={isFavorite(item.id)} onToggleFavorite={toggleFavorite} onPress={() => handlePress(item)} />
    ),
    [isFavorite, toggleFavorite, handlePress]
  );

  const ListHeader = (
    <>
      <View className="flex-row justify-between items-center px-5 pt-14 pb-3">
        <Image source={require('../../assets/images/logo02.png')} style={{ width: 130, height: 52 }} resizeMode="contain" />
        <TouchableOpacity onPress={() => router.push('/cart')} className="relative p-2">
          <Ionicons name="cart-outline" size={28} color="#333" />
          {totalItems > 0 && (
            <View className="absolute top-0 right-0 bg-red-400 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
              <Text className="text-white text-[10px] font-bold">{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View className="px-5 mb-5">
        <View className={`flex-row items-center h-12 rounded-2xl px-4 gap-x-2 ${searchFocused ? 'bg-sky-50 border border-brand' : 'bg-gray-100'}`}>
          <Ionicons name="search-outline" size={18} color={searchFocused ? '#7EC8E3' : '#aaa'} />
          <TextInput
            className="flex-1 text-gray-700 text-base"
            placeholder="O que vai pedir hoje?"
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={setSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="#bbb" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(cat) => cat.id}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
        className="mb-5"
        renderItem={({ item: cat }) => (
          <TouchableOpacity
            onPress={() => handleCategoryPress(cat.id)}
            className={`items-center rounded-2xl px-4 py-2 border ${selectedCategory === cat.id ? 'bg-brand border-brand' : 'bg-sky-50 border-sky-100'}`}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 26 }}>{cat.emoji}</Text>
            <Text className={`text-[11px] font-bold mt-1 ${selectedCategory === cat.id ? 'text-white' : 'text-gray-500'}`}>{cat.name.toUpperCase()}</Text>
          </TouchableOpacity>
        )}
      />

      <Text className="text-lg font-bold text-gray-800 mx-5 mb-3">
        {selectedCategory ? 'Filtrado' : 'Destaques'}
      </Text>
    </>
  );

  if (loading && restaurants.length === 0) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#7EC8E3" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <View className="items-center py-10">
            <Ionicons name="search-outline" size={48} color="#ddd" />
            <Text className="text-gray-400 mt-3 text-base">Nenhum restaurante encontrado</Text>
          </View>
        }
        ListFooterComponent={<View className="h-6" />}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7EC8E3']} tintColor="#7EC8E3" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 20, marginBottom: 12, borderRadius: 16, backgroundColor: '#fff' },
});

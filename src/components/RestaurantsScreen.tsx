import React, { useCallback, useEffect, useRef, useState, memo } from 'react';
import {
  View, Text, TouchableOpacity, Image,
  Animated, StyleSheet, FlatList, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../store/cartStore';
import { useFavorites } from '../store/favoritesStore';
import { Restaurant } from '../types';
import { listarEmpresas } from '../services/restaurantService';

type RowProps = {
  item: Restaurant;
  liked: boolean;
  onPress: () => void;
  onToggleFavorite: (item: Restaurant) => void;
};

const RestaurantRow = memo(({ item, liked, onPress, onToggleFavorite }: RowProps) => {
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
      <TouchableOpacity activeOpacity={1} onPressIn={pressIn} onPressOut={pressOut} onPress={onPress} className="flex-row items-center p-3">
        <Image source={{ uri: item.image || undefined }} className="w-20 h-20 rounded-xl bg-gray-100" />
        <View className="flex-1 ml-3">
          <Text className="text-base font-bold text-gray-800">{item.name}</Text>
          <Text className="text-xs text-gray-400 mt-1" numberOfLines={1}>{item.address}</Text>
          <View className="flex-row items-center gap-x-3 mt-2">
            <View className="flex-row items-center gap-x-1">
              <Ionicons name="bicycle-outline" size={12} color="#7EC8E3" />
              <Text className="text-xs text-gray-500">R$ {item.deliveryFee.toFixed(2)}</Text>
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

export default function RestaurantsScreen() {
  const { totalItems } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listarEmpresas()
      .then(setRestaurants)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handlePress = useCallback(
    (item: Restaurant) =>
      router.push({ pathname: '/restaurant/[id]', params: { id: item.id, restaurant: JSON.stringify(item) } }),
    []
  );

  const renderItem = useCallback(
    ({ item }: { item: Restaurant }) => (
      <RestaurantRow item={item} liked={isFavorite(item.id)} onToggleFavorite={toggleFavorite} onPress={() => handlePress(item)} />
    ),
    [isFavorite, toggleFavorite, handlePress]
  );

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row justify-between items-center px-5 pt-14 pb-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-800">Restaurantes</Text>
        <TouchableOpacity onPress={() => router.push('/cart')} className="relative p-2">
          <Ionicons name="cart-outline" size={26} color="#333" />
          {totalItems > 0 && (
            <View className="absolute top-0 right-0 bg-red-400 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
              <Text className="text-white text-[10px] font-bold">{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#7EC8E3" />
        </View>
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20, paddingTop: 8 }}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Ionicons name="storefront-outline" size={48} color="#ddd" />
              <Text className="text-gray-400 mt-3 text-base">Nenhum restaurante disponível</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 20, marginBottom: 12, borderRadius: 16, backgroundColor: '#fff' },
});

import React, { useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, Animated, StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../hooks/useCart';
import { useFavorites } from '../hooks/useFavorites';
import { restaurants } from '../data/mockData';

function RestaurantRow({ item, onPress, liked, onToggleFavorite }: any) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={onPress}
        className="flex-row items-center p-3"
      >
        <Image source={{ uri: item.image }} className="w-20 h-20 rounded-xl bg-gray-100" />
        <View className="flex-1 ml-3">
          <Text className="text-base font-bold text-gray-800">{item.name}</Text>
          <Text className="text-xs text-gray-400 mt-1">{item.address}</Text>
          <View className="flex-row items-center gap-x-3 mt-2">
            <View className="flex-row items-center gap-x-1">
              <Ionicons name="star" size={12} color="#FBBF24" />
              <Text className="text-xs font-semibold text-gray-600">{item.rating}</Text>
            </View>
            <View className="flex-row items-center gap-x-1">
              <Ionicons name="bicycle-outline" size={12} color="#7EC8E3" />
              <Text className="text-xs text-gray-500">R$ {item.deliveryFee.toFixed(2)}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => onToggleFavorite(item)}
          className="p-2"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={22}
            color={liked ? '#FF6B6B' : '#ccc'}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function RestaurantsScreen() {
  const { totalItems } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20, paddingTop: 8 }}>
        {restaurants.map((item) => (
          <RestaurantRow
            key={item.id}
            item={item}
            liked={isFavorite(item.id)}
            onToggleFavorite={toggleFavorite}
            onPress={() =>
              router.push({
                pathname: '/restaurant/[id]',
                params: { id: item.id, restaurant: JSON.stringify(item) },
              })
            }
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
});

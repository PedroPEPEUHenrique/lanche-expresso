import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFavorites } from '../hooks/useFavorites';

export default function FavoritesScreen() {
  const { favorites, toggleFavorite } = useFavorites();

  if (favorites.length === 0) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-8">
        <View className="items-center bg-red-50 rounded-full p-6 mb-5">
          <Ionicons name="heart-outline" size={56} color="#FF6B6B" />
        </View>
        <Text className="text-2xl font-extrabold text-gray-800 mb-2">Seus Favoritos</Text>
        <Text className="text-sm text-gray-400 text-center leading-5">
          Adicione restaurantes aos favoritos para vê-los aqui!
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Text className="text-2xl font-extrabold text-gray-800 mx-5 pt-14 pb-4">Favoritos</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {favorites.map(item => (
          <TouchableOpacity
            key={item.id}
            className="flex-row items-center p-3 mx-5 mb-3 bg-white rounded-2xl"
            style={{  }}
            onPress={() => router.push({ pathname: '/restaurant/[id]', params: { id: item.id, restaurant: JSON.stringify(item) } })}
          >
            <Image source={{ uri: item.image }} className="w-20 h-20 rounded-xl bg-gray-100" />
            <View className="flex-1 ml-3">
              <Text className="text-base font-bold text-gray-800">{item.name}</Text>
              <Text className="text-xs text-gray-400 mt-1">{item.address}</Text>
              <View className="flex-row items-center gap-x-1 mt-2">
                <Ionicons name="star" size={12} color="#FBBF24" />
                <Text className="text-xs font-semibold text-gray-600">{item.rating}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => toggleFavorite(item)} className="p-2">
              <Ionicons name="heart" size={22} color="#FF6B6B" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
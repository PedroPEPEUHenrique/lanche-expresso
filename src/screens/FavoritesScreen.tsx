import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FavoritesScreen() {
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

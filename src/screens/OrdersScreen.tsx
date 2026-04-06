import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function OrdersScreen() {
  return (
    <View className="flex-1 bg-white items-center justify-center px-8">
      <View className="items-center bg-sky-50 rounded-full p-6 mb-5">
        <Ionicons name="receipt-outline" size={56} color="#7EC8E3" />
      </View>
      <Text className="text-2xl font-extrabold text-gray-800 mb-2">Meus Pedidos</Text>
      <Text className="text-sm text-gray-400 text-center leading-5 mb-8">
        Nenhum pedido ainda. Que tal pedir algo agora?
      </Text>
      <TouchableOpacity
        className="bg-brand rounded-2xl px-8 py-3"
        activeOpacity={0.85}
        onPress={() => router.push('/(tabs)')}
      >
        <Text className="text-white font-bold text-base">Ver restaurantes</Text>
      </TouchableOpacity>
    </View>
  );
}

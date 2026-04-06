import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, TextInput, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../hooks/useCart';

export default function ProductDetailScreen() {
  const params = useLocalSearchParams();
  const product = JSON.parse(params.product as string);
  const restaurant = JSON.parse(params.restaurant as string);
  const { addItem } = useCart();
  const [observations, setObservations] = useState('');
  const [obsFocused, setObsFocused] = useState(false);

  const handleAdd = () => {
    addItem(product, restaurant, observations);
    router.back();
  };

  return (
    <View className="flex-1 bg-white">
      {/* Hero */}
      <Image
        source={{ uri: product.image }}
        style={styles.heroImage}
        resizeMode="cover"
      />

      {/* Botão voltar */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={20} color="#fff" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-5 pb-8">
          {/* Restaurante de origem */}
          <View className="flex-row items-center gap-x-1.5 mb-3">
            <Ionicons name="storefront-outline" size={14} color="#7EC8E3" />
            <Text className="text-xs font-semibold text-brand">{restaurant.name}</Text>
          </View>

          <Text className="text-2xl font-extrabold text-gray-800">{product.name}</Text>
          <Text className="text-sm text-gray-400 mt-2 leading-5">{product.description}</Text>

          <Text className="text-2xl font-extrabold text-brand-dark mt-4 mb-6">
            R$ {product.price.toFixed(2)}
          </Text>

          {/* Observações */}
          <Text className="text-base font-bold text-gray-800 mb-3">Observações</Text>
          <TextInput
            className={`border-[1.5px] rounded-2xl p-3 text-sm text-gray-700 bg-sky-50 ${
              obsFocused ? 'border-brand' : 'border-gray-200'
            }`}
            style={styles.obsInput}
            multiline
            numberOfLines={5}
            placeholder="Ex: sem cebola, ponto da carne bem passado..."
            placeholderTextColor="#bbb"
            value={observations}
            onChangeText={setObservations}
            onFocus={() => setObsFocused(true)}
            onBlur={() => setObsFocused(false)}
            textAlignVertical="top"
          />

          {/* Botão adicionar */}
          <TouchableOpacity
            className="mt-6 bg-brand rounded-2xl h-14 items-center justify-center flex-row gap-x-2"
            onPress={handleAdd}
            activeOpacity={0.85}
          >
            <Ionicons name="cart-outline" size={20} color="#fff" />
            <Text className="text-white text-base font-bold">
              Adicionar ao Carrinho — R$ {product.price.toFixed(2)}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  heroImage: {
    width: '100%',
    height: 260,
    backgroundColor: '#111',
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  obsInput: {
    height: 110,
  },
});

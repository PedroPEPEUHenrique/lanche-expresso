import React, { useRef, useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  Image, Animated, StyleSheet, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../hooks/useCart';
import { useFavorites } from '../hooks/useFavorites';
import { restaurants, categories } from '../data/mockData';

function RestaurantCard({ item, onPress, liked, onToggleFavorite }: any) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
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
            <View className="flex-row items-center gap-x-1">
              <Ionicons name="time-outline" size={12} color="#aaa" />
              <Text className="text-xs text-gray-400">30-45 min</Text>
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

export default function HomeScreen() {
  const { totalItems } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    router.push('/(tabs)/restaurants');
    setRefreshing(false);
  };

  const filtered = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 pt-14 pb-3">
        <Image
          source={require('../../assets/images/logo02.png')}
          style={{ width: 130, height: 52 }}
          resizeMode="contain"
        />
        <TouchableOpacity
          onPress={() => router.push('/cart')}
          className="relative p-2"
        >
          <Ionicons name="cart-outline" size={28} color="#333" />
          {totalItems > 0 && (
            <View className="absolute top-0 right-0 bg-red-400 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
              <Text className="text-white text-[10px] font-bold">{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#7EC8E3']}
            tintColor="#7EC8E3"
          />
        }
      >
        {/* Busca */}
        <View className="px-5 mb-5">
          <View
            className={`flex-row items-center h-12 rounded-2xl px-4 gap-x-2 ${
              searchFocused ? 'bg-sky-50 border border-brand' : 'bg-gray-100'
            }`}
          >
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

        {/* Categorias */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-5"
          contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
        >
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              className="items-center bg-sky-50 rounded-2xl px-4 py-2 border border-sky-100"
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 28 }}>{cat.emoji}</Text>
              <Text className="text-[11px] font-bold text-gray-500 mt-1">{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Destaques */}
        <Text className="text-lg font-bold text-gray-800 mx-5 mb-3">Destaques</Text>

        {filtered.map((item) => (
          <RestaurantCard
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

        {filtered.length === 0 && (
          <View className="items-center py-10">
            <Ionicons name="search-outline" size={48} color="#ddd" />
            <Text className="text-gray-400 mt-3 text-base">Nenhum restaurante encontrado</Text>
          </View>
        )}

        <View className="h-6" />
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
});

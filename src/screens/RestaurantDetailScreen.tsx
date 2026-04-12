import React, { useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, Animated, StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../hooks/useCart';

export default function RestaurantDetailScreen() {
  const params = useLocalSearchParams();
  const restaurant = JSON.parse(params.restaurant as string);
  const { addItem, totalItems } = useCart();
  const scrollY = useRef(new Animated.Value(0)).current;

  const imageHeight = scrollY.interpolate({
    inputRange: [0, 130],
    outputRange: [230, 80],
    extrapolate: 'clamp',
  });

  return (
    <View className="flex-1 bg-white">
      {/* Hero image animada */}
      <Animated.Image
        source={{ uri: restaurant.image }}
        style={[styles.heroImage, { height: imageHeight }]}
        resizeMode="cover"
      />

      {/* Botão voltar */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={20} color="#fff" />
      </TouchableOpacity>

      {/* Botão carrinho */}
      <TouchableOpacity
        style={styles.cartBtnFixed}
        onPress={() => router.push('/cart')}
      >
        <Ionicons name="cart-outline" size={20} color="#fff" />
        {totalItems > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{totalItems}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 230 }}
      >
        <View className="bg-white rounded-t-3xl px-5 pt-5 min-h-[500px]" style={styles.contentShadow}>
          {/* Info restaurante */}
          <Text className="text-2xl font-extrabold text-gray-800">{restaurant.name}</Text>
          <Text className="text-sm text-gray-400 mt-1">{restaurant.address}</Text>

          {/* Tags de info */}
          <View className="flex-row flex-wrap gap-2 mt-3 mb-2">
            <View className="flex-row items-center bg-amber-50 border border-amber-100 rounded-xl px-3 py-1.5 gap-x-1">
              <Ionicons name="star" size={13} color="#FBBF24" />
              <Text className="text-xs font-bold text-amber-600">{restaurant.rating}</Text>
            </View>
            <View className="flex-row items-center bg-sky-50 border border-sky-100 rounded-xl px-3 py-1.5 gap-x-1">
              <Ionicons name="bicycle-outline" size={13} color="#7EC8E3" />
              <Text className="text-xs font-semibold text-sky-600">R$ {restaurant.deliveryFee.toFixed(2)}</Text>
            </View>
            <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5 gap-x-1">
              <Ionicons name="time-outline" size={13} color="#aaa" />
              <Text className="text-xs text-gray-500">30–45 min</Text>
            </View>
          </View>

          <Text className="text-lg font-bold text-gray-800 mt-4 mb-3">Ofertas</Text>

          {/* Produtos */}
          {restaurant.products.map((product: any) => (
            <TouchableOpacity
              key={product.id}
              className="flex-row mb-4 p-3 rounded-2xl bg-gray-50"
              style={styles.productCard}
              activeOpacity={0.85}
              onPress={() =>
                router.push({
                  pathname: '/product/[id]',
                  params: {
                    id: product.id,
                    product: JSON.stringify(product),
                    restaurant: JSON.stringify(restaurant),
                  },
                })
              }
            >
              <Image
                source={{ uri: product.image }}
                className="w-[85px] h-[85px] rounded-xl bg-gray-200"
              />
              <View className="flex-1 ml-3 justify-between">
                <View>
                  <Text className="text-sm font-bold text-gray-800">{product.name}</Text>
                  <Text className="text-xs text-gray-400 mt-1 leading-4" numberOfLines={2}>
                    {product.description}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between mt-2">
                  <Text className="text-base font-extrabold text-brand-dark">
                    R$ {product.price.toFixed(2)}
                  </Text>
                  <TouchableOpacity
                    className="bg-brand rounded-xl px-3 py-1.5 flex-row items-center gap-x-1"
                    onPress={() => addItem(product, restaurant)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="add" size={14} color="#fff" />
                    <Text className="text-white text-xs font-bold">Adicionar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          <View className="h-10" />
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  heroImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 20,
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBtnFixed: {
    position: 'absolute',
    top: 50,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 20,
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  contentShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 5,
  },
  productCard: {
  },
});

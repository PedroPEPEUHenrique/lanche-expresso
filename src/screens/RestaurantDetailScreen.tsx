import React, { useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, Animated,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCart } from '../hooks/useCart';

export default function RestaurantDetailScreen() {
  const params = useLocalSearchParams();
  const restaurant = JSON.parse(params.restaurant as string);
  const { addItem, totalItems } = useCart();
  const scrollY = useRef(new Animated.Value(0)).current;

  const imageHeight = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [220, 80],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <Animated.Image
        source={{ uri: restaurant.image }}
        style={[styles.heroImage, { height: imageHeight }]}
        resizeMode="cover"
      />

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cartBtnFixed} onPress={() => router.push('/cart')}>
        <Text style={styles.cartIcon}>🛒</Text>
        {totalItems > 0 && (
          <View style={styles.badge}><Text style={styles.badgeText}>{totalItems}</Text></View>
        )}
      </TouchableOpacity>

      <Animated.ScrollView
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 220 }}
      >
        <View style={styles.content}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <Text style={styles.restaurantAddress}>{restaurant.address}</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoTag}>⭐ {restaurant.rating}</Text>
            <Text style={styles.infoTag}>🚴 R$ {restaurant.deliveryFee.toFixed(2)}</Text>
            <Text style={styles.infoTag}>⏱ 30-45 min</Text>
          </View>

          <Text style={styles.sectionTitle}>Ofertas</Text>

          {restaurant.products.map((product: any) => (
            <View key={product.id} style={styles.productCard}>
              <Image source={{ uri: product.image }} style={styles.productImage} />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productDesc}>{product.description}</Text>
                <View style={styles.productFooter}>
                  <Text style={styles.productPrice}>R$ {product.price.toFixed(2)}</Text>
                  <TouchableOpacity style={styles.addBtn} onPress={() => addItem(product, restaurant)} activeOpacity={0.8}>
                    <Text style={styles.addBtnText}>+ Adicionar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          <View style={{ height: 40 }} />
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  heroImage: { position: 'absolute', top: 0, left: 0, right: 0, width: '100%' },
  backBtn: {
    position: 'absolute', top: 50, left: 16, zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20,
    width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
  },
  backText: { color: '#fff', fontSize: 20, marginTop: -2 },
  cartBtnFixed: {
    position: 'absolute', top: 50, right: 16, zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20,
    width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
  },
  cartIcon: { fontSize: 18 },
  badge: {
    position: 'absolute', top: -2, right: -2,
    backgroundColor: '#FF6B6B', borderRadius: 8,
    minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  content: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: 20, paddingTop: 20, minHeight: 500,
  },
  restaurantName: { fontSize: 22, fontWeight: '800', color: '#222' },
  restaurantAddress: { fontSize: 13, color: '#888', marginTop: 4 },
  infoRow: { flexDirection: 'row', gap: 10, marginTop: 12, marginBottom: 8 },
  infoTag: {
    backgroundColor: '#f2f2f2', borderRadius: 8, paddingHorizontal: 10,
    paddingVertical: 4, fontSize: 12, color: '#555',
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#222', marginTop: 16, marginBottom: 12 },
  productCard: {
    flexDirection: 'row', marginBottom: 14, padding: 10,
    borderRadius: 12, backgroundColor: '#fafafa',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  productImage: { width: 80, height: 80, borderRadius: 10, backgroundColor: '#eee' },
  productInfo: { flex: 1, marginLeft: 12 },
  productName: { fontSize: 15, fontWeight: '700', color: '#222' },
  productDesc: { fontSize: 12, color: '#888', marginTop: 3 },
  productFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  productPrice: { fontSize: 15, fontWeight: '700', color: '#5BB5D5' },
  addBtn: { backgroundColor: '#7EC8E3', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});

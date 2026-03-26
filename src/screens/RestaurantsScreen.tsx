import React, { useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, Animated,
} from 'react-native';
import { router } from 'expo-router';
import { useCart } from '../hooks/useCart';
import { restaurants } from '../data/mockData';

function RestaurantRow({ item, onPress }: any) {
  const scale = useRef(new Animated.Value(1)).current;
  const [liked, setLiked] = useState(false);

  const pressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={onPress}
        style={styles.cardInner}
      >
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardAddress}>{item.address}</Text>
        </View>
        <TouchableOpacity onPress={() => setLiked(l => !l)} style={styles.heartBtn}>
          <Text style={[styles.heart, liked && styles.heartFilled]}>{liked ? '♥' : '♡'}</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function RestaurantsScreen() {
  const { totalItems } = useCart();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Restaurantes</Text>
        <TouchableOpacity onPress={() => router.push('/cart')} style={styles.cartBtn}>
          <Text style={styles.cartIcon}>🛒</Text>
          {totalItems > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {restaurants.map((item) => (
          <RestaurantRow
            key={item.id}
            item={item}
            onPress={() => router.push({ pathname: '/restaurant/[id]', params: { id: item.id, restaurant: JSON.stringify(item) } })}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#222' },
  cartBtn: { position: 'relative', padding: 4 },
  cartIcon: { fontSize: 24 },
  badge: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: '#FF6B6B', borderRadius: 8,
    minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  card: {
    marginHorizontal: 20, marginBottom: 12, borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  cardInner: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  cardImage: { width: 72, height: 72, borderRadius: 10, backgroundColor: '#eee' },
  cardInfo: { flex: 1, marginLeft: 12 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#222' },
  cardAddress: { fontSize: 12, color: '#888', marginTop: 3 },
  heartBtn: { padding: 6 },
  heart: { fontSize: 22, color: '#ccc' },
  heartFilled: { color: '#FF6B6B' },
});

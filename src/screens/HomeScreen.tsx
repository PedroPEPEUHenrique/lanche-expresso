import React, { useRef, useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, Image, Animated,
} from 'react-native';
import { router } from 'expo-router';
import { useCart } from '../hooks/useCart';
import { restaurants, categories } from '../data/mockData';

function RestaurantCard({ item, onPress }: any) {
  const scale = useRef(new Animated.Value(1)).current;
  const [liked, setLiked] = useState(false);

  const onPressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        style={styles.cardInner}
      >
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardAddress}>{item.address}</Text>
        </View>
        <TouchableOpacity onPress={() => setLiked(l => !l)} style={styles.heartBtn}>
          <Text style={[styles.heart, liked && styles.heartFilled]}>
            {liked ? '♥' : '♡'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const { totalItems } = useCart();
  const [search, setSearch] = useState('');

  const filtered = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.logoTop}>RASSI FOOD</Text>
          <Text style={styles.logoBottom}>EXPRESS</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/cart')} style={styles.cartBtn}>
          <Text style={styles.cartIcon}>🛒</Text>
          {totalItems > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="O que vai pedir hoje?"
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll} contentContainerStyle={styles.categoriesContent}>
          {categories.map(cat => (
            <TouchableOpacity key={cat.id} style={styles.categoryItem} activeOpacity={0.7}>
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text style={styles.categoryName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Destaques</Text>

        {filtered.map((item, index) => (
          <RestaurantCard
            key={item.id}
            item={item}
            index={index}
            onPress={() => router.push({ pathname: '/restaurant/[id]', params: { id: item.id, restaurant: JSON.stringify(item) } })}
          />
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12,
  },
  logoTop: { fontSize: 20, fontWeight: '900', color: '#7EC8E3', letterSpacing: 2 },
  logoBottom: { fontSize: 12, fontWeight: '700', color: '#5BB5D5', letterSpacing: 5, marginTop: -3 },
  cartBtn: { position: 'relative', padding: 4 },
  cartIcon: { fontSize: 24 },
  badge: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: '#FF6B6B', borderRadius: 8,
    minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  searchContainer: { paddingHorizontal: 20, marginBottom: 20 },
  searchInput: {
    height: 46, borderRadius: 12, backgroundColor: '#f2f2f2',
    paddingHorizontal: 16, fontSize: 15, color: '#333',
  },
  categoriesScroll: { marginBottom: 16 },
  categoriesContent: { paddingHorizontal: 20, gap: 20 },
  categoryItem: { alignItems: 'center', marginRight: 8 },
  categoryEmoji: { fontSize: 36 },
  categoryName: { fontSize: 11, fontWeight: '700', color: '#555', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#222', marginLeft: 20, marginBottom: 12 },
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

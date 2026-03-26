import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, TextInput,
} from 'react-native';
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
    <View style={styles.container}>
      {}
      <Image source={{ uri: product.image }} style={styles.heroImage} resizeMode="cover" />

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productDesc}>{product.description}</Text>

          <Text style={styles.price}>R$ {product.price.toFixed(2)}</Text>

          <Text style={styles.label}>Observações</Text>
          <TextInput
            style={[styles.obsInput, obsFocused && styles.obsInputFocused]}
            multiline
            numberOfLines={5}
            placeholder="Alguma observação? Ex: sem cebola, ponto da carne..."
            placeholderTextColor="#aaa"
            value={observations}
            onChangeText={setObservations}
            onFocus={() => setObsFocused(true)}
            onBlur={() => setObsFocused(false)}
            textAlignVertical="top"
          />

          <TouchableOpacity style={styles.addBtn} onPress={handleAdd} activeOpacity={0.85}>
            <Text style={styles.addBtnText}>Adicionar ao Carrinho — R$ {product.price.toFixed(2)}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  heroImage: { width: '100%', height: 260, backgroundColor: '#111' },
  backBtn: {
    position: 'absolute', top: 50, left: 16, zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20,
    width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
  },
  backText: { color: '#fff', fontSize: 20, marginTop: -2 },
  content: { padding: 20 },
  productName: { fontSize: 22, fontWeight: '800', color: '#222' },
  productDesc: { fontSize: 14, color: '#888', marginTop: 6, lineHeight: 20 },
  price: { fontSize: 20, fontWeight: '700', color: '#5BB5D5', marginTop: 12, marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '700', color: '#222', marginBottom: 10 },
  obsInput: {
    borderWidth: 1.5, borderColor: '#ccc', borderRadius: 10,
    padding: 12, fontSize: 14, color: '#333', backgroundColor: '#f7fbfd',
    height: 120,
  },
  obsInputFocused: { borderColor: '#7EC8E3' },
  addBtn: {
    marginTop: 24, backgroundColor: '#7EC8E3', borderRadius: 12,
    height: 52, alignItems: 'center', justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

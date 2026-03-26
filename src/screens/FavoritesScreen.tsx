import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function FavoritesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>♡</Text>
      <Text style={styles.title}>Seus Favoritos</Text>
      <Text style={styles.subtitle}>Adicione restaurantes aos favoritos para vê-los aqui!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 32 },
  emoji: { fontSize: 60, color: '#FF6B6B', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#222', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#aaa', textAlign: 'center' },
});

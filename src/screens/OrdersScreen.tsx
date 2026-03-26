import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function OrdersScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>📋</Text>
      <Text style={styles.title}>Meus Pedidos</Text>
      <Text style={styles.subtitle}>Nenhum pedido ainda. Que tal pedir algo agora?</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 32 },
  emoji: { fontSize: 60, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#222', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#aaa', textAlign: 'center' },
});

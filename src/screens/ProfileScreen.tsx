import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

const options = [
  { icon: '📍', title: 'Endereço', subtitle: 'Meu endereço de entrega' },
  { icon: '📊', title: 'Meus dados', subtitle: 'Informações da minha conta' },
  { icon: '🔒', title: 'Desconectar', subtitle: 'Desconectar usuário', danger: true },
];

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.logoTop}>RASSI FOOD</Text>
          <Text style={styles.logoBottom}>EXPRESS</Text>
        </View>
      </View>

      <Text style={styles.title}>Meu Perfil</Text>

      <View style={styles.optionsList}>
        {options.map(opt => (
          <TouchableOpacity
            key={opt.title}
            style={styles.optionItem}
            activeOpacity={0.7}
            onPress={() => {
              if (opt.danger) router.replace('/');
            }}
          >
            <Text style={styles.optionIcon}>{opt.icon}</Text>
            <View style={styles.optionText}>
              <Text style={[styles.optionTitle, opt.danger && { color: '#FF6B6B' }]}>{opt.title}</Text>
              <Text style={styles.optionSubtitle}>{opt.subtitle}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12, alignItems: 'center' },
  logoTop: { fontSize: 22, fontWeight: '900', color: '#7EC8E3', letterSpacing: 3, textAlign: 'center' },
  logoBottom: { fontSize: 13, fontWeight: '700', color: '#5BB5D5', letterSpacing: 6, textAlign: 'center' },
  title: { fontSize: 22, fontWeight: '600', color: '#333', textAlign: 'center', marginTop: 24, marginBottom: 32 },
  optionsList: { paddingHorizontal: 28 },
  optionItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 20,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  optionIcon: { fontSize: 28, marginRight: 16 },
  optionText: { flex: 1 },
  optionTitle: { fontSize: 17, fontWeight: '700', color: '#222' },
  optionSubtitle: { fontSize: 13, color: '#999', marginTop: 2 },
});

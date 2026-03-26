import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
  Dimensions, TouchableWithoutFeedback,
} from 'react-native';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function AddressScreen() {
  const [focused, setFocused] = useState<string | null>(null);
  const [form, setForm] = useState({ endereco: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', cep: '' });

  const inputStyle = (field: string) => [styles.input, focused === field && styles.inputFocused];
  const set = (field: string) => (val: string) => setForm(f => ({ ...f, [field]: val }));

  const handleTap = (x: number) => {
    if (x > width / 2) {
      router.replace('/(tabs)');
    } else {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableWithoutFeedback onPress={(e) => handleTap(e.nativeEvent.locationX)}>
        <View style={styles.tapOverlay} pointerEvents="box-none" />
      </TouchableWithoutFeedback>

      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <View style={styles.logoContainer}>
          <Text style={styles.logoTop}>RASSI FOOD</Text>
          <Text style={styles.logoBottom}>EXPRESS</Text>
        </View>

        <Text style={styles.title}>Informe seu endereço</Text>

        <View style={styles.row}>
          <View style={{ flex: 1.8, marginRight: 10 }}>
            <Text style={styles.label}>Endereço</Text>
            <TextInput style={inputStyle('endereco')} value={form.endereco} onChangeText={set('endereco')}
              onFocus={() => setFocused('endereco')} onBlur={() => setFocused(null)} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Número</Text>
            <TextInput style={inputStyle('numero')} value={form.numero} onChangeText={set('numero')}
              keyboardType="number-pad" onFocus={() => setFocused('numero')} onBlur={() => setFocused(null)} />
          </View>
        </View>

        <Text style={styles.label}>Complemento</Text>
        <TextInput style={inputStyle('complemento')} value={form.complemento} onChangeText={set('complemento')}
          onFocus={() => setFocused('complemento')} onBlur={() => setFocused(null)} />

        <Text style={[styles.label, { marginTop: 12 }]}>Bairro</Text>
        <TextInput style={inputStyle('bairro')} value={form.bairro} onChangeText={set('bairro')}
          onFocus={() => setFocused('bairro')} onBlur={() => setFocused(null)} />

        <View style={[styles.row, { marginTop: 12 }]}>
          <View style={{ flex: 1.8, marginRight: 10 }}>
            <Text style={styles.label}>Cidade</Text>
            <TextInput style={inputStyle('cidade')} value={form.cidade} onChangeText={set('cidade')}
              onFocus={() => setFocused('cidade')} onBlur={() => setFocused(null)} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>UF</Text>
            <TextInput style={inputStyle('uf')} value={form.uf} onChangeText={set('uf')}
              autoCapitalize="characters" maxLength={2}
              onFocus={() => setFocused('uf')} onBlur={() => setFocused(null)} />
          </View>
        </View>

        <Text style={[styles.label, { marginTop: 12 }]}>CEP</Text>
        <TextInput style={inputStyle('cep')} value={form.cep} onChangeText={set('cep')}
          keyboardType="number-pad" maxLength={9}
          onFocus={() => setFocused('cep')} onBlur={() => setFocused(null)} />

        <TouchableOpacity style={styles.button} activeOpacity={0.85}
          onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.buttonText}>Próximo Passo</Text>
        </TouchableOpacity>

        <View style={styles.hintRow}>
          <Text style={styles.hintText}>← voltar</Text>
          <Text style={styles.hintText}>avançar →</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  tapOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 0 },
  inner: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 50, paddingBottom: 40, zIndex: 1 },
  logoContainer: { alignItems: 'center', marginBottom: 24 },
  logoTop: { fontSize: 28, fontWeight: '900', color: '#7EC8E3', letterSpacing: 3 },
  logoBottom: { fontSize: 16, fontWeight: '700', color: '#5BB5D5', letterSpacing: 6, marginTop: -4 },
  title: { fontSize: 18, fontWeight: '500', color: '#333', textAlign: 'center', marginBottom: 20 },
  label: { fontSize: 14, color: '#333', marginBottom: 5 },
  input: {
    height: 48, borderWidth: 1.5, borderColor: '#ccc',
    borderRadius: 8, paddingHorizontal: 12, backgroundColor: '#f7fbfd', fontSize: 15, marginBottom: 2,
  },
  inputFocused: { borderColor: '#7EC8E3' },
  row: { flexDirection: 'row', alignItems: 'flex-end' },
  button: {
    marginTop: 28, backgroundColor: '#7EC8E3', borderRadius: 10,
    height: 50, alignItems: 'center', justifyContent: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  hintRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: 20, opacity: 0.3,
  },
  hintText: { fontSize: 12, color: '#999' },
});

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  const handleTap = (x: number) => {
    if (x > width / 2) {
      // Lado direito → avançar (entrar)
      router.replace('/(tabs)');
    }
    // Lado esquerdo → não faz nada (já é a primeira tela)
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Zonas de toque laterais */}
      <TouchableWithoutFeedback onPress={(e) => handleTap(e.nativeEvent.locationX)}>
        <View style={styles.tapOverlay} pointerEvents="box-none" />
      </TouchableWithoutFeedback>

      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <View style={styles.logoContainer}>
          <Text style={styles.logoTop}>RASSI FOOD</Text>
          <Text style={styles.logoBottom}>EXPRESS</Text>
        </View>

        <Text style={styles.title}>Acesse sua conta</Text>

        <View style={styles.form}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={[styles.input, emailFocused && styles.inputFocused]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            placeholderTextColor="#bbb"
          />

          <Text style={[styles.label, { marginTop: 16 }]}>Senha</Text>
          <TextInput
            style={[styles.input, passFocused && styles.inputFocused]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            onFocus={() => setPassFocused(true)}
            onBlur={() => setPassFocused(false)}
            placeholderTextColor="#bbb"
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.85}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.buttonText}>Acessar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/register')} activeOpacity={0.7}>
          <Text style={styles.linkText}>Criar minha conta</Text>
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
  tapOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  inner: { flexGrow: 1, paddingHorizontal: 32, paddingTop: 80, paddingBottom: 40, zIndex: 1 },
  logoContainer: { alignItems: 'center', marginBottom: 48 },
  logoTop: { fontSize: 28, fontWeight: '900', color: '#7EC8E3', letterSpacing: 3 },
  logoBottom: { fontSize: 16, fontWeight: '700', color: '#5BB5D5', letterSpacing: 6, marginTop: -4 },
  title: { fontSize: 18, fontWeight: '500', color: '#333', textAlign: 'center', marginBottom: 32 },
  form: { width: '100%' },
  label: { fontSize: 14, color: '#333', marginBottom: 6 },
  input: {
    width: '100%', height: 48, borderWidth: 1.5, borderColor: '#ccc',
    borderRadius: 8, paddingHorizontal: 14, backgroundColor: '#f7fbfd', fontSize: 15,
  },
  inputFocused: { borderColor: '#7EC8E3' },
  button: {
    marginTop: 48, backgroundColor: '#7EC8E3', borderRadius: 10,
    height: 50, alignItems: 'center', justifyContent: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkText: { textAlign: 'center', marginTop: 20, color: '#555', fontSize: 15 },
  hintRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: 32, opacity: 0.3,
  },
  hintText: { fontSize: 12, color: '#999' },
});

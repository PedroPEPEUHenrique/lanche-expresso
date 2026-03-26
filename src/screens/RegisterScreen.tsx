import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
  Dimensions, TouchableWithoutFeedback,
} from 'react-native';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [focused, setFocused] = useState<string | null>(null);

  const inputStyle = (field: string) => [
    styles.input,
    focused === field && styles.inputFocused,
  ];

  const handleTap = (x: number) => {
    if (x > width / 2) {
      router.push('/address');
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

        <Text style={styles.title}>Criar sua conta</Text>

        <View style={styles.form}>
          {[
            { label: 'Nome completo', value: name, setter: setName, field: 'name', keyboard: 'default' as const },
            { label: 'E-mail', value: email, setter: setEmail, field: 'email', keyboard: 'email-address' as const },
            { label: 'Whatsapp', value: whatsapp, setter: setWhatsapp, field: 'whatsapp', keyboard: 'phone-pad' as const },
            { label: 'Senha', value: password, setter: setPassword, field: 'password', keyboard: 'default' as const },
          ].map(({ label, value, setter, field, keyboard }) => (
            <View key={field} style={{ marginBottom: 14 }}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={inputStyle(field)}
                value={value}
                onChangeText={setter}
                keyboardType={keyboard}
                secureTextEntry={field === 'password'}
                autoCapitalize={field === 'name' ? 'words' : 'none'}
                onFocus={() => setFocused(field)}
                onBlur={() => setFocused(null)}
                placeholderTextColor="#bbb"
              />
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.85}
          onPress={() => router.push('/address')}
        >
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
  inner: { flexGrow: 1, paddingHorizontal: 32, paddingTop: 60, paddingBottom: 40, zIndex: 1 },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logoTop: { fontSize: 28, fontWeight: '900', color: '#7EC8E3', letterSpacing: 3 },
  logoBottom: { fontSize: 16, fontWeight: '700', color: '#5BB5D5', letterSpacing: 6, marginTop: -4 },
  title: { fontSize: 18, fontWeight: '500', color: '#333', textAlign: 'center', marginBottom: 24 },
  form: { width: '100%' },
  label: { fontSize: 14, color: '#333', marginBottom: 6 },
  input: {
    width: '100%', height: 48, borderWidth: 1.5, borderColor: '#ccc',
    borderRadius: 8, paddingHorizontal: 14, backgroundColor: '#f7fbfd', fontSize: 15,
  },
  inputFocused: { borderColor: '#7EC8E3' },
  button: {
    marginTop: 24, backgroundColor: '#7EC8E3', borderRadius: 10,
    height: 50, alignItems: 'center', justifyContent: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  hintRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: 24, opacity: 0.3,
  },
  hintText: { fontSize: 12, color: '#999' },
});

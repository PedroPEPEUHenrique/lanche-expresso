import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { atualizarUsuario } from '../services/userService';

export default function AddressScreen() {
  const [focused, setFocused] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    endereco: '', numero: '', complemento: '',
    bairro: '', cidade: '', uf: '', cep: '',
  });
  const { user, updateUser } = useAuthStore();

  const set = (field: string) => (val: string) => setForm((f) => ({ ...f, [field]: val }));

  const inputClass = (field: string) =>
    `flex-row items-center h-12 border-[1.5px] rounded-xl px-3 bg-sky-50 ${
      focused === field ? 'border-brand' : 'border-gray-200'
    }`;

  const handleConcluir = async () => {
    if (!user) { router.replace('/'); return; }
    setLoading(true);
    try {
      const updated = await atualizarUsuario(user.id, {
        endereco: form.endereco,
        numero: form.numero,
        complemento: form.complemento,
        bairro: form.bairro,
        cidade: form.cidade,
        estado: form.uf,
        cep: form.cep,
      });
      updateUser(updated);
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Não foi possível salvar o endereço.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-white" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View className="flex-1 px-7 pt-12 pb-10">
          <View className="items-center mb-5">
            <Image source={require('../../assets/images/logo02.png')} style={{ width: 160, height: 72 }} resizeMode="contain" />
          </View>

          <Text className="text-lg text-gray-500 text-center mb-5 font-medium">Informe seu endereço</Text>

          <View className="gap-y-3">
            <View className="flex-row gap-x-3">
              <View className="flex-[1.8]">
                <Text className="text-sm font-semibold text-gray-600 mb-1.5">Endereço</Text>
                <View className={inputClass('endereco')}>
                  <Ionicons name="location-outline" size={16} color={focused === 'endereco' ? '#7EC8E3' : '#aaa'} />
                  <TextInput className="flex-1 ml-2 text-gray-800 text-sm" value={form.endereco} onChangeText={set('endereco')} onFocus={() => setFocused('endereco')} onBlur={() => setFocused(null)} placeholderTextColor="#bbb" />
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-600 mb-1.5">Número</Text>
                <View className={inputClass('numero')}>
                  <TextInput className="flex-1 text-gray-800 text-sm" value={form.numero} onChangeText={set('numero')} keyboardType="number-pad" onFocus={() => setFocused('numero')} onBlur={() => setFocused(null)} placeholderTextColor="#bbb" />
                </View>
              </View>
            </View>

            <View>
              <Text className="text-sm font-semibold text-gray-600 mb-1.5">Complemento</Text>
              <View className={inputClass('complemento')}>
                <Ionicons name="business-outline" size={16} color={focused === 'complemento' ? '#7EC8E3' : '#aaa'} />
                <TextInput className="flex-1 ml-2 text-gray-800 text-sm" value={form.complemento} onChangeText={set('complemento')} onFocus={() => setFocused('complemento')} onBlur={() => setFocused(null)} placeholder="Apto, bloco, ref..." placeholderTextColor="#bbb" />
              </View>
            </View>

            <View>
              <Text className="text-sm font-semibold text-gray-600 mb-1.5">Bairro</Text>
              <View className={inputClass('bairro')}>
                <Ionicons name="map-outline" size={16} color={focused === 'bairro' ? '#7EC8E3' : '#aaa'} />
                <TextInput className="flex-1 ml-2 text-gray-800 text-sm" value={form.bairro} onChangeText={set('bairro')} onFocus={() => setFocused('bairro')} onBlur={() => setFocused(null)} placeholderTextColor="#bbb" />
              </View>
            </View>

            <View className="flex-row gap-x-3">
              <View className="flex-[1.8]">
                <Text className="text-sm font-semibold text-gray-600 mb-1.5">Cidade</Text>
                <View className={inputClass('cidade')}>
                  <TextInput className="flex-1 text-gray-800 text-sm" value={form.cidade} onChangeText={set('cidade')} onFocus={() => setFocused('cidade')} onBlur={() => setFocused(null)} placeholderTextColor="#bbb" />
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-600 mb-1.5">UF</Text>
                <View className={inputClass('uf')}>
                  <TextInput className="flex-1 text-gray-800 text-sm text-center" value={form.uf} onChangeText={set('uf')} autoCapitalize="characters" maxLength={2} onFocus={() => setFocused('uf')} onBlur={() => setFocused(null)} placeholderTextColor="#bbb" />
                </View>
              </View>
            </View>

            <View>
              <Text className="text-sm font-semibold text-gray-600 mb-1.5">CEP</Text>
              <View className={inputClass('cep')}>
                <Ionicons name="barcode-outline" size={16} color={focused === 'cep' ? '#7EC8E3' : '#aaa'} />
                <TextInput className="flex-1 ml-2 text-gray-800 text-sm" value={form.cep} onChangeText={set('cep')} keyboardType="number-pad" maxLength={9} onFocus={() => setFocused('cep')} onBlur={() => setFocused(null)} placeholder="00000-000" placeholderTextColor="#bbb" />
              </View>
            </View>
          </View>

          <TouchableOpacity
            className="mt-8 bg-brand rounded-2xl h-14 items-center justify-center"
            activeOpacity={0.85}
            onPress={handleConcluir}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-base font-bold tracking-wide">Concluir Cadastro</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/(tabs)')} className="mt-3 items-center py-2">
            <Text className="text-gray-400 text-base">Pular por agora</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

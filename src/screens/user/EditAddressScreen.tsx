import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  ScrollView, KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function EditAddressScreen() {
  const [focused, setFocused] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    endereco: 'Rua das Flores',
    numero: '123',
    complemento: 'Apto 45',
    bairro: 'Centro',
    cidade: 'São Paulo',
    uf: 'SP',
    cep: '01310-100',
  });

  const set = (field: string) => (val: string) => setForm(f => ({ ...f, [field]: val }));

  const inputClass = (field: string) =>
    `flex-row items-center h-12 border-[1.5px] rounded-xl px-3 bg-sky-50 ${
      focused === field ? 'border-brand' : 'border-gray-200'
    }`;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      router.back();
    }, 800);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View className="flex-row items-center px-5 pt-14 pb-4 border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center mr-4"
        >
          <Ionicons name="arrow-back" size={20} color="#333" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800 flex-1">Endereço de Entrega</Text>
        <Image
          source={require('../../../assets/images/logo02.png')}
          style={{ width: 80, height: 34 }}
          resizeMode="contain"
        />
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pt-6 pb-10">
          {/* Ícone decorativo */}
          <View className="items-center mb-6">
            <View className="w-16 h-16 rounded-full bg-sky-100 items-center justify-center">
              <Ionicons name="location" size={32} color="#7EC8E3" />
            </View>
            <Text className="text-sm text-gray-400 mt-2 text-center">
              Seu endereço de entrega cadastrado
            </Text>
          </View>

          <View className="gap-y-3">
            {/* Endereço + Número */}
            <View className="flex-row gap-x-3">
              <View className="flex-[1.8]">
                <Text className="text-sm font-semibold text-gray-600 mb-1.5">Endereço</Text>
                <View className={inputClass('endereco')}>
                  <Ionicons name="location-outline" size={16} color={focused === 'endereco' ? '#7EC8E3' : '#aaa'} />
                  <TextInput
                    className="flex-1 ml-2 text-gray-800 text-sm"
                    value={form.endereco}
                    onChangeText={set('endereco')}
                    onFocus={() => setFocused('endereco')}
                    onBlur={() => setFocused(null)}
                    placeholderTextColor="#bbb"
                  />
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-600 mb-1.5">Número</Text>
                <View className={inputClass('numero')}>
                  <TextInput
                    className="flex-1 text-gray-800 text-sm"
                    value={form.numero}
                    onChangeText={set('numero')}
                    keyboardType="number-pad"
                    onFocus={() => setFocused('numero')}
                    onBlur={() => setFocused(null)}
                    placeholderTextColor="#bbb"
                  />
                </View>
              </View>
            </View>

            {/* Complemento */}
            <View>
              <Text className="text-sm font-semibold text-gray-600 mb-1.5">Complemento</Text>
              <View className={inputClass('complemento')}>
                <Ionicons name="business-outline" size={16} color={focused === 'complemento' ? '#7EC8E3' : '#aaa'} />
                <TextInput
                  className="flex-1 ml-2 text-gray-800 text-sm"
                  value={form.complemento}
                  onChangeText={set('complemento')}
                  onFocus={() => setFocused('complemento')}
                  onBlur={() => setFocused(null)}
                  placeholderTextColor="#bbb"
                  placeholder="Apto, bloco, ref..."
                />
              </View>
            </View>

            {/* Bairro */}
            <View>
              <Text className="text-sm font-semibold text-gray-600 mb-1.5">Bairro</Text>
              <View className={inputClass('bairro')}>
                <Ionicons name="map-outline" size={16} color={focused === 'bairro' ? '#7EC8E3' : '#aaa'} />
                <TextInput
                  className="flex-1 ml-2 text-gray-800 text-sm"
                  value={form.bairro}
                  onChangeText={set('bairro')}
                  onFocus={() => setFocused('bairro')}
                  onBlur={() => setFocused(null)}
                  placeholderTextColor="#bbb"
                />
              </View>
            </View>

            {/* Cidade + UF */}
            <View className="flex-row gap-x-3">
              <View className="flex-[1.8]">
                <Text className="text-sm font-semibold text-gray-600 mb-1.5">Cidade</Text>
                <View className={inputClass('cidade')}>
                  <TextInput
                    className="flex-1 text-gray-800 text-sm"
                    value={form.cidade}
                    onChangeText={set('cidade')}
                    onFocus={() => setFocused('cidade')}
                    onBlur={() => setFocused(null)}
                    placeholderTextColor="#bbb"
                  />
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-600 mb-1.5">UF</Text>
                <View className={inputClass('uf')}>
                  <TextInput
                    className="flex-1 text-gray-800 text-sm text-center"
                    value={form.uf}
                    onChangeText={set('uf')}
                    autoCapitalize="characters"
                    maxLength={2}
                    onFocus={() => setFocused('uf')}
                    onBlur={() => setFocused(null)}
                    placeholderTextColor="#bbb"
                  />
                </View>
              </View>
            </View>

            {/* CEP */}
            <View>
              <Text className="text-sm font-semibold text-gray-600 mb-1.5">CEP</Text>
              <View className={inputClass('cep')}>
                <Ionicons name="barcode-outline" size={16} color={focused === 'cep' ? '#7EC8E3' : '#aaa'} />
                <TextInput
                  className="flex-1 ml-2 text-gray-800 text-sm"
                  value={form.cep}
                  onChangeText={set('cep')}
                  keyboardType="number-pad"
                  maxLength={9}
                  onFocus={() => setFocused('cep')}
                  onBlur={() => setFocused(null)}
                  placeholder="00000-000"
                  placeholderTextColor="#bbb"
                />
              </View>
            </View>
          </View>

          {/* Botão salvar */}
          <TouchableOpacity
            className={`mt-8 rounded-2xl h-14 items-center justify-center flex-row gap-x-2 ${
              saved ? 'bg-green-400' : 'bg-brand'
            }`}
            activeOpacity={0.85}
            onPress={handleSave}
          >
            <Ionicons
              name={saved ? 'checkmark-circle-outline' : 'save-outline'}
              size={20}
              color="#fff"
            />
            <Text className="text-white text-base font-bold">
              {saved ? 'Salvo!' : 'Salvar Endereço'}
            </Text>
          </TouchableOpacity>

          {/* Cancelar */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-3 items-center py-2"
          >
            <Text className="text-gray-400 text-base">Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

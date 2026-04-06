import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  KeyboardAvoidingView, Platform, ScrollView,
  TouchableWithoutFeedback, Dimensions, StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  const handleTap = (x: number) => {
    if (x > width / 2) router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={(e) => handleTap(e.nativeEvent.locationX)}>
        <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none" />
      </TouchableWithoutFeedback>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-8 pt-20 pb-10">
          {/* Logo */}
          <View className="items-center mb-10">
            <Image
              source={require('../../assets/images/logo02.png')}
              style={{ width: 200, height: 90 }}
              resizeMode="contain"
            />
          </View>

          <Text className="text-lg text-gray-500 text-center mb-8 font-medium">
            Acesse sua conta
          </Text>

          {/* Campos */}
          <View className="w-full gap-y-4">
            <View>
              <Text className="text-sm font-semibold text-gray-600 mb-1.5">E-mail</Text>
              <View
                className={`flex-row items-center h-12 border-[1.5px] rounded-xl px-3 bg-sky-50 ${
                  emailFocused ? 'border-brand' : 'border-gray-200'
                }`}
              >
                <Ionicons name="mail-outline" size={18} color={emailFocused ? '#7EC8E3' : '#aaa'} />
                <TextInput
                  className="flex-1 ml-2 text-gray-800 text-base"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  placeholder="seu@email.com"
                  placeholderTextColor="#bbb"
                />
              </View>
            </View>

            <View>
              <Text className="text-sm font-semibold text-gray-600 mb-1.5">Senha</Text>
              <View
                className={`flex-row items-center h-12 border-[1.5px] rounded-xl px-3 bg-sky-50 ${
                  passFocused ? 'border-brand' : 'border-gray-200'
                }`}
              >
                <Ionicons name="lock-closed-outline" size={18} color={passFocused ? '#7EC8E3' : '#aaa'} />
                <TextInput
                  className="flex-1 ml-2 text-gray-800 text-base"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  onFocus={() => setPassFocused(true)}
                  onBlur={() => setPassFocused(false)}
                  placeholder="••••••••"
                  placeholderTextColor="#bbb"
                />
                <TouchableOpacity onPress={() => setShowPass(s => !s)}>
                  <Ionicons
                    name={showPass ? 'eye-outline' : 'eye-off-outline'}
                    size={18}
                    color="#aaa"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Botão Acessar */}
          <TouchableOpacity
            className="mt-10 bg-brand rounded-2xl h-14 items-center justify-center shadow-sm"
            activeOpacity={0.85}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text className="text-white text-base font-bold tracking-wide">Acessar</Text>
          </TouchableOpacity>

          {/* Link para cadastro */}
          <TouchableOpacity
            onPress={() => router.push('/register')}
            activeOpacity={0.7}
            className="mt-5 items-center"
          >
            <Text className="text-gray-500 text-base">
              Não tem conta?{' '}
              <Text className="text-brand-dark font-bold">Criar minha conta</Text>
            </Text>
          </TouchableOpacity>

          {/* Dica de navegação */}
          <View className="flex-row justify-between mt-auto pt-8 opacity-30">
            <Text className="text-xs text-gray-400">← voltar</Text>
            <Text className="text-xs text-gray-400">avançar →</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

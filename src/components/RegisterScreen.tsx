import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  KeyboardAvoidingView, Platform, ScrollView,
  TouchableWithoutFeedback, Dimensions, StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const fields: {
  label: string;
  field: string;
  keyboard: 'default' | 'email-address' | 'phone-pad';
  icon: IoniconName;
  secure?: boolean;
  autoCapitalize?: 'none' | 'words';
}[] = [
  { label: 'Nome completo', field: 'name', keyboard: 'default', icon: 'person-outline', autoCapitalize: 'words' },
  { label: 'E-mail', field: 'email', keyboard: 'email-address', icon: 'mail-outline', autoCapitalize: 'none' },
  { label: 'WhatsApp', field: 'whatsapp', keyboard: 'phone-pad', icon: 'logo-whatsapp', autoCapitalize: 'none' },
  { label: 'Senha', field: 'password', keyboard: 'default', icon: 'lock-closed-outline', secure: true, autoCapitalize: 'none' },
];

export default function RegisterScreen() {
  const [form, setForm] = useState({ name: '', email: '', whatsapp: '', password: '' });
  const [focused, setFocused] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);

  const set = (field: string) => (val: string) => setForm((f) => ({ ...f, [field]: val }));

  const handleTap = (x: number) => {
    if (x > width / 2) router.push('/address');
    else router.back();
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-white" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableWithoutFeedback onPress={(e) => handleTap(e.nativeEvent.locationX)}>
        <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none" />
      </TouchableWithoutFeedback>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View className="flex-1 px-8 pt-14 pb-10">
          <View className="items-center mb-6">
            <Image
              source={require('../../assets/images/logo02.png')}
              style={{ width: 160, height: 72 }}
              resizeMode="contain"
            />
          </View>

          <Text className="text-lg text-gray-500 text-center mb-6 font-medium">Criar sua conta</Text>

          <View className="w-full gap-y-3">
            {fields.map(({ label, field, keyboard, icon, secure, autoCapitalize }) => (
              <View key={field}>
                <Text className="text-sm font-semibold text-gray-600 mb-1.5">{label}</Text>
                <View className={`flex-row items-center h-12 border-[1.5px] rounded-xl px-3 bg-sky-50 ${focused === field ? 'border-brand' : 'border-gray-200'}`}>
                  <Ionicons name={icon} size={18} color={focused === field ? '#7EC8E3' : '#aaa'} />
                  <TextInput
                    className="flex-1 ml-2 text-gray-800 text-base"
                    value={form[field as keyof typeof form]}
                    onChangeText={set(field)}
                    keyboardType={keyboard}
                    secureTextEntry={secure && !showPass}
                    autoCapitalize={autoCapitalize ?? 'none'}
                    onFocus={() => setFocused(field)}
                    onBlur={() => setFocused(null)}
                    placeholderTextColor="#bbb"
                  />
                  {secure && (
                    <TouchableOpacity onPress={() => setShowPass((s) => !s)}>
                      <Ionicons name={showPass ? 'eye-outline' : 'eye-off-outline'} size={18} color="#aaa" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            className="mt-8 bg-brand rounded-2xl h-14 items-center justify-center"
            activeOpacity={0.85}
            onPress={() => router.push('/address')}
          >
            <Text className="text-white text-base font-bold tracking-wide">Próximo Passo</Text>
          </TouchableOpacity>

          <View className="flex-row justify-between mt-auto pt-8 opacity-30">
            <Text className="text-xs text-gray-400">← voltar</Text>
            <Text className="text-xs text-gray-400">avançar →</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

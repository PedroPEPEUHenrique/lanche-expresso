import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  ScrollView, KeyboardAvoidingView, Platform, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { atualizarUsuario } from '../../services/userService';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const fields: {
  label: string;
  field: string;
  keyboard: 'default' | 'email-address' | 'phone-pad';
  icon: IoniconName;
  autoCapitalize?: 'none' | 'words';
  editable?: boolean;
}[] = [
  { label: 'Nome completo', field: 'nome', keyboard: 'default', icon: 'person-outline', autoCapitalize: 'words' },
  { label: 'E-mail', field: 'email', keyboard: 'email-address', icon: 'mail-outline', autoCapitalize: 'none', editable: false },
  { label: 'WhatsApp', field: 'telefone', keyboard: 'phone-pad', icon: 'logo-whatsapp', autoCapitalize: 'none' },
];

export default function EditProfileScreen() {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({
    nome: user?.nome ?? '',
    email: user?.email ?? '',
    telefone: user?.telefone ?? '',
  });
  const [focused, setFocused] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (val: string) => setForm((f) => ({ ...f, [field]: val }));

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await atualizarUsuario(user.id, { nome: form.nome, telefone: form.telefone });
      updateUser({ nome: form.nome, telefone: form.telefone });
      router.back();
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Não foi possível salvar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-white" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View className="flex-row items-center px-5 pt-14 pb-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center mr-4">
          <Ionicons name="arrow-back" size={20} color="#333" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800 flex-1">Meus Dados</Text>
        <Image source={require('../../../assets/images/logo02.png')} style={{ width: 80, height: 34 }} resizeMode="contain" />
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-6 pb-10">
          <View className="items-center mb-6">
            <View className="w-20 h-20 rounded-full bg-brand items-center justify-center mb-3" style={styles.avatarShadow}>
              <Ionicons name="person" size={38} color="#fff" />
            </View>
          </View>

          <View className="gap-y-4">
            {fields.map(({ label, field, keyboard, icon, autoCapitalize, editable = true }) => (
              <View key={field}>
                <Text className="text-sm font-semibold text-gray-600 mb-1.5">{label}</Text>
                <View className={`flex-row items-center h-12 border-[1.5px] rounded-xl px-3 ${editable ? 'bg-sky-50' : 'bg-gray-50'} ${focused === field ? 'border-brand' : 'border-gray-200'}`}>
                  <Ionicons name={icon} size={18} color={focused === field ? '#7EC8E3' : '#aaa'} />
                  <TextInput
                    className="flex-1 ml-2 text-gray-800 text-base"
                    value={form[field as keyof typeof form]}
                    onChangeText={set(field)}
                    keyboardType={keyboard}
                    autoCapitalize={autoCapitalize ?? 'none'}
                    editable={editable}
                    onFocus={() => editable && setFocused(field)}
                    onBlur={() => setFocused(null)}
                    placeholderTextColor="#bbb"
                  />
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            className="mt-8 bg-brand rounded-2xl h-14 items-center justify-center flex-row gap-x-2"
            activeOpacity={0.85}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#fff" />
                <Text className="text-white text-base font-bold">Salvar Alterações</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} className="mt-3 items-center py-2">
            <Text className="text-gray-400 text-base">Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  avatarShadow: {
    shadowColor: '#7EC8E3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});

import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const options: {
  icon: IoniconName;
  title: string;
  subtitle: string;
  route?: string;
  danger?: boolean;
}[] = [
  {
    icon: 'person-circle-outline',
    title: 'Meus dados',
    subtitle: 'Editar nome, e-mail e telefone',
    route: '/user/edit-profile',
  },
  {
    icon: 'location-outline',
    title: 'Endereço de entrega',
    subtitle: 'Alterar meu endereço',
    route: '/user/edit-address',
  },
  {
    icon: 'notifications-outline',
    title: 'Notificações',
    subtitle: 'Preferências de alertas',
  },
  {
    icon: 'log-out-outline',
    title: 'Desconectar',
    subtitle: 'Sair da conta',
    danger: true,
  },
];

export default function ProfileScreen() {
  const handlePress = (opt: typeof options[0]) => {
    if (opt.danger) {
      router.replace('/');
    } else if (opt.route) {
      router.push(opt.route as any);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header com logo */}
      <View className="items-center pt-14 pb-5 border-b border-gray-100">
        <Image
          source={require('../../assets/images/logo02.png')}
          style={{ width: 140, height: 60 }}
          resizeMode="contain"
        />
      </View>

      {/* Avatar placeholder */}
      <View className="items-center mt-6 mb-6">
        <View className="w-20 h-20 rounded-full bg-brand items-center justify-center mb-3" style={styles.avatarShadow}>
          <Ionicons name="person" size={40} color="#fff" />
        </View>
        <Text className="text-xl font-bold text-gray-800">Meu Perfil</Text>
        <Text className="text-sm text-gray-400 mt-0.5">usuario@email.com</Text>
      </View>

      {/* Opções */}
      <View className="mx-5 rounded-2xl overflow-hidden bg-gray-50">
        {options.map((opt, index) => (
          <TouchableOpacity
            key={opt.title}
            className={`flex-row items-center px-4 py-4 ${
              index < options.length - 1 ? 'border-b border-gray-100' : ''
            }`}
            activeOpacity={0.7}
            onPress={() => handlePress(opt)}
          >
            <View
              className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${
                opt.danger ? 'bg-red-100' : 'bg-sky-100'
              }`}
            >
              <Ionicons
                name={opt.icon}
                size={22}
                color={opt.danger ? '#FF6B6B' : '#7EC8E3'}
              />
            </View>
            <View className="flex-1">
              <Text
                className={`text-base font-bold ${opt.danger ? 'text-red-400' : 'text-gray-800'}`}
              >
                {opt.title}
              </Text>
              <Text className="text-xs text-gray-400 mt-0.5">{opt.subtitle}</Text>
            </View>
            {!opt.danger && (
              <Ionicons name="chevron-forward" size={18} color="#ccc" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Versão */}
      <Text className="text-center text-xs text-gray-300 mt-8">Rassi Food Express v1.0.0</Text>
    </View>
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

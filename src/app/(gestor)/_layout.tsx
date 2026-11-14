import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../style/theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

// A aba ativa ganha pílula amarela com contorno preto: o preenchimento é o
// que se lê de relance, não a cor do ícone.
function TabIcon({ name, focused }: { name: IoniconName; focused: boolean }) {
  return (
    <View className={`items-center justify-center rounded-full px-3 py-1 ${
      focused ? 'bg-brand border border-ink' : 'bg-transparent'
    }`}>
      <Ionicons name={name} size={20} color={focused ? theme.ink : theme.inkMuted} />
    </View>
  );
}

/**
 * Abas do gestor.
 *
 * Salão e Mesas saíram da barra para caber Financeiro, Equipe e Estoque sem
 * espremer cinco rótulos numa tela de celular. O salão continua a um toque,
 * pelo cabeçalho do cardápio, e Mesas é cadastro — mexe-se nele uma vez na
 * montagem do restaurante, não todo dia.
 */
export default function GestorLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: theme.ink,
        tabBarInactiveTintColor: theme.inkMuted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: theme.white,
          borderTopColor: theme.ink,
          borderTopWidth: 1,
          height: 68,
          paddingBottom: 8,
          paddingTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Cardápio',
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'book' : 'book-outline'} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="financeiro"
        options={{
          title: 'Financeiro',
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'cash' : 'cash-outline'} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="equipe"
        options={{
          title: 'Equipe',
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'people' : 'people-outline'} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="estoque"
        options={{
          title: 'Estoque',
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'cube' : 'cube-outline'} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="conta"
        options={{
          title: 'Conta',
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} />,
        }}
      />

      {/* Fora da barra: alcançadas pelo cabeçalho do cardápio. */}
      <Tabs.Screen name="salao" options={{ href: null }} />
      <Tabs.Screen name="mesas" options={{ href: null }} />
    </Tabs>
  );
}

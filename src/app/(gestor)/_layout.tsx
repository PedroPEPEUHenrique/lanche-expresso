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
    <View className={`items-center justify-center rounded-full px-4 py-1.5 ${
      focused ? 'bg-brand border border-ink' : 'bg-transparent'
    }`}>
      <Ionicons name={name} size={22} color={focused ? theme.ink : theme.inkMuted} />
    </View>
  );
}

export default function GestorLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: theme.ink,
        tabBarInactiveTintColor: theme.inkMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
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
        name="mesas"
        options={{
          title: 'Mesas',
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'grid' : 'grid-outline'} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="salao"
        options={{
          title: 'Salão',
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'people' : 'people-outline'} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="conta"
        options={{
          title: 'Conta',
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} />,
        }}
      />
    </Tabs>
  );
}

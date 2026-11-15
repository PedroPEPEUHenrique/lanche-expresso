import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../style/theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

/**
 * Aba ativa acende: quadro neon preenchido com halo, ícone escuro por cima.
 * Num tema escuro a troca de cor do ícone sozinha quase não se lê — o
 * preenchimento luminoso é o que marca onde você está.
 */
function TabIcon({ name, focused }: { name: IoniconName; focused: boolean }) {
  if (!focused) {
    return (
      <View className="items-center justify-center" style={{ width: 40, height: 28 }}>
        <Ionicons name={name} size={19} color={theme.muted} />
      </View>
    );
  }
  return (
    <View className="items-center justify-center" style={{ width: 40, height: 28 }}>
      <View pointerEvents="none" style={{
        position: 'absolute', top: -3, left: -1, right: -1, bottom: -3,
        borderWidth: 4, borderColor: theme.neonFraco,
      }} />
      <View className="items-center justify-center" style={{
        width: 38, height: 26, backgroundColor: theme.neon, borderWidth: 1, borderColor: theme.neon,
      }}>
        <Ionicons name={name} size={18} color={theme.void} />
      </View>
    </View>
  );
}

/**
 * Abas do gestor.
 *
 * Salão e Mesas ficam fora da barra para caber Financeiro, Equipe e Estoque
 * sem espremer sete rótulos. Os dois seguem a um toque pelo cabeçalho do
 * cardápio; Mesas é cadastro de montagem, não uso diário.
 */
export default function GestorLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: theme.neon,
        tabBarInactiveTintColor: theme.muted,
        tabBarLabelStyle: {
          fontFamily: theme.mono, fontSize: 9, fontWeight: '700',
          letterSpacing: 1, textTransform: 'uppercase', marginTop: 2,
        },
        tabBarStyle: {
          backgroundColor: theme.void,
          borderTopColor: theme.line,
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 10,
          paddingTop: 8,
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen name="index" options={{
        title: 'Cardápio',
        tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'book' : 'book-outline'} focused={focused} />,
      }} />
      <Tabs.Screen name="financeiro" options={{
        title: 'Caixa',
        tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'cash' : 'cash-outline'} focused={focused} />,
      }} />
      <Tabs.Screen name="equipe" options={{
        title: 'Equipe',
        tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'people' : 'people-outline'} focused={focused} />,
      }} />
      <Tabs.Screen name="estoque" options={{
        title: 'Estoque',
        tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'cube' : 'cube-outline'} focused={focused} />,
      }} />
      <Tabs.Screen name="conta" options={{
        title: 'Conta',
        tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} />,
      }} />

      {/* Fora da barra: alcançadas pelo cabeçalho do cardápio. */}
      <Tabs.Screen name="salao" options={{ href: null }} />
      <Tabs.Screen name="mesas" options={{ href: null }} />
    </Tabs>
  );
}

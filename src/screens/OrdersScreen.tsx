import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useOrders, Order } from '../hooks/useOrders';

const paymentIcons: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  pix: 'flash-outline',
  credit: 'card-outline',
  debit: 'wallet-outline',
  cash: 'cash-outline',
};

const paymentLabels: Record<string, string> = {
  pix: 'PIX',
  credit: 'Crédito',
  debit: 'Débito',
  cash: 'Dinheiro',
};

function formatDate(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function OrderCard({ order }: { order: Order }) {
  const totalItems = order.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <View
      className="mx-5 mb-4 rounded-2xl bg-white overflow-hidden"
      style={{ elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8 }}
    >
      {/* Restaurant header */}
      <View className="flex-row items-center p-4 border-b border-gray-100">
        <Image
          source={{ uri: order.restaurantImage }}
          className="w-12 h-12 rounded-xl bg-gray-100"
        />
        <View className="flex-1 ml-3">
          <Text className="text-base font-bold text-gray-800">{order.restaurantName}</Text>
          <Text className="text-xs text-gray-400 mt-0.5">{formatDate(order.date)}</Text>
        </View>
        <View className="bg-green-50 px-3 py-1 rounded-full">
          <Text className="text-xs font-bold text-green-600">Entregue</Text>
        </View>
      </View>

      {/* Items */}
      <View className="px-4 pt-3 pb-2">
        {order.items.map((item, index) => (
          <View key={index} className="flex-row justify-between items-center mb-1.5">
            <Text className="text-sm text-gray-600 flex-1" numberOfLines={1}>
              {item.quantity}x {item.name}
            </Text>
            <Text className="text-sm font-semibold text-gray-700">
              R$ {(item.price * item.quantity).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View className="flex-row items-center justify-between px-4 pb-4 pt-2 border-t border-gray-100">
        <View className="flex-row items-center gap-x-1.5">
          <Ionicons
            name={paymentIcons[order.paymentMethod] ?? 'card-outline'}
            size={14}
            color="#aaa"
          />
          <Text className="text-xs text-gray-400">
            {paymentLabels[order.paymentMethod] ?? order.paymentMethod}
          </Text>
          <Text className="text-xs text-gray-300 mx-1">·</Text>
          <Text className="text-xs text-gray-400">
            {totalItems} {totalItems === 1 ? 'item' : 'itens'}
          </Text>
        </View>
        <Text className="text-sm font-extrabold text-brand-dark">
          R$ {order.total.toFixed(2)}
        </Text>
      </View>
    </View>
  );
}

export default function OrdersScreen() {
  const { orders } = useOrders();

  if (orders.length === 0) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-8">
        <View className="items-center bg-sky-50 rounded-full p-6 mb-5">
          <Ionicons name="receipt-outline" size={56} color="#7EC8E3" />
        </View>
        <Text className="text-2xl font-extrabold text-gray-800 mb-2">Meus Pedidos</Text>
        <Text className="text-sm text-gray-400 text-center leading-5 mb-8">
          Nenhum pedido ainda. Que tal pedir algo agora?
        </Text>
        <TouchableOpacity
          className="bg-brand rounded-2xl px-8 py-3"
          activeOpacity={0.85}
          onPress={() => router.push('/(tabs)')}
        >
          <Text className="text-white font-bold text-base">Ver restaurantes</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Text className="text-2xl font-extrabold text-gray-800 mx-5 pt-14 pb-4">Meus Pedidos</Text>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {orders.map(order => (
          <OrderCard key={order.id} order={order} />
        ))}
      </ScrollView>
    </View>
  );
}

import React, { useEffect, useState, memo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { listarPedidosPorUsuario, ApiOrder } from '../services/orderService';
import { formatDate } from '../utils/format';

const statusLabel: Record<string, string> = {
  pendente: 'Pendente',
  confirmado: 'Confirmado',
  preparando: 'Preparando',
  saiu_entrega: 'A caminho',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};

const statusColor: Record<string, string> = {
  pendente: 'text-yellow-600',
  confirmado: 'text-blue-600',
  preparando: 'text-orange-500',
  saiu_entrega: 'text-sky-600',
  entregue: 'text-green-600',
  cancelado: 'text-red-400',
};

const statusBg: Record<string, string> = {
  pendente: 'bg-yellow-50',
  confirmado: 'bg-blue-50',
  preparando: 'bg-orange-50',
  saiu_entrega: 'bg-sky-50',
  entregue: 'bg-green-50',
  cancelado: 'bg-red-50',
};

const OrderCard = memo(({ order }: { order: ApiOrder }) => (
  <View className="mx-5 mb-4 rounded-2xl bg-white overflow-hidden" style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}>
    <View className="flex-row items-center p-4 border-b border-gray-100">
      <Image source={{ uri: order.restaurantImage || undefined }} className="w-12 h-12 rounded-xl bg-gray-100" />
      <View className="flex-1 ml-3">
        <Text className="text-base font-bold text-gray-800">{order.restaurantName}</Text>
        <Text className="text-xs text-gray-400 mt-0.5">{formatDate(order.date)}</Text>
      </View>
      <View className={`${statusBg[order.status] ?? 'bg-gray-50'} px-3 py-1 rounded-full`}>
        <Text className={`text-xs font-bold ${statusColor[order.status] ?? 'text-gray-500'}`}>
          {statusLabel[order.status] ?? order.status}
        </Text>
      </View>
    </View>

    <View className="flex-row items-center justify-between px-4 py-3">
      <View className="flex-row items-center gap-x-1.5">
        <Ionicons name="receipt-outline" size={14} color="#aaa" />
        <Text className="text-xs text-gray-400">Entrega: R$ {order.deliveryFee.toFixed(2)}</Text>
      </View>
      <Text className="text-sm font-extrabold text-brand-dark">R$ {order.total.toFixed(2)}</Text>
    </View>
  </View>
));

export default function OrdersScreen() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    listarPedidosPorUsuario(user.id)
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#7EC8E3" />
      </View>
    );
  }

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
        <TouchableOpacity className="bg-brand rounded-2xl px-8 py-3" activeOpacity={0.85} onPress={() => router.push('/(tabs)')}>
          <Text className="text-white font-bold text-base">Ver restaurantes</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Text className="text-2xl font-extrabold text-gray-800 mx-5 pt-14 pb-4">Meus Pedidos</Text>
      <FlatList
        data={orders}
        keyExtractor={(order) => order.id}
        renderItem={({ item }) => <OrderCard order={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

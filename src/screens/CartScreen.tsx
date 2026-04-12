import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, Modal, StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../hooks/useCart';
import { useOrders } from '../hooks/useOrders';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const paymentMethods: { id: string; label: string; icon: IoniconName }[] = [
  { id: 'pix', label: 'PIX', icon: 'flash-outline' },
  { id: 'credit', label: 'Crédito', icon: 'card-outline' },
  { id: 'debit', label: 'Débito', icon: 'wallet-outline' },
  { id: 'cash', label: 'Dinheiro', icon: 'cash-outline' },
];

function CheckoutModal({
  visible,
  onClose,
  onConfirm,
  total,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: (paymentMethod: string) => void;
  total: number;
}) {
  const [method, setMethod] = useState<string | null>(null);
  const [step, setStep] = useState<'payment' | 'tracking'>('payment');

  if (!visible) return null;

  const handleConfirm = () => {
    if (!method) return;
    onConfirm(method);
    setStep('tracking');
  };

  const handleClose = () => {
    setStep('payment');
    setMethod(null);
    onClose();
  };

  return (
    <Modal transparent animationType="slide" visible={visible}>
      <View className="flex-1 justify-end" style={styles.overlay}>
        <View className="bg-white rounded-t-3xl px-7 pt-6 pb-10">
          {step === 'payment' ? (
            <>
              <View className="self-center w-10 h-1 rounded-full bg-gray-200 mb-5" />

              <Text className="text-2xl font-extrabold text-gray-800 text-center mb-5">
                Finalizar Pedido
              </Text>

              <Text className="text-sm font-semibold text-gray-500 mb-4">
                Forma de Pagamento
              </Text>

              <View className="flex-row flex-wrap gap-3 mb-6">
                {paymentMethods.map(m => (
                  <TouchableOpacity
                    key={m.id}
                    className={`flex-1 min-w-[40%] py-4 rounded-2xl border-2 items-center ${
                      method === m.id
                        ? 'border-brand bg-brand'
                        : 'border-gray-200 bg-white'
                    }`}
                    onPress={() => setMethod(m.id)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={m.icon}
                      size={24}
                      color={method === m.id ? '#fff' : '#555'}
                    />
                    <Text
                      className={`text-sm font-semibold mt-1 ${
                        method === m.id ? 'text-white' : 'text-gray-600'
                      }`}
                    >
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-lg font-bold text-gray-800">Total</Text>
                <Text className="text-xl font-extrabold text-brand-dark">
                  R$ {total.toFixed(2)}
                </Text>
              </View>

              <TouchableOpacity
                className={`bg-brand rounded-2xl h-14 items-center justify-center mb-3 ${!method ? 'opacity-50' : ''}`}
                disabled={!method}
                onPress={handleConfirm}
                activeOpacity={0.85}
              >
                <Text className="text-white text-base font-bold">Confirmar Pedido</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleClose} className="items-center py-2">
                <Text className="text-gray-400 text-base">Cancelar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View className="self-center w-10 h-1 rounded-full bg-gray-200 mb-5" />

              <Text className="text-2xl font-extrabold text-gray-800 text-center mb-5">
                🎉 Pedido Confirmado!
              </Text>

              <View className="bg-brand-light rounded-2xl p-5 mb-6">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="bicycle" size={22} color="#5BB5D5" />
                  <Text className="text-base font-bold text-gray-700 ml-2">
                    Entregador a caminho!
                  </Text>
                </View>
                <Text className="text-sm text-gray-500 leading-5 mb-4">
                  Seu pedido está sendo preparado e logo sairá para entrega.
                </Text>

                <View className="flex-row items-center mb-4">
                  <Ionicons name="time-outline" size={16} color="#7EC8E3" />
                  <Text className="text-sm text-gray-600 ml-1.5">Tempo estimado: 30–45 min</Text>
                </View>

                <View className="h-2 bg-gray-200 rounded-full mb-3">
                  <View className="h-2 bg-brand rounded-full" style={{ width: '40%' }} />
                </View>

                <View className="flex-row justify-between">
                  {['Preparando', 'Saiu', 'Chegando'].map((s, i) => (
                    <Text
                      key={s}
                      className={`text-xs font-semibold ${i === 0 ? 'text-brand' : 'text-gray-300'}`}
                    >
                      {s}
                    </Text>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                className="bg-brand rounded-2xl h-14 items-center justify-center"
                onPress={handleClose}
                activeOpacity={0.85}
              >
                <Text className="text-white text-base font-bold">Fechar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

export default function CartScreen() {
  const { items, removeItem, total, subtotal, deliveryFee, clearCart } = useCart();
  const { addOrder } = useOrders();
  const [showModal, setShowModal] = useState(false);

  const handleConfirm = (paymentMethod: string) => {
    if (items.length === 0) return;
    const restaurant = items[0].restaurant;
    addOrder({
      restaurantName: restaurant.name,
      restaurantImage: restaurant.image,
      items: items.map(i => ({
        name: i.product.name,
        quantity: i.quantity,
        price: i.product.price,
        image: i.product.image,
      })),
      subtotal,
      deliveryFee,
      total,
      paymentMethod,
    });
  };

  const handleClose = () => {
    setShowModal(false);
    clearCart();
    router.replace('/(tabs)');
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 pt-14 pb-4 border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={20} color="#333" />
        </TouchableOpacity>

        <Image
          source={require('../../assets/images/logo02.png')}
          style={{ width: 110, height: 46 }}
          resizeMode="contain"
        />

        <View className="w-10" />
      </View>

      {items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="bg-gray-100 rounded-full p-6 mb-4">
            <Ionicons name="cart-outline" size={56} color="#ccc" />
          </View>
          <Text className="text-xl font-bold text-gray-700 mb-2">Carrinho vazio</Text>
          <Text className="text-sm text-gray-400 text-center">
            Adicione itens de um restaurante para começar seu pedido.
          </Text>
        </View>
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
            {items.map(item => (
              <View
                key={item.product.id}
                className="flex-row items-center mb-3 p-3 rounded-2xl bg-gray-50"
                style={styles.itemShadow}
              >
                <Image
                  source={{ uri: item.product.image }}
                  className="w-[70px] h-[70px] rounded-xl bg-gray-200"
                />
                <View className="flex-1 ml-3">
                  <Text className="text-sm font-bold text-gray-800">{item.product.name}</Text>
                  <Text className="text-xs text-gray-400 mt-1" numberOfLines={2}>
                    {item.product.description}
                  </Text>
                  {item.quantity > 1 && (
                    <Text className="text-xs text-brand font-bold mt-1">x{item.quantity}</Text>
                  )}
                </View>
                <View className="items-end ml-2 gap-y-2">
                  <Text className="text-sm font-bold text-brand-dark">
                    R$ {(item.product.price * item.quantity).toFixed(2)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeItem(item.product.id)}
                    className="w-7 h-7 rounded-lg bg-red-100 items-center justify-center"
                  >
                    <Ionicons name="trash-outline" size={14} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Resumo */}
            <View className="mt-4 p-4 bg-gray-50 rounded-2xl">
              <Text className="text-base font-bold text-gray-800 mb-4">Resumo do pedido</Text>

              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-gray-500">Subtotal</Text>
                <Text className="text-sm text-gray-700">R$ {subtotal.toFixed(2)}</Text>
              </View>

              <View className="flex-row justify-between mb-2">
                <View className="flex-row items-center gap-x-1">
                  <Ionicons name="bicycle-outline" size={14} color="#7EC8E3" />
                  <Text className="text-sm text-gray-500">Taxa de entrega</Text>
                </View>
                <Text className="text-sm text-gray-700">R$ {deliveryFee.toFixed(2)}</Text>
              </View>

              <View className="h-[1px] bg-gray-200 my-3" />

              <View className="flex-row justify-between">
                <Text className="text-base font-extrabold text-gray-800">TOTAL</Text>
                <Text className="text-base font-extrabold text-brand-dark">R$ {total.toFixed(2)}</Text>
              </View>
            </View>
          </ScrollView>

          <View className="px-5 pb-8 pt-3 border-t border-gray-100">
            <TouchableOpacity
              className="bg-brand rounded-2xl h-14 items-center justify-center flex-row gap-x-2"
              onPress={() => setShowModal(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text className="text-white text-base font-bold">Finalizar Pedido</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <CheckoutModal
        visible={showModal}
        onClose={handleClose}
        onConfirm={handleConfirm}
        total={total}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  itemShadow: {
  },
});

import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, Modal,
} from 'react-native';
import { router } from 'expo-router';
import { useCart } from '../hooks/useCart';

function CheckoutModal({ visible, onClose, total }: any) {
  const [method, setMethod] = useState<string | null>(null);
  const [step, setStep] = useState<'payment' | 'tracking'>('payment');

  const methods = [
    { id: 'pix', label: 'PIX', emoji: '⚡' },
    { id: 'credit', label: 'Crédito', emoji: '💳' },
    { id: 'debit', label: 'Débito', emoji: '🏦' },
    { id: 'cash', label: 'Dinheiro', emoji: '💵' },
  ];

  if (!visible) return null;

  return (
    <Modal transparent animationType="slide" visible={visible}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          {step === 'payment' ? (
            <>
              <Text style={modalStyles.title}>Finalizar Pedido</Text>
              <Text style={modalStyles.subtitle}>Forma de Pagamento</Text>
              <View style={modalStyles.methodGrid}>
                {methods.map(m => (
                  <TouchableOpacity
                    key={m.id}
                    style={[modalStyles.methodBtn, method === m.id && modalStyles.methodSelected]}
                    onPress={() => setMethod(m.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={modalStyles.methodEmoji}>{m.emoji}</Text>
                    <Text style={[modalStyles.methodLabel, method === m.id && { color: '#fff' }]}>{m.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={modalStyles.totalRow}>
                <Text style={modalStyles.totalLabel}>Total</Text>
                <Text style={modalStyles.totalValue}>R$ {total.toFixed(2)}</Text>
              </View>
              <TouchableOpacity
                style={[modalStyles.confirmBtn, !method && { opacity: 0.5 }]}
                disabled={!method}
                onPress={() => setStep('tracking')}
                activeOpacity={0.85}
              >
                <Text style={modalStyles.confirmBtnText}>Confirmar Pedido</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={modalStyles.cancelBtn}>
                <Text style={modalStyles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={modalStyles.title}>🎉 Pedido Confirmado!</Text>
              <View style={modalStyles.trackingBox}>
                <Text style={modalStyles.trackingTitle}>🛵 Entregador a caminho!</Text>
                <Text style={modalStyles.trackingDesc}>Seu pedido está sendo preparado e logo sairá para entrega.</Text>
                <View style={modalStyles.etaRow}>
                  <Text style={modalStyles.etaEmoji}>⏱</Text>
                  <Text style={modalStyles.etaText}>Tempo estimado: 30–45 min</Text>
                </View>
                <View style={modalStyles.progressBar}>
                  <View style={[modalStyles.progressFill, { width: '40%' }]} />
                </View>
                <View style={modalStyles.stepsRow}>
                  {['Preparando', 'Saiu', 'Chegando'].map((s, i) => (
                    <Text key={s} style={[modalStyles.stepLabel, i === 0 && { color: '#7EC8E3', fontWeight: '700' }]}>{s}</Text>
                  ))}
                </View>
              </View>
              <TouchableOpacity style={modalStyles.confirmBtn} onPress={onClose} activeOpacity={0.85}>
                <Text style={modalStyles.confirmBtnText}>Fechar</Text>
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
  const [showModal, setShowModal] = useState(false);

  const handleClose = () => {
    setShowModal(false);
    clearCart();
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.logoTop}>RASSI FOOD</Text>
          <Text style={styles.logoBottom}>EXPRESS</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyText}>Seu carrinho está vazio</Text>
        </View>
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
            {items.map(item => (
              <View key={item.product.id} style={styles.cartItem}>
                <Image source={{ uri: item.product.image }} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.product.name}</Text>
                  <Text style={styles.itemDesc}>{item.product.description}</Text>
                  {item.quantity > 1 && <Text style={styles.itemQty}>x{item.quantity}</Text>}
                </View>
                <TouchableOpacity onPress={() => removeItem(item.product.id)} style={styles.deleteBtn}>
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>Resumo dos valores</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>R$ {subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Taxa de entrega</Text>
                <Text style={styles.summaryValue}>R$ {deliveryFee.toFixed(2)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>TOTAL</Text>
                <Text style={styles.totalValue}>R$ {total.toFixed(2)}</Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.finalizeBtn} onPress={() => setShowModal(true)} activeOpacity={0.85}>
              <Text style={styles.finalizeBtnText}>Finalizar Pedido</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <CheckoutModal visible={showModal} onClose={handleClose} total={total} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
  },
  backText: { fontSize: 24, color: '#333' },
  logoTop: { fontSize: 18, fontWeight: '900', color: '#7EC8E3', letterSpacing: 2, textAlign: 'center' },
  logoBottom: { fontSize: 11, fontWeight: '700', color: '#5BB5D5', letterSpacing: 5, textAlign: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 18, color: '#aaa' },
  cartItem: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 14,
    padding: 10, borderRadius: 12, backgroundColor: '#fafafa',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  itemImage: { width: 70, height: 70, borderRadius: 10, backgroundColor: '#eee' },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: 14, fontWeight: '700', color: '#222' },
  itemDesc: { fontSize: 12, color: '#888', marginTop: 2 },
  itemQty: { fontSize: 12, color: '#7EC8E3', fontWeight: '700', marginTop: 4 },
  deleteBtn: { padding: 6 },
  deleteIcon: { fontSize: 20 },
  summaryBox: { marginTop: 20, padding: 16, backgroundColor: '#f8f8f8', borderRadius: 16 },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: '#222', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: '#666' },
  summaryValue: { fontSize: 14, color: '#333' },
  totalRow: { marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#eee' },
  totalLabel: { fontSize: 16, fontWeight: '800', color: '#222' },
  totalValue: { fontSize: 16, fontWeight: '800', color: '#222' },
  footer: { padding: 20, paddingBottom: 32 },
  finalizeBtn: { backgroundColor: '#7EC8E3', borderRadius: 12, height: 52, alignItems: 'center', justifyContent: 'center' },
  finalizeBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, paddingBottom: 44 },
  title: { fontSize: 22, fontWeight: '800', color: '#222', marginBottom: 20, textAlign: 'center' },
  subtitle: { fontSize: 15, fontWeight: '600', color: '#555', marginBottom: 14 },
  methodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  methodBtn: { flex: 1, minWidth: '40%', padding: 14, borderRadius: 12, borderWidth: 2, borderColor: '#e0e0e0', alignItems: 'center' },
  methodSelected: { borderColor: '#7EC8E3', backgroundColor: '#7EC8E3' },
  methodEmoji: { fontSize: 24, marginBottom: 4 },
  methodLabel: { fontSize: 14, fontWeight: '600', color: '#444' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  totalLabel: { fontSize: 18, fontWeight: '700', color: '#222' },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#5BB5D5' },
  confirmBtn: { backgroundColor: '#7EC8E3', borderRadius: 12, height: 52, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelBtn: { alignItems: 'center' },
  cancelText: { color: '#aaa', fontSize: 15 },
  trackingBox: { backgroundColor: '#f2fbff', borderRadius: 16, padding: 20, marginBottom: 24 },
  trackingTitle: { fontSize: 18, fontWeight: '800', color: '#333', marginBottom: 8 },
  trackingDesc: { fontSize: 13, color: '#777', lineHeight: 20, marginBottom: 16 },
  etaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  etaEmoji: { fontSize: 16, marginRight: 6 },
  etaText: { fontSize: 14, color: '#555' },
  progressBar: { height: 8, backgroundColor: '#ddd', borderRadius: 4, marginBottom: 8 },
  progressFill: { height: 8, backgroundColor: '#7EC8E3', borderRadius: 4 },
  stepsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stepLabel: { fontSize: 12, color: '#bbb' },
});

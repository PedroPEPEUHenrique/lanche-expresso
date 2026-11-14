import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator,
  RefreshControl, Alert, Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { listarInsumos, criarInsumo, movimentarInsumo } from '../../services/gestaoService';
import { Insumo } from '../../types';
import { theme } from '../../style/theme';

const UNIDADES: Insumo['unidade'][] = ['kg', 'g', 'l', 'ml', 'un'];

type Movimento = { insumo: Insumo; tipo: 'entrada' | 'perda' | 'ajuste'; quantidade: string; vlUnitario: string; motivo: string };

/**
 * Estoque de insumos.
 *
 * O que está no mínimo ou abaixo sobe para o topo e vem marcado — é a razão
 * de o gestor abrir esta tela. Saldo negativo não é escondido: significa que
 * a contagem está errada ou que falta ficha técnica, e as duas coisas pedem
 * ação.
 */
export default function EstoqueScreen() {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [novo, setNovo] = useState<{ nome: string; unidade: Insumo['unidade']; qtdMinima: string } | null>(null);
  const [movimento, setMovimento] = useState<Movimento | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setInsumos(await listarInsumos());
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Não foi possível carregar o estoque');
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  const salvarInsumo = async () => {
    if (!novo?.nome.trim()) return Alert.alert('Atenção', 'Informe o nome do insumo.');
    setOcupado(true);
    try {
      await criarInsumo({
        nome: novo.nome.trim(), unidade: novo.unidade,
        qtdMinima: Number(novo.qtdMinima.replace(',', '.')) || 0,
      });
      setNovo(null);
      await carregar();
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Tente novamente.');
    } finally { setOcupado(false); }
  };

  const salvarMovimento = async () => {
    if (!movimento) return;
    const qtd = Number(movimento.quantidade.replace(',', '.'));
    if (!Number.isFinite(qtd) || qtd <= 0) return Alert.alert('Atenção', 'Informe uma quantidade maior que zero.');
    const custo = Number(movimento.vlUnitario.replace(',', '.'));
    if (movimento.tipo === 'entrada' && !(custo > 0)) {
      return Alert.alert('Atenção', 'Informe o custo unitário da compra.');
    }

    setOcupado(true);
    try {
      await movimentarInsumo(movimento.insumo.idInsumo, {
        tipo: movimento.tipo, quantidade: qtd,
        vlUnitario: movimento.tipo === 'entrada' ? custo : undefined,
        motivo: movimento.motivo.trim() || undefined,
      });
      setMovimento(null);
      await carregar();
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Tente novamente.');
    } finally { setOcupado(false); }
  };

  const escolherMovimento = (insumo: Insumo) => {
    Alert.alert(insumo.nome, 'O que aconteceu com este insumo?', [
      { text: 'Entrou (compra)', onPress: () => setMovimento({ insumo, tipo: 'entrada', quantidade: '', vlUnitario: '', motivo: '' }) },
      { text: 'Perda', onPress: () => setMovimento({ insumo, tipo: 'perda', quantidade: '', vlUnitario: '', motivo: '' }) },
      { text: 'Contei e está diferente', onPress: () => setMovimento({ insumo, tipo: 'ajuste', quantidade: '', vlUnitario: '', motivo: '' }) },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  if (carregando) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={theme.ink} />
      </SafeAreaView>
    );
  }

  const repor = insumos.filter((i) => i.repor).length;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="px-5 pt-2 pb-4 border-b border-ink flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-extrabold text-ink">Estoque</Text>
          <Text className="text-sm text-ink-soft mt-0.5">
            {repor > 0 ? `${repor} insumo(s) para repor` : `${insumos.length} insumo(s)`}
          </Text>
        </View>
        <TouchableOpacity
          className="px-3 py-2 rounded-full border border-ink bg-brand"
          onPress={() => setNovo({ nome: '', unidade: 'kg', qtdMinima: '' })}
        >
          <Text className="text-xs font-bold text-ink">+ Insumo</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={insumos}
        keyExtractor={(i) => String(i.idInsumo)}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={atualizando} onRefresh={() => { setAtualizando(true); carregar(); }} tintColor={theme.ink} />
        }
        ListEmptyComponent={
          <View className="items-center mt-24 px-10">
            <Ionicons name="cube-outline" size={48} color={theme.inkMuted} />
            <Text className="text-ink-soft text-center mt-3">
              Nenhum insumo cadastrado. O estoque só baixa sozinho depois que os
              produtos tiverem ficha técnica.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const negativo = item.qtdAtual < 0;
          return (
            <TouchableOpacity
              className={`flex-row items-center px-5 py-3 border-b border-ink ${item.repor ? 'bg-brand-light' : 'bg-white'}`}
              onPress={() => escolherMovimento(item)}
              activeOpacity={0.7}
            >
              <View className="flex-1 pr-3">
                <View className="flex-row items-center gap-x-2">
                  <Text className="text-base font-semibold text-ink">{item.nome}</Text>
                  {item.repor && (
                    <View className="px-2 py-0.5 rounded-full border-2 border-ink bg-brand">
                      <Text className="text-[10px] font-bold text-ink">REPOR</Text>
                    </View>
                  )}
                </View>
                <Text className="text-xs text-ink-soft mt-0.5">
                  Mínimo {item.qtdMinima} {item.unidade} · R$ {item.vlCustoMedio.toFixed(2)}/{item.unidade}
                </Text>
              </View>
              <View className="items-end">
                <Text className={`text-lg font-extrabold ${negativo ? 'text-danger' : 'text-ink'}`}>
                  {item.qtdAtual}
                </Text>
                <Text className="text-[11px] text-ink-soft">{item.unidade}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Novo insumo */}
      <Modal visible={!!novo} transparent animationType="slide" onRequestClose={() => setNovo(null)}>
        <KeyboardAvoidingView className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View className="bg-white rounded-t-3xl border-t-2 border-ink p-5 pb-8">
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text className="text-lg font-extrabold text-ink mb-4">Novo insumo</Text>
              <Campo rotulo="Nome" valor={novo?.nome ?? ''} placeholder="Carne bovina"
                aoMudar={(v: string) => novo && setNovo({ ...novo, nome: v })} />

              <Text className="text-sm font-semibold text-ink-soft mb-1.5">Unidade</Text>
              <View className="flex-row flex-wrap gap-2 mb-3">
                {UNIDADES.map((u) => (
                  <TouchableOpacity
                    key={u}
                    className={`px-4 py-2 rounded-full border-2 border-ink ${novo?.unidade === u ? 'bg-brand' : 'bg-white'}`}
                    onPress={() => novo && setNovo({ ...novo, unidade: u })}
                  >
                    <Text className="text-xs font-bold text-ink">{u}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Campo rotulo="Avisar quando ficar abaixo de" valor={novo?.qtdMinima ?? ''} placeholder="0 desliga o aviso"
                tipoTeclado="decimal-pad"
                aoMudar={(v: string) => novo && setNovo({ ...novo, qtdMinima: v })} />

              <View className="flex-row gap-x-3 mt-2">
                <TouchableOpacity className="flex-1 border-2 border-ink rounded-2xl h-12 items-center justify-center bg-white"
                  onPress={() => setNovo(null)}>
                  <Text className="text-base font-bold text-ink">Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 bg-brand border-2 border-ink rounded-2xl h-12 items-center justify-center"
                  onPress={salvarInsumo} disabled={ocupado}>
                  {ocupado ? <ActivityIndicator color={theme.ink} /> : (
                    <Text className="text-base font-bold text-ink">Criar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Movimento */}
      <Modal visible={!!movimento} transparent animationType="slide" onRequestClose={() => setMovimento(null)}>
        <KeyboardAvoidingView className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View className="bg-white rounded-t-3xl border-t-2 border-ink p-5 pb-8">
            <Text className="text-lg font-extrabold text-ink">{movimento?.insumo.nome}</Text>
            <Text className="text-sm text-ink-soft mb-4">
              {movimento?.tipo === 'entrada' ? 'Entrada por compra'
                : movimento?.tipo === 'perda' ? 'Baixa por perda'
                : `Contagem física — informe o total que existe hoje (sistema: ${movimento?.insumo.qtdAtual})`}
            </Text>

            <Campo
              rotulo={movimento?.tipo === 'ajuste' ? `Quantidade contada (${movimento?.insumo.unidade})` : `Quantidade (${movimento?.insumo.unidade})`}
              valor={movimento?.quantidade ?? ''} placeholder="0" tipoTeclado="decimal-pad"
              aoMudar={(v: string) => movimento && setMovimento({ ...movimento, quantidade: v })} />

            {movimento?.tipo === 'entrada' && (
              <Campo rotulo={`Custo por ${movimento.insumo.unidade} (R$)`} valor={movimento.vlUnitario}
                placeholder="30,00" tipoTeclado="decimal-pad"
                aoMudar={(v: string) => setMovimento({ ...movimento, vlUnitario: v })} />
            )}

            <Campo rotulo="Motivo" valor={movimento?.motivo ?? ''} placeholder="Opcional"
              aoMudar={(v: string) => movimento && setMovimento({ ...movimento, motivo: v })} />

            <View className="flex-row gap-x-3 mt-2">
              <TouchableOpacity className="flex-1 border-2 border-ink rounded-2xl h-12 items-center justify-center bg-white"
                onPress={() => setMovimento(null)}>
                <Text className="text-base font-bold text-ink">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-brand border-2 border-ink rounded-2xl h-12 items-center justify-center"
                onPress={salvarMovimento} disabled={ocupado}>
                {ocupado ? <ActivityIndicator color={theme.ink} /> : (
                  <Text className="text-base font-bold text-ink">Registrar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function Campo({ rotulo, valor, aoMudar, placeholder, tipoTeclado }: any) {
  const [focado, setFocado] = useState(false);
  return (
    <View className="mb-3">
      <Text className="text-sm font-semibold text-ink-soft mb-1.5">{rotulo}</Text>
      <View className={`border-[1.5px] rounded-xl px-3 ${focado ? 'border-ink bg-brand-light' : 'border-ink bg-white'}`}>
        <TextInput
          className="text-ink text-base h-12"
          value={valor} onChangeText={aoMudar}
          onFocus={() => setFocado(true)} onBlur={() => setFocado(false)}
          placeholder={placeholder} placeholderTextColor={theme.inkMuted}
          keyboardType={tipoTeclado}
        />
      </View>
    </View>
  );
}

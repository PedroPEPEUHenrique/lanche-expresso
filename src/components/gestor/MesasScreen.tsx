import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator,
  RefreshControl, Alert, Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { listarSalao } from '../../services/salaoService';
import { criarMesa, atualizarMesa, removerMesa } from '../../services/mesaService';
import { Mesa } from '../../types';
import { theme } from '../../style/theme';

type Rascunho = { idMesa?: number; numero: string; setor: string; capacidade: string };

/**
 * Cadastro das mesas do salão.
 *
 * É a primeira coisa que um restaurante novo precisa: sem mesa não há comanda,
 * e sem comanda o app não serve para nada. A tela mostra o estado atual junto
 * do cadastro porque mesa ocupada não pode ser removida.
 */
export default function MesasScreen() {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [editando, setEditando] = useState<Rascunho | null>(null);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setMesas(await listarSalao());
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Não foi possível carregar as mesas');
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  const salvar = async () => {
    if (!editando?.numero.trim()) return Alert.alert('Atenção', 'A mesa precisa de um número.');
    setSalvando(true);
    try {
      const dados = {
        numero: editando.numero.trim(),
        setor: editando.setor.trim() || undefined,
        capacidade: editando.capacidade ? Number(editando.capacidade) : undefined,
      };
      if (editando.idMesa) await atualizarMesa(editando.idMesa, dados);
      else await criarMesa(dados);
      setEditando(null);
      await carregar();
    } catch (e: any) {
      Alert.alert('Erro ao salvar', e.message ?? 'Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const remover = (mesa: Mesa) => {
    Alert.alert('Remover mesa?', `A mesa ${mesa.numero} sai do salão. O histórico de comandas é preservado.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover', style: 'destructive',
        onPress: async () => {
          try { await removerMesa(mesa.idMesa); await carregar(); }
          // A API recusa mesa com comanda aberta: o salão perderia a conta de
          // vista e ela ficaria aberta sem tela que a alcance.
          catch (e: any) { Alert.alert('Não foi possível remover', e.message ?? 'Tente novamente.'); }
        },
      },
    ]);
  };

  if (carregando) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={theme.ink} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="px-5 pt-2 pb-4 border-b border-ink flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-extrabold text-ink">Mesas</Text>
          <Text className="text-sm text-ink-soft mt-0.5">
            {mesas.length} no salão · {mesas.filter((m) => m.ocupada).length} ocupada(s)
          </Text>
        </View>
        <TouchableOpacity
          className="px-3 py-2 rounded-full border border-ink bg-brand"
          onPress={() => setEditando({ numero: '', setor: '', capacidade: '' })}
        >
          <Text className="text-xs font-bold text-ink">+ Mesa</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={mesas}
        keyExtractor={(m) => String(m.idMesa)}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={atualizando} onRefresh={() => { setAtualizando(true); carregar(); }} tintColor={theme.ink} />
        }
        ListEmptyComponent={
          <View className="items-center mt-24 px-10">
            <Ionicons name="grid-outline" size={48} color={theme.inkMuted} />
            <Text className="text-ink-soft text-center mt-3">
              Nenhuma mesa ainda. Crie as mesas para o garçom poder abrir comandas.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="flex-row items-center px-5 py-3 border-b border-ink">
            <View className={`w-12 h-12 rounded-xl border-2 border-ink items-center justify-center mr-3 ${item.ocupada ? 'bg-brand' : 'bg-white'}`}>
              <Text className="text-lg font-extrabold text-ink">{item.numero}</Text>
            </View>
            <TouchableOpacity
              className="flex-1"
              activeOpacity={0.7}
              onPress={() => setEditando({
                idMesa: item.idMesa, numero: item.numero,
                setor: item.setor ?? '', capacidade: item.capacidade ? String(item.capacidade) : '',
              })}
            >
              <Text className="text-base font-semibold text-ink">
                {item.setor || 'Sem setor'}
              </Text>
              <Text className="text-sm text-ink-soft mt-0.5">
                {item.capacidade ? `${item.capacidade} lugares` : 'Capacidade não definida'}
                {item.ocupada ? ' · ocupada' : ''}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => remover(item)} className="p-2">
              <Ionicons name="trash-outline" size={20} color={theme.inkMuted} />
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal visible={!!editando} transparent animationType="slide" onRequestClose={() => setEditando(null)}>
        <KeyboardAvoidingView
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View className="bg-white rounded-t-3xl border-t-2 border-ink p-5 pb-8">
            <Text className="text-lg font-extrabold text-ink mb-4">
              {editando?.idMesa ? `Mesa ${editando.numero}` : 'Nova mesa'}
            </Text>
            <Campo rotulo="Número" valor={editando?.numero ?? ''} placeholder="12"
              aoMudar={(v: string) => editando && setEditando({ ...editando, numero: v })} />
            <Campo rotulo="Setor" valor={editando?.setor ?? ''} placeholder="Salão, Varanda..."
              aoMudar={(v: string) => editando && setEditando({ ...editando, setor: v })} />
            <Campo rotulo="Capacidade" valor={editando?.capacidade ?? ''} placeholder="4" tipoTeclado="number-pad"
              aoMudar={(v: string) => editando && setEditando({ ...editando, capacidade: v })} />

            <View className="flex-row gap-x-3 mt-2">
              <TouchableOpacity
                className="flex-1 border-2 border-ink rounded-2xl h-12 items-center justify-center bg-white"
                onPress={() => setEditando(null)}
              >
                <Text className="text-base font-bold text-ink">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-brand border-2 border-ink rounded-2xl h-12 items-center justify-center"
                onPress={salvar} disabled={salvando}
              >
                {salvando ? <ActivityIndicator color={theme.ink} /> : (
                  <Text className="text-base font-bold text-ink">Salvar</Text>
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

import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { listarSalao } from '../../services/salaoService';
import { criarMesa, atualizarMesa, removerMesa } from '../../services/mesaService';
import { Mesa } from '../../types';
import { theme } from '../../style/theme';
import { Botao, BotaoVazado, Colchetes, Fundo, Numero, Regua, Rotulo, Selo, Vazio } from '../cyber';
import { Campo } from '../cyber/Campo';
import { ModalBase } from './CardapioScreen';

type Rascunho = { idMesa?: number; numero: string; setor: string; capacidade: string };

/**
 * Cadastro das mesas do salão.
 *
 * É a primeira coisa que um restaurante novo precisa: sem mesa não há
 * comanda, e sem comanda o app não serve para nada. A tela mostra o estado
 * atual junto do cadastro porque mesa ocupada não pode ser removida.
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
    if (!editando?.numero.trim()) return Alert.alert('Dados incompletos', 'A mesa precisa de um número.');
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
    } finally { setSalvando(false); }
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
      <Fundo><View className="flex-1 items-center justify-center"><ActivityIndicator size="large" color={theme.neon} /></View></Fundo>
    );
  }

  return (
    <Fundo>
      <SafeAreaView className="flex-1" edges={['top']}>
        <View style={{ backgroundColor: theme.void, borderBottomWidth: 1, borderBottomColor: theme.line }}>
          <Regua cor="cyan" />
          <View className="px-4 pt-3 pb-3 flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
              <Ionicons name="arrow-back" size={24} color={theme.cyan} />
            </TouchableOpacity>
            <View className="flex-1">
              <Text style={{ fontFamily: theme.mono, fontSize: 22, fontWeight: '700', color: theme.text, letterSpacing: 2 }}>
                MESAS
              </Text>
              <Rotulo cor="muted" tamanho={9}>
                {mesas.length} no salão · {mesas.filter((m) => m.ocupada).length} ocupada(s)
              </Rotulo>
            </View>
            <TouchableOpacity
              className="px-3 items-center justify-center"
              style={{ height: 40, backgroundColor: theme.neon }}
              onPress={() => setEditando({ numero: '', setor: '', capacidade: '' })}
            >
              <Text style={{ fontFamily: theme.mono, fontSize: 10, fontWeight: '700', letterSpacing: 1, color: theme.void }}>
                + MESA
              </Text>
              <Colchetes cor="neon" tamanho={7} espessura={2} />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={mesas}
          keyExtractor={(m) => String(m.idMesa)}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={atualizando} onRefresh={() => { setAtualizando(true); carregar(); }}
              tintColor={theme.neon} colors={[theme.neon]} progressBackgroundColor={theme.surface} />
          }
          ListEmptyComponent={
            <Vazio icone="grid-outline" titulo="Salão sem mesas"
              texto="Crie as mesas para o garçom poder abrir comandas." />
          }
          renderItem={({ item }) => (
            <View
              className="flex-row items-center px-3 py-3"
              style={{ borderWidth: 1, borderColor: item.ocupada ? theme.neon : theme.line, backgroundColor: theme.surface }}
            >
              <View
                className="items-center justify-center mr-3"
                style={{
                  width: 48, height: 48, borderWidth: 1,
                  borderColor: item.ocupada ? theme.neon : theme.line,
                  backgroundColor: item.ocupada ? theme.raised : 'transparent',
                }}
              >
                <Numero cor={item.ocupada ? 'neon' : 'muted'} tamanho={20}>{item.numero}</Numero>
              </View>

              <TouchableOpacity
                className="flex-1"
                activeOpacity={0.7}
                onPress={() => setEditando({
                  idMesa: item.idMesa, numero: item.numero,
                  setor: item.setor ?? '', capacidade: item.capacidade ? String(item.capacidade) : '',
                })}
              >
                <Text style={{ fontFamily: theme.mono, fontSize: 13, fontWeight: '700', letterSpacing: 0.5, color: theme.text }}>
                  {(item.setor || 'SEM SETOR').toUpperCase()}
                </Text>
                <View className="flex-row items-center gap-x-2 mt-1.5">
                  <Rotulo cor="muted" tamanho={9}>
                    {item.capacidade ? `${item.capacidade} lugares` : 'cap. indefinida'}
                  </Rotulo>
                  {item.ocupada && <Selo cor="neon">ocupada</Selo>}
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => remover(item)} className="p-2">
                <Ionicons name="trash-outline" size={18} color={theme.muted} />
              </TouchableOpacity>

              <Colchetes cor={item.ocupada ? 'neon' : 'muted'} tamanho={9} espessura={1} />
            </View>
          )}
        />

        <ModalBase visivel={!!editando} aoFechar={() => setEditando(null)}>
          <Text style={{ fontFamily: theme.mono, fontSize: 16, fontWeight: '700', letterSpacing: 2, color: theme.text }}>
            {editando?.idMesa ? `MESA ${editando.numero}` : 'NOVA MESA'}
          </Text>
          <View className="gap-y-3 mt-4">
            <Campo rotulo="Número" valor={editando?.numero ?? ''} placeholder="12"
              aoMudar={(v) => editando && setEditando({ ...editando, numero: v })} />
            <Campo rotulo="Setor" valor={editando?.setor ?? ''} placeholder="Salão, Varanda..."
              aoMudar={(v) => editando && setEditando({ ...editando, setor: v })} />
            <Campo rotulo="Capacidade" valor={editando?.capacidade ?? ''} placeholder="4" tipoTeclado="number-pad"
              aoMudar={(v) => editando && setEditando({ ...editando, capacidade: v })} />
          </View>
          <View className="flex-row gap-x-3 mt-5">
            <View className="flex-1"><BotaoVazado cor="muted" onPress={() => setEditando(null)}>Cancelar</BotaoVazado></View>
            <View className="flex-1"><Botao onPress={salvar} carregando={salvando}>Salvar</Botao></View>
          </View>
        </ModalBase>
      </SafeAreaView>
    </Fundo>
  );
}

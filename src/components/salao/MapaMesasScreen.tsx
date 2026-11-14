import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { listarSalao, abrirComanda } from '../../services/salaoService';
import { useFilaEnvioStore } from '../../store/filaEnvioStore';
import { useAuthStore } from '../../store/authStore';
import { Mesa } from '../../types';
import { theme } from '../../style/theme';

/**
 * O mapa do salão: a primeira tela do garçom.
 *
 * Mesa livre é branca com contorno; ocupada é amarela cheia, com o total e há
 * quanto tempo está aberta. O preenchimento é o que se lê de relance, atrás do
 * balcão, sem precisar ler texto.
 */
export default function MapaMesasScreen() {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [abrindo, setAbrindo] = useState<number | null>(null);
  const pendentes = useFilaEnvioStore((s) => s.pendentes);
  const { user, empresa } = useAuthStore();

  const carregar = useCallback(async () => {
    try {
      setErro(null);
      setMesas(await listarSalao());
    } catch (e: any) {
      setErro(e.message ?? 'Erro ao carregar o salão');
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  // Recarrega ao voltar da comanda: o total da mesa muda a cada rodada.
  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  const aoTocar = async (mesa: Mesa) => {
    if (mesa.ocupada && mesa.idComanda) {
      router.push({ pathname: '/comanda/[id]', params: { id: String(mesa.idComanda) } });
      return;
    }
    setAbrindo(mesa.idMesa);
    try {
      const comanda = await abrirComanda(mesa.idMesa);
      router.push({ pathname: '/comanda/[id]', params: { id: String(comanda.idComanda) } });
    } catch (e: any) {
      // A mesa pode ter sido aberta por outro garçom entre o carregamento da
      // tela e o toque. A API devolve a comanda existente no 409.
      const jaAberta = e?.dados?.idComanda;
      if (jaAberta) router.push({ pathname: '/comanda/[id]', params: { id: String(jaAberta) } });
      else Alert.alert('Não foi possível abrir', e.message ?? 'Tente novamente.');
    } finally {
      setAbrindo(null);
    }
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
        <View className="flex-1">
          <Text className="text-2xl font-extrabold text-ink">Salão</Text>
          <Text className="text-sm text-ink-soft mt-0.5" numberOfLines={1}>
            {empresa?.nome} · {user?.nome}
          </Text>
        </View>
        <TouchableOpacity
          className="p-2 rounded-full border border-ink ml-3"
          onPress={() => router.push('/conta')}
        >
          <Ionicons name="person-outline" size={20} color={theme.ink} />
        </TouchableOpacity>
      </View>

      {pendentes.length > 0 && (
        <View className="mx-5 mt-3 px-4 py-3 rounded-2xl bg-brand-light border border-ink flex-row items-center gap-x-2">
          <Ionicons name="cloud-offline-outline" size={18} color={theme.ink} />
          <Text className="flex-1 text-sm font-semibold text-ink">
            {pendentes.length} rodada(s) aguardando envio
          </Text>
        </View>
      )}

      {erro && (
        <View className="mx-5 mt-3 px-4 py-3 rounded-2xl bg-danger-light border border-danger">
          <Text className="text-sm font-semibold text-danger">{erro}</Text>
        </View>
      )}

      <FlatList
        data={mesas}
        keyExtractor={(m) => String(m.idMesa)}
        numColumns={2}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 20 }}
        contentContainerStyle={{ paddingVertical: 16, gap: 12 }}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={() => { setAtualizando(true); carregar(); }}
            tintColor={theme.ink}
          />
        }
        ListEmptyComponent={
          <View className="items-center mt-20 px-10">
            <Ionicons name="grid-outline" size={48} color={theme.inkMuted} />
            <Text className="text-ink-soft text-center mt-3">
              Nenhuma mesa cadastrada. O gestor cria as mesas do salão.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <CardMesa mesa={item} carregando={abrindo === item.idMesa} onPress={() => aoTocar(item)} />
        )}
      />
    </SafeAreaView>
  );
}

function CardMesa({ mesa, carregando, onPress }: { mesa: Mesa; carregando: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      className={`flex-1 rounded-2xl border-2 border-ink p-4 min-h-[110px] justify-between ${
        mesa.ocupada ? 'bg-brand' : 'bg-white'
      }`}
      activeOpacity={0.8}
      onPress={onPress}
      disabled={carregando}
    >
      <View className="flex-row items-start justify-between">
        <Text className="text-3xl font-extrabold text-ink">{mesa.numero}</Text>
        {carregando ? (
          <ActivityIndicator color={theme.ink} />
        ) : mesa.ocupada ? (
          <Ionicons name="people" size={20} color={theme.ink} />
        ) : (
          <Ionicons name="add-circle-outline" size={20} color={theme.inkMuted} />
        )}
      </View>

      {mesa.ocupada ? (
        <View>
          <Text className="text-base font-extrabold text-ink">
            R$ {Number(mesa.vlTotal ?? 0).toFixed(2)}
          </Text>
          <Text className="text-[11px] text-ink mt-0.5" numberOfLines={1}>
            {mesa.nomeGarcom ?? '—'} · {tempoAberta(mesa.dtAbertura)}
          </Text>
        </View>
      ) : (
        <Text className="text-xs font-semibold text-ink-muted">
          Livre{mesa.capacidade ? ` · ${mesa.capacidade} lugares` : ''}
        </Text>
      )}
    </TouchableOpacity>
  );
}

/** Há quanto tempo a mesa está ocupada — o dado que o garçom usa para girar. */
function tempoAberta(dtAbertura?: string | null): string {
  if (!dtAbertura) return '';
  const minutos = Math.floor((Date.now() - new Date(dtAbertura).getTime()) / 60000);
  if (minutos < 1) return 'agora';
  if (minutos < 60) return `${minutos} min`;
  return `${Math.floor(minutos / 60)}h${String(minutos % 60).padStart(2, '0')}`;
}

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
import { Cabecalho, Colchetes, Fundo, Halo, Numero, Painel, Rotulo, Selo, Vazio } from '../cyber';

/**
 * Mapa do salão: a primeira tela do garçom.
 *
 * Mesa livre é um quadro vazado e frio; ocupada acende em neon com halo. O
 * preenchimento luminoso é o que se lê de relance atrás do balcão, sem
 * precisar ler texto — num tema escuro essa diferença fica ainda mais forte
 * do que era no claro.
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
      else Alert.alert('Falha na abertura', e.message ?? 'Tente novamente.');
    } finally {
      setAbrindo(null);
    }
  };

  if (carregando) {
    return (
      <Fundo>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.neon} />
          <View className="mt-4"><Rotulo cor="muted">carregando salão</Rotulo></View>
        </View>
      </Fundo>
    );
  }

  const ocupadas = mesas.filter((m) => m.ocupada).length;

  return (
    <Fundo>
      <SafeAreaView className="flex-1" edges={['top']}>
        <Cabecalho
          titulo="Salão"
          sub={`${empresa?.nome ?? ''} · ${ocupadas}/${mesas.length} ocupadas`}
          direita={
            <TouchableOpacity
              onPress={() => router.push('/conta')}
              className="items-center justify-center"
              style={{ width: 40, height: 40, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.surface }}
            >
              <Ionicons name="person-outline" size={18} color={theme.cyan} />
              <Colchetes cor="cyan" tamanho={7} espessura={1} />
            </TouchableOpacity>
          }
        />

        {pendentes.length > 0 && (
          <View className="mx-4 mt-3">
            <Painel cor="magenta" className="px-3 py-2.5 flex-row items-center gap-x-2">
              <Ionicons name="cloud-offline-outline" size={16} color={theme.magenta} />
              <View className="flex-1">
                <Rotulo cor="magenta">{pendentes.length} rodada(s) na fila de envio</Rotulo>
              </View>
            </Painel>
          </View>
        )}

        {erro && (
          <View className="mx-4 mt-3">
            <Painel cor="danger" className="px-3 py-2.5">
              <Rotulo cor="danger">{erro}</Rotulo>
            </Painel>
          </View>
        )}

        <FlatList
          data={mesas}
          keyExtractor={(m) => String(m.idMesa)}
          numColumns={2}
          columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
          contentContainerStyle={{ paddingVertical: 16, gap: 12 }}
          refreshControl={
            <RefreshControl
              refreshing={atualizando}
              onRefresh={() => { setAtualizando(true); carregar(); }}
              tintColor={theme.neon}
              colors={[theme.neon]}
              progressBackgroundColor={theme.surface}
            />
          }
          ListEmptyComponent={
            <Vazio icone="grid-outline" titulo="Salão vazio"
              texto="Nenhuma mesa cadastrada. O gestor monta o salão." />
          }
          renderItem={({ item }) => (
            <CardMesa mesa={item} carregando={abrindo === item.idMesa} onPress={() => aoTocar(item)} />
          )}
        />
      </SafeAreaView>
    </Fundo>
  );
}

function CardMesa({ mesa, carregando, onPress }: { mesa: Mesa; carregando: boolean; onPress: () => void }) {
  const cor = mesa.ocupada ? 'neon' : 'muted';

  const corpo = (
    <TouchableOpacity
      className="flex-1 p-3 justify-between"
      style={{
        minHeight: 124,
        backgroundColor: mesa.ocupada ? theme.raised : theme.surface,
        borderWidth: 1,
        borderColor: mesa.ocupada ? theme.neon : theme.line,
      }}
      activeOpacity={0.8}
      onPress={onPress}
      disabled={carregando}
    >
      <View className="flex-row items-start justify-between">
        <View>
          <Rotulo cor="muted" tamanho={9}>mesa</Rotulo>
          <Numero cor={mesa.ocupada ? 'neon' : 'muted'} tamanho={34}>{mesa.numero}</Numero>
        </View>
        {carregando ? (
          <ActivityIndicator color={theme.neon} />
        ) : (
          <Ionicons
            name={mesa.ocupada ? 'people' : 'add'}
            size={18}
            color={mesa.ocupada ? theme.neon : theme.muted}
          />
        )}
      </View>

      {mesa.ocupada ? (
        <View>
          <Text style={{ fontFamily: theme.mono, fontSize: 15, fontWeight: '700', color: theme.neon }}>
            R$ {Number(mesa.vlTotal ?? 0).toFixed(2)}
          </Text>
          <Text numberOfLines={1} style={{ fontFamily: theme.mono, fontSize: 9, color: theme.muted, letterSpacing: 1, marginTop: 2 }}>
            {(mesa.nomeGarcom ?? '—').toUpperCase()} · {tempoAberta(mesa.dtAbertura)}
          </Text>
        </View>
      ) : (
        <View className="flex-row">
          <Selo cor="muted">
            livre{mesa.capacidade ? ` ${mesa.capacidade}p` : ''}
          </Selo>
        </View>
      )}

      <Colchetes cor={cor} tamanho={11} espessura={2} />
    </TouchableOpacity>
  );

  // Só a mesa ocupada recebe halo: se todas brilhassem, nenhuma se destacaria.
  return mesa.ocupada
    ? <Halo cor="neon" intensidade={0.9} style={{ flex: 1 }}>{corpo}</Halo>
    : <View className="flex-1">{corpo}</View>;
}

/** Há quanto tempo a mesa está ocupada — o dado que o garçom usa para girar. */
function tempoAberta(dtAbertura?: string | null): string {
  if (!dtAbertura) return '';
  const minutos = Math.floor((Date.now() - new Date(dtAbertura).getTime()) / 60000);
  if (minutos < 1) return 'AGORA';
  if (minutos < 60) return `${minutos}MIN`;
  return `${Math.floor(minutos / 60)}H${String(minutos % 60).padStart(2, '0')}`;
}

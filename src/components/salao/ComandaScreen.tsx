import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { buscarComanda, fecharComanda, avancarStatus } from '../../services/salaoService';
import { usePendentesDaComanda } from '../../store/filaEnvioStore';
import { useRascunho } from '../../store/rascunhoStore';
import { Comanda, Rodada, StatusRodada } from '../../types';
import { theme } from '../../style/theme';

const ROTULO: Record<StatusRodada, string> = {
  enviado: 'Na fila',
  em_preparo: 'Preparando',
  pronto: 'Pronto',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};

// Mesma escala visual do painel da cozinha: contorno = não começou,
// amarelo = acontecendo, preto = encerrado.
const ESTILO: Record<StatusRodada, string> = {
  enviado: 'bg-white border border-ink',
  em_preparo: 'bg-brand border border-ink',
  pronto: 'bg-brand border border-ink',
  entregue: 'bg-ink border border-ink',
  cancelado: 'bg-danger-light border border-danger',
};

const TEXTO: Record<StatusRodada, string> = {
  enviado: 'text-ink',
  em_preparo: 'text-ink',
  pronto: 'text-ink',
  entregue: 'text-white',
  cancelado: 'text-danger',
};

export default function ComandaScreen({ idComanda }: { idComanda: number }) {
  const [comanda, setComanda] = useState<Comanda | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [fechando, setFechando] = useState(false);
  const pendentes = usePendentesDaComanda(idComanda);
  const { quantidadeTotal } = useRascunho(idComanda);

  const carregar = useCallback(async () => {
    try {
      setComanda(await buscarComanda(idComanda));
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Não foi possível carregar a comanda');
    } finally {
      setCarregando(false);
    }
  }, [idComanda]);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  const entregar = async (rodada: Rodada) => {
    try {
      await avancarStatus(rodada.idPedido, 'entregue');
      carregar();
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Não foi possível marcar como entregue');
    }
  };

  /**
   * Fechar a conta. A API recusa por padrão se houver rodada ainda na cozinha
   * — fechar com comida em preparo quase sempre é engano. O 409 traz quantas
   * são, e aí sim perguntamos se é para cancelar e fechar assim mesmo.
   */
  const fechar = async (forcar = false) => {
    setFechando(true);
    try {
      await fecharComanda(idComanda, forcar);
      router.back();
    } catch (e: any) {
      const naCozinha = e?.dados?.pendentes?.length;
      if (naCozinha && !forcar) {
        Alert.alert(
          'Ainda tem pedido na cozinha',
          `${naCozinha} pedido(s) desta mesa não foram entregues. Fechar agora cancela esses pedidos e eles saem da conta.`,
          [
            { text: 'Voltar', style: 'cancel' },
            { text: 'Cancelar e fechar', style: 'destructive', onPress: () => fechar(true) },
          ]
        );
      } else {
        Alert.alert('Erro', e.message ?? 'Não foi possível fechar a conta');
      }
    } finally {
      setFechando(false);
    }
  };

  if (carregando || !comanda) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={theme.ink} />
      </SafeAreaView>
    );
  }

  const fechada = comanda.status !== 'aberta';

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="px-5 pt-2 pb-4 border-b border-ink flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
          <Ionicons name="arrow-back" size={24} color={theme.ink} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-2xl font-extrabold text-ink">Mesa {comanda.numeroMesa}</Text>
          <Text className="text-sm text-ink-soft">
            {comanda.setor ? `${comanda.setor} · ` : ''}{comanda.nomeGarcom ?? ''}
          </Text>
        </View>
        {fechada && (
          <View className="px-3 py-1 rounded-full bg-ink">
            <Text className="text-xs font-bold text-white">Fechada</Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {pendentes.map((p) => (
          <View key={p.idLocal} className="mb-3 p-4 rounded-2xl bg-brand-light border border-ink">
            <View className="flex-row items-center gap-x-2 mb-1">
              <Ionicons name="cloud-offline-outline" size={16} color={theme.ink} />
              <Text className="text-xs font-bold text-ink">AGUARDANDO ENVIO</Text>
            </View>
            {p.itens.map((i, idx) => (
              <Text key={idx} className="text-sm text-ink">
                {i.quantidade}× {i.nome}
              </Text>
            ))}
            {p.tentativas > 0 && (
              <Text className="text-[11px] text-ink-soft mt-1">
                {p.tentativas} tentativa(s) · {p.ultimoErro}
              </Text>
            )}
          </View>
        ))}

        {comanda.rodadas.length === 0 && pendentes.length === 0 && (
          <View className="items-center mt-16">
            <Ionicons name="receipt-outline" size={48} color={theme.inkMuted} />
            <Text className="text-ink-soft mt-3 text-center">
              Nada lançado ainda nesta mesa.
            </Text>
          </View>
        )}

        {comanda.rodadas.map((rodada, i) => (
          <View key={rodada.idPedido} className="mb-3 rounded-2xl border border-ink overflow-hidden">
            <View className="flex-row items-center justify-between px-4 py-2.5 border-b border-ink">
              <Text className="text-xs font-bold text-ink-soft">
                {i + 1}ª RODADA · {hora(rodada.dtPedido)}
              </Text>
              <View className={`${ESTILO[rodada.status]} px-3 py-1 rounded-full`}>
                <Text className={`text-[11px] font-bold ${TEXTO[rodada.status]}`}>
                  {ROTULO[rodada.status]}
                </Text>
              </View>
            </View>

            <View className="px-4 py-3">
              {rodada.itens.map((item) => (
                <View key={item.idItensPedido} className="flex-row justify-between py-1">
                  <View className="flex-1 pr-3">
                    <Text className="text-sm text-ink">
                      {item.quantidade}× {item.nomeProduto}
                    </Text>
                    {!!item.observacao && (
                      <Text className="text-[11px] text-ink-soft italic">{item.observacao}</Text>
                    )}
                  </View>
                  <Text className="text-sm font-semibold text-ink">
                    R$ {item.vlTotal.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>

            {rodada.status === 'pronto' && (
              <TouchableOpacity
                className="bg-brand border-t border-ink py-3 items-center flex-row justify-center gap-x-2"
                onPress={() => entregar(rodada)}
                activeOpacity={0.85}
              >
                <Ionicons name="checkmark-circle-outline" size={18} color={theme.ink} />
                <Text className="text-sm font-bold text-ink">Levei para a mesa</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>

      <View className="px-5 pt-3 pb-6 border-t border-ink bg-white">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-base font-bold text-ink">Total da mesa</Text>
          <Text className="text-2xl font-extrabold text-ink">
            R$ {comanda.vlTotal.toFixed(2)}
          </Text>
        </View>

        {!fechada && (
          <View className="gap-y-2">
            <TouchableOpacity
              className="bg-brand border-2 border-ink rounded-2xl h-14 items-center justify-center flex-row gap-x-2"
              onPress={() => router.push({ pathname: '/comanda/[id]/novo-pedido', params: { id: String(idComanda) } })}
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={22} color={theme.ink} />
              <Text className="text-base font-bold text-ink">
                Lançar pedido{quantidadeTotal > 0 ? ` (${quantidadeTotal} em rascunho)` : ''}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="border-2 border-ink rounded-2xl h-12 items-center justify-center bg-white"
              onPress={() => fechar(false)}
              disabled={fechando}
              activeOpacity={0.85}
            >
              {fechando ? (
                <ActivityIndicator color={theme.ink} />
              ) : (
                <Text className="text-base font-bold text-ink">Fechar conta</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

function hora(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

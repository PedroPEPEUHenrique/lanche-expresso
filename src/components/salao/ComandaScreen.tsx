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
import { Botao, BotaoVazado, Colchetes, Divisor, Fundo, Halo, Numero, Regua, Rotulo, Selo, Vazio } from '../cyber';

const ROTULO: Record<StatusRodada, string> = {
  enviado: 'na fila', em_preparo: 'preparando', pronto: 'pronto',
  entregue: 'entregue', cancelado: 'cancelado',
};

// Mesma escala de calor do painel da cozinha, para o garçom e o cozinheiro
// lerem o mesmo pedido da mesma forma.
const COR: Record<StatusRodada, 'cyan' | 'neon' | 'magenta' | 'muted' | 'danger'> = {
  enviado: 'cyan', em_preparo: 'neon', pronto: 'magenta',
  entregue: 'muted', cancelado: 'danger',
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
   * Fecha a conta. A API recusa por padrão se houver rodada ainda na cozinha
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
          'Pedido ainda na cozinha',
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
      <Fundo>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.neon} />
        </View>
      </Fundo>
    );
  }

  const fechada = comanda.status !== 'aberta';

  return (
    <Fundo>
      <SafeAreaView className="flex-1" edges={['top']}>
        <View style={{ backgroundColor: theme.void, borderBottomWidth: 1, borderBottomColor: theme.line }}>
          <Regua />
          <View className="px-4 pt-3 pb-3 flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
              <Ionicons name="arrow-back" size={24} color={theme.cyan} />
            </TouchableOpacity>
            <View className="flex-1">
              <View className="flex-row items-baseline gap-x-2">
                <Rotulo cor="muted" tamanho={11}>mesa</Rotulo>
                <Numero cor="neon" tamanho={28}>{comanda.numeroMesa}</Numero>
              </View>
              <Rotulo cor="muted" tamanho={9}>
                {comanda.setor ? `${comanda.setor} · ` : ''}{comanda.nomeGarcom ?? ''}
              </Rotulo>
            </View>
            {fechada && <Selo cor="muted" solido>fechada</Selo>}
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          {pendentes.map((p) => (
            <View key={p.idLocal} className="mb-3">
              <View className="px-3 py-3" style={{ borderWidth: 1, borderColor: theme.magenta, backgroundColor: theme.surface }}>
                <View className="flex-row items-center gap-x-2 mb-2">
                  <Ionicons name="cloud-offline-outline" size={14} color={theme.magenta} />
                  <Rotulo cor="magenta" tamanho={9}>aguardando envio</Rotulo>
                </View>
                {p.itens.map((i, idx) => (
                  <Text key={idx} style={{ fontFamily: theme.mono, fontSize: 13, color: theme.text }}>
                    {i.quantidade}× {i.nome}
                  </Text>
                ))}
                {p.tentativas > 0 && (
                  <Text style={{ fontFamily: theme.mono, fontSize: 10, color: theme.muted, marginTop: 4 }}>
                    {p.tentativas} tentativa(s) · {p.ultimoErro}
                  </Text>
                )}
                <Colchetes cor="magenta" tamanho={9} espessura={1} />
              </View>
            </View>
          ))}

          {comanda.rodadas.length === 0 && pendentes.length === 0 && (
            <Vazio icone="receipt-outline" titulo="Mesa sem lançamento"
              texto="Nada foi pedido nesta mesa ainda." />
          )}

          {comanda.rodadas.map((rodada, i) => {
            const cor = COR[rodada.status];
            const corSolida = cor === 'neon' ? theme.neon
              : cor === 'magenta' ? theme.magenta
              : cor === 'cyan' ? theme.cyan
              : cor === 'danger' ? theme.danger : theme.muted;
            return (
              <View key={rodada.idPedido} className="mb-3" style={{ borderWidth: 1, borderColor: corSolida, backgroundColor: theme.surface }}>
                <View
                  className="flex-row items-center justify-between px-3 py-2"
                  style={{ backgroundColor: theme.raised, borderBottomWidth: 1, borderBottomColor: corSolida }}
                >
                  <Rotulo cor="muted" tamanho={9}>
                    rodada {String(i + 1).padStart(2, '0')} · {hora(rodada.dtPedido)}
                  </Rotulo>
                  <Selo cor={cor} solido={rodada.status === 'pronto'}>{ROTULO[rodada.status]}</Selo>
                </View>

                <View className="px-3 py-2">
                  {rodada.itens.map((item) => (
                    <View key={item.idItensPedido} className="flex-row justify-between py-1.5">
                      <View className="flex-1 pr-3">
                        <Text style={{ fontFamily: theme.mono, fontSize: 13, color: theme.text }}>
                          {item.quantidade}× {item.nomeProduto}
                        </Text>
                        {!!item.observacao && (
                          <Text style={{ fontFamily: theme.mono, fontSize: 10, color: theme.magenta, marginTop: 2 }}>
                            // {item.observacao}
                          </Text>
                        )}
                      </View>
                      <Text style={{ fontFamily: theme.mono, fontSize: 13, fontWeight: '700', color: theme.text }}>
                        {item.vlTotal.toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>

                {rodada.status === 'pronto' && (
                  <TouchableOpacity
                    className="py-3 items-center flex-row justify-center gap-x-2"
                    style={{ borderTopWidth: 1, borderTopColor: theme.magenta, backgroundColor: theme.raised }}
                    onPress={() => entregar(rodada)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="checkmark-circle-outline" size={16} color={theme.magenta} />
                    <Text style={{ fontFamily: theme.mono, fontSize: 12, fontWeight: '700', letterSpacing: 2, color: theme.magenta, textTransform: 'uppercase' }}>
                      Levei para a mesa
                    </Text>
                  </TouchableOpacity>
                )}

                <Colchetes cor={cor} tamanho={10} espessura={1} />
              </View>
            );
          })}
        </ScrollView>

        <View className="px-4 pt-3 pb-5" style={{ backgroundColor: theme.void, borderTopWidth: 1, borderTopColor: theme.line }}>
          <Halo cor="neon" intensidade={0.7}>
            <View className="px-4 py-3 flex-row justify-between items-center" style={{ backgroundColor: theme.raised, borderWidth: 1, borderColor: theme.neon }}>
              <Rotulo cor="muted" tamanho={11}>total da mesa</Rotulo>
              <Numero cor="neon" tamanho={26}>R$ {comanda.vlTotal.toFixed(2)}</Numero>
              <Colchetes cor="neon" tamanho={10} espessura={2} />
            </View>
          </Halo>

          {!fechada && (
            <View className="gap-y-2 mt-3">
              <Botao
                icone="add"
                onPress={() => router.push({ pathname: '/comanda/[id]/novo-pedido', params: { id: String(idComanda) } })}
              >
                {quantidadeTotal > 0 ? `Lançar · ${quantidadeTotal} em rascunho` : 'Lançar pedido'}
              </Botao>
              <BotaoVazado cor="muted" onPress={() => fechar(false)} carregando={fechando}>
                Fechar conta
              </BotaoVazado>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Fundo>
  );
}

function hora(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

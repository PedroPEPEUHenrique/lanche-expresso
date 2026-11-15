import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { listarInsumos, criarInsumo, movimentarInsumo } from '../../services/gestaoService';
import { Insumo } from '../../types';
import { theme } from '../../style/theme';
import { Botao, BotaoVazado, Cabecalho, Colchetes, Fundo, Halo, Numero, Rotulo, Selo, Vazio } from '../cyber';
import { Campo } from '../cyber/Campo';
import { ModalBase } from './CardapioScreen';

const UNIDADES: Insumo['unidade'][] = ['kg', 'g', 'l', 'ml', 'un'];

type Movimento = {
  insumo: Insumo; tipo: 'entrada' | 'perda' | 'ajuste';
  quantidade: string; vlUnitario: string; motivo: string;
};

/**
 * Estoque de insumos.
 *
 * O que está no mínimo ou abaixo sobe para o topo e acende em magenta — é a
 * razão de o gestor abrir esta tela. Saldo negativo aparece em vermelho e não
 * é escondido: significa contagem errada ou ficha técnica faltando, e as duas
 * coisas pedem ação.
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
    if (!novo?.nome.trim()) return Alert.alert('Dados incompletos', 'Informe o nome do insumo.');
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
    if (!Number.isFinite(qtd) || qtd <= 0) return Alert.alert('Dados inválidos', 'Informe uma quantidade maior que zero.');
    const custo = Number(movimento.vlUnitario.replace(',', '.'));
    if (movimento.tipo === 'entrada' && !(custo > 0)) {
      return Alert.alert('Dados incompletos', 'Informe o custo unitário da compra.');
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
    Alert.alert(insumo.nome, 'Qual movimento registrar?', [
      { text: 'Entrada (compra)', onPress: () => setMovimento({ insumo, tipo: 'entrada', quantidade: '', vlUnitario: '', motivo: '' }) },
      { text: 'Perda', onPress: () => setMovimento({ insumo, tipo: 'perda', quantidade: '', vlUnitario: '', motivo: '' }) },
      { text: 'Contagem física', onPress: () => setMovimento({ insumo, tipo: 'ajuste', quantidade: '', vlUnitario: '', motivo: '' }) },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  if (carregando) {
    return (
      <Fundo><View className="flex-1 items-center justify-center"><ActivityIndicator size="large" color={theme.neon} /></View></Fundo>
    );
  }

  const repor = insumos.filter((i) => i.repor).length;

  return (
    <Fundo>
      <SafeAreaView className="flex-1" edges={['top']}>
        <Cabecalho
          titulo="Estoque"
          sub={repor > 0 ? `${repor} insumo(s) para repor` : `${insumos.length} insumo(s) em linha`}
          direita={
            <TouchableOpacity
              className="px-3 items-center justify-center"
              style={{ height: 40, backgroundColor: theme.neon }}
              onPress={() => setNovo({ nome: '', unidade: 'kg', qtdMinima: '' })}
            >
              <Text style={{ fontFamily: theme.mono, fontSize: 10, fontWeight: '700', letterSpacing: 1, color: theme.void }}>
                + INSUMO
              </Text>
              <Colchetes cor="neon" tamanho={7} espessura={2} />
            </TouchableOpacity>
          }
        />

        <FlatList
          data={insumos}
          keyExtractor={(i) => String(i.idInsumo)}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={atualizando} onRefresh={() => { setAtualizando(true); carregar(); }}
              tintColor={theme.neon} colors={[theme.neon]} progressBackgroundColor={theme.surface} />
          }
          ListEmptyComponent={
            <Vazio icone="cube-outline" titulo="Estoque vazio"
              texto="O estoque só baixa sozinho depois que os produtos tiverem ficha técnica." />
          }
          renderItem={({ item }) => {
            const negativo = item.qtdAtual < 0;
            const cor = negativo ? 'danger' : item.repor ? 'magenta' : 'muted';
            const corSolida = negativo ? theme.danger : item.repor ? theme.magenta : theme.line;

            const corpo = (
              <TouchableOpacity
                className="flex-row items-center px-4 py-3"
                style={{ borderWidth: 1, borderColor: corSolida, backgroundColor: item.repor ? theme.raised : theme.surface }}
                onPress={() => escolherMovimento(item)}
                activeOpacity={0.75}
              >
                <View className="flex-1 pr-3">
                  <View className="flex-row items-center gap-x-2">
                    <Text style={{ fontFamily: theme.mono, fontSize: 13, fontWeight: '700', letterSpacing: 0.5, color: theme.text }}>
                      {item.nome.toUpperCase()}
                    </Text>
                    {item.repor && <Selo cor="magenta" solido>repor</Selo>}
                  </View>
                  <Text style={{ fontFamily: theme.mono, fontSize: 10, color: theme.muted, marginTop: 3 }}>
                    MIN {item.qtdMinima}{item.unidade} · R$ {item.vlCustoMedio.toFixed(2)}/{item.unidade}
                  </Text>
                </View>
                <View className="items-end">
                  <Numero cor={negativo ? 'danger' : item.repor ? 'magenta' : 'neon'} tamanho={22}>
                    {item.qtdAtual}
                  </Numero>
                  <Rotulo cor="muted" tamanho={9}>{item.unidade}</Rotulo>
                </View>
                <Colchetes cor={cor} tamanho={9} espessura={1} />
              </TouchableOpacity>
            );

            return item.repor ? <Halo cor="magenta" intensidade={0.7}>{corpo}</Halo> : corpo;
          }}
        />

        {/* Novo insumo */}
        <ModalBase visivel={!!novo} aoFechar={() => setNovo(null)}>
          <Text style={estilos.titulo}>NOVO INSUMO</Text>
          <View className="gap-y-3 mt-4">
            <Campo rotulo="Nome" valor={novo?.nome ?? ''} placeholder="Carne bovina"
              aoMudar={(v) => novo && setNovo({ ...novo, nome: v })} />
          </View>

          <View className="mt-3 mb-1"><Rotulo cor="muted">unidade</Rotulo></View>
          <View className="flex-row flex-wrap gap-2 mb-3">
            {UNIDADES.map((u) => {
              const ativa = novo?.unidade === u;
              return (
                <TouchableOpacity
                  key={u}
                  className="px-4 py-2"
                  style={{ borderWidth: 1, borderColor: ativa ? theme.neon : theme.line, backgroundColor: ativa ? theme.neon : theme.surface }}
                  onPress={() => novo && setNovo({ ...novo, unidade: u })}
                >
                  <Text style={{ fontFamily: theme.mono, fontSize: 11, fontWeight: '700', color: ativa ? theme.void : theme.muted }}>
                    {u.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Campo rotulo="Avisar abaixo de" valor={novo?.qtdMinima ?? ''} placeholder="0 desliga o aviso"
            tipoTeclado="decimal-pad" aoMudar={(v) => novo && setNovo({ ...novo, qtdMinima: v })} />

          <View className="flex-row gap-x-3 mt-5">
            <View className="flex-1"><BotaoVazado cor="muted" onPress={() => setNovo(null)}>Cancelar</BotaoVazado></View>
            <View className="flex-1"><Botao onPress={salvarInsumo} carregando={ocupado}>Criar</Botao></View>
          </View>
        </ModalBase>

        {/* Movimento */}
        <ModalBase visivel={!!movimento} aoFechar={() => setMovimento(null)}>
          <Text style={estilos.titulo}>{movimento?.insumo.nome.toUpperCase()}</Text>
          <View className="mt-1 mb-4">
            <Rotulo cor={movimento?.tipo === 'entrada' ? 'cyan' : movimento?.tipo === 'perda' ? 'danger' : 'magenta'}>
              {movimento?.tipo === 'entrada' ? 'entrada por compra'
                : movimento?.tipo === 'perda' ? 'baixa por perda'
                : `contagem física · sistema: ${movimento?.insumo.qtdAtual}${movimento?.insumo.unidade}`}
            </Rotulo>
          </View>

          <View className="gap-y-3">
            <Campo
              rotulo={movimento?.tipo === 'ajuste'
                ? `Total contado (${movimento?.insumo.unidade})`
                : `Quantidade (${movimento?.insumo.unidade})`}
              valor={movimento?.quantidade ?? ''} placeholder="0" tipoTeclado="decimal-pad"
              aoMudar={(v) => movimento && setMovimento({ ...movimento, quantidade: v })} />

            {movimento?.tipo === 'entrada' && (
              <Campo rotulo={`Custo por ${movimento.insumo.unidade} (R$)`} valor={movimento.vlUnitario}
                placeholder="30,00" tipoTeclado="decimal-pad"
                aoMudar={(v) => setMovimento({ ...movimento, vlUnitario: v })} />
            )}

            <Campo rotulo="Motivo" valor={movimento?.motivo ?? ''} placeholder="opcional"
              aoMudar={(v) => movimento && setMovimento({ ...movimento, motivo: v })} />
          </View>

          <View className="flex-row gap-x-3 mt-5">
            <View className="flex-1"><BotaoVazado cor="muted" onPress={() => setMovimento(null)}>Cancelar</BotaoVazado></View>
            <View className="flex-1"><Botao onPress={salvarMovimento} carregando={ocupado}>Registrar</Botao></View>
          </View>
        </ModalBase>
      </SafeAreaView>
    </Fundo>
  );
}

const estilos = {
  titulo: { fontFamily: theme.mono, fontSize: 16, fontWeight: '700' as const, letterSpacing: 2, color: theme.text },
};

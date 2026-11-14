import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
  RefreshControl, Alert, Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import {
  caixaAtual, abrirCaixa, fecharCaixa, lancarMovimento, carregarPainel,
} from '../../services/gestaoService';
import { Caixa, MovimentoCaixa, PainelRelatorio } from '../../types';
import { theme } from '../../style/theme';

type TipoManual = 'venda_externa' | 'despesa' | 'sangria' | 'suprimento';

const MANUAIS: { tipo: TipoManual; rotulo: string; entrada: boolean }[] = [
  { tipo: 'venda_externa', rotulo: 'Venda delivery', entrada: true },
  { tipo: 'suprimento', rotulo: 'Suprimento', entrada: true },
  { tipo: 'despesa', rotulo: 'Despesa', entrada: false },
  { tipo: 'sangria', rotulo: 'Sangria', entrada: false },
];

const ROTULO_MOV: Record<MovimentoCaixa['tipo'], string> = {
  venda: 'Venda', venda_externa: 'Delivery', despesa: 'Despesa',
  sangria: 'Sangria', suprimento: 'Suprimento',
};

const ENTRADA: Record<MovimentoCaixa['tipo'], boolean> = {
  venda: true, venda_externa: true, suprimento: true, despesa: false, sangria: false,
};

/**
 * Caixa do turno e relatórios do dia.
 *
 * Duas fontes, de propósito separadas na tela:
 *   Caixa  — o que passou pela gaveta neste turno. Inclui despesa e sangria.
 *   Vendas — o que o salão faturou no período, venha de que turno vier.
 * Misturá-las produziria números que não batem, e o gestor pararia de confiar
 * nos dois.
 */
export default function FinanceiroScreen() {
  const [caixa, setCaixa] = useState<Caixa | null>(null);
  const [painel, setPainel] = useState<PainelRelatorio | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [lancamento, setLancamento] = useState<{ tipo: TipoManual; valor: string; descricao: string } | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const [c, p] = await Promise.all([caixaAtual(), carregarPainel()]);
      setCaixa(c);
      setPainel(p);
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Não foi possível carregar o financeiro');
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  const abrir = () => {
    Alert.prompt?.(
      'Abrir caixa', 'Quanto há de troco na gaveta agora?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Abrir',
          onPress: async (valor?: string) => {
            setOcupado(true);
            try { await abrirCaixa(Number((valor ?? '0').replace(',', '.')) || 0); await carregar(); }
            catch (e: any) { Alert.alert('Erro', e.message ?? 'Tente novamente.'); }
            finally { setOcupado(false); }
          },
        },
      ],
      'plain-text', '0', 'decimal-pad'
    ) ?? abrirSemPrompt();
  };

  // Alert.prompt só existe no iOS. No Android abre com zero e o gestor lança
  // o troco como suprimento, que é o mesmo movimento com o nome certo.
  const abrirSemPrompt = async () => {
    setOcupado(true);
    try { await abrirCaixa(0); await carregar(); }
    catch (e: any) { Alert.alert('Erro', e.message ?? 'Tente novamente.'); }
    finally { setOcupado(false); }
  };

  const fechar = (forcar = false) => {
    if (!caixa) return;
    const esperado = caixa.resumo.vlEsperado;
    Alert.alert(
      'Fechar o caixa',
      `O sistema espera R$ ${esperado.toFixed(2)} na gaveta. Conte o dinheiro e confirme — se houver diferença, ela fica registrada.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Conferi, fechar',
          onPress: async () => {
            setOcupado(true);
            try {
              await fecharCaixa(caixa.idCaixa, esperado, forcar);
              await carregar();
            } catch (e: any) {
              const abertas = e?.dados?.comandasAbertas;
              if (abertas && !forcar) {
                Alert.alert(
                  'Ainda há mesa aberta',
                  `${abertas} mesa(s) com comanda aberta. Essas vendas entrariam no turno seguinte.`,
                  [{ text: 'Voltar', style: 'cancel' }, { text: 'Fechar assim mesmo', style: 'destructive', onPress: () => fechar(true) }]
                );
              } else {
                Alert.alert('Erro', e.message ?? 'Tente novamente.');
              }
            } finally { setOcupado(false); }
          },
        },
      ]
    );
  };

  const lancar = async () => {
    if (!lancamento) return;
    const valor = Number(lancamento.valor.replace(',', '.'));
    if (!Number.isFinite(valor) || valor <= 0) return Alert.alert('Atenção', 'Informe um valor maior que zero.');
    setOcupado(true);
    try {
      await lancarMovimento(lancamento.tipo, valor, lancamento.descricao.trim() || undefined);
      setLancamento(null);
      await carregar();
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Tente novamente.');
    } finally { setOcupado(false); }
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
      <View className="px-5 pt-2 pb-4 border-b border-ink">
        <Text className="text-2xl font-extrabold text-ink">Financeiro</Text>
        <Text className="text-sm text-ink-soft mt-0.5">
          {caixa ? `Caixa aberto desde ${hora(caixa.dtAbertura)}` : 'Caixa fechado'}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={atualizando} onRefresh={() => { setAtualizando(true); carregar(); }} tintColor={theme.ink} />
        }
      >
        {/* ---- Caixa do turno ---- */}
        {caixa ? (
          <View className="rounded-2xl border-2 border-ink overflow-hidden mb-6">
            <View className="bg-brand px-4 py-3 border-b-2 border-ink">
              <Text className="text-xs font-bold text-ink">NA GAVETA AGORA</Text>
              <Text className="text-3xl font-extrabold text-ink mt-1">
                R$ {caixa.resumo.vlEsperado.toFixed(2)}
              </Text>
            </View>

            <View className="px-4 py-3">
              <LinhaValor rotulo="Abertura" valor={caixa.resumo.vlAbertura} />
              <LinhaValor rotulo="Vendas de mesa" valor={caixa.resumo.vendas} />
              <LinhaValor rotulo="Delivery" valor={caixa.resumo.vendasExternas} />
              <LinhaValor rotulo="Suprimentos" valor={caixa.resumo.suprimentos} />
              <LinhaValor rotulo="Despesas" valor={-caixa.resumo.despesas} />
              <LinhaValor rotulo="Sangrias" valor={-caixa.resumo.sangrias} />
            </View>

            <View className="flex-row flex-wrap gap-2 px-4 pb-4">
              {MANUAIS.map((m) => (
                <TouchableOpacity
                  key={m.tipo}
                  className="px-3 py-2 rounded-full border border-ink bg-white"
                  onPress={() => setLancamento({ tipo: m.tipo, valor: '', descricao: '' })}
                >
                  <Text className="text-[11px] font-bold text-ink">
                    {m.entrada ? '+ ' : '− '}{m.rotulo}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              className="border-t-2 border-ink py-4 items-center bg-white"
              onPress={() => fechar()} disabled={ocupado} activeOpacity={0.85}
            >
              {ocupado ? <ActivityIndicator color={theme.ink} /> : (
                <Text className="text-base font-extrabold text-ink">Fechar caixa</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            className="bg-brand border-2 border-ink rounded-2xl py-6 items-center mb-6"
            onPress={abrir} disabled={ocupado} activeOpacity={0.85}
          >
            {ocupado ? <ActivityIndicator color={theme.ink} /> : (
              <>
                <Ionicons name="lock-open-outline" size={28} color={theme.ink} />
                <Text className="text-base font-extrabold text-ink mt-2">Abrir o caixa</Text>
                <Text className="text-xs text-ink mt-0.5">
                  Vendas de mesa entram sozinhas depois de aberto
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* ---- Vendas do dia ---- */}
        <Text className="text-sm font-extrabold text-ink mb-3">VENDAS DE HOJE</Text>
        <View className="flex-row gap-3 mb-6">
          <Cartao rotulo="Faturamento" valor={`R$ ${(painel?.resumo.faturamento ?? 0).toFixed(2)}`} destaque />
          <Cartao rotulo="Mesas" valor={String(painel?.resumo.comandas ?? 0)} />
          <Cartao rotulo="Ticket médio" valor={`R$ ${(painel?.resumo.ticketMedio ?? 0).toFixed(2)}`} />
        </View>

        {!!painel?.maisVendidos.length && (
          <>
            <Text className="text-sm font-extrabold text-ink mb-2">MAIS VENDIDOS</Text>
            <View className="rounded-2xl border border-ink overflow-hidden mb-6">
              {painel.maisVendidos.slice(0, 5).map((p, i) => (
                <View key={p.nome} className={`flex-row items-center px-4 py-2.5 ${i > 0 ? 'border-t border-ink' : ''}`}>
                  <Text className="text-sm font-bold text-ink w-6">{i + 1}</Text>
                  <Text className="flex-1 text-sm text-ink" numberOfLines={1}>{p.nome}</Text>
                  <Text className="text-sm font-semibold text-ink mr-3">{p.quantidade}×</Text>
                  <Text className="text-sm font-bold text-ink">R$ {p.faturamento.toFixed(2)}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {!!painel?.equipe.length && (
          <>
            <Text className="text-sm font-extrabold text-ink mb-2">VENDAS POR PESSOA</Text>
            <View className="rounded-2xl border border-ink overflow-hidden mb-6">
              {painel.equipe.map((f, i) => (
                <View key={f.idFuncionario} className={`flex-row items-center px-4 py-2.5 ${i > 0 ? 'border-t border-ink' : ''}`}>
                  <Text className="flex-1 text-sm text-ink" numberOfLines={1}>{f.nome}</Text>
                  <Text className="text-xs text-ink-soft mr-3">{f.comandas} mesa(s)</Text>
                  <Text className="text-sm font-bold text-ink">R$ {f.faturamento.toFixed(2)}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {!!caixa?.movimentos.length && (
          <>
            <Text className="text-sm font-extrabold text-ink mb-2">MOVIMENTOS DO TURNO</Text>
            <View className="rounded-2xl border border-ink overflow-hidden">
              {caixa.movimentos.map((m, i) => (
                <View key={m.idMovimento} className={`flex-row items-center px-4 py-2.5 ${i > 0 ? 'border-t border-ink' : ''}`}>
                  <View className="flex-1 pr-2">
                    <Text className="text-sm text-ink">
                      {ROTULO_MOV[m.tipo]}{m.numeroMesa ? ` · Mesa ${m.numeroMesa}` : ''}
                    </Text>
                    {!!m.descricao && (
                      <Text className="text-[11px] text-ink-soft" numberOfLines={1}>{m.descricao}</Text>
                    )}
                  </View>
                  <Text className="text-sm font-bold text-ink">
                    {ENTRADA[m.tipo] ? '+' : '−'} R$ {m.valor.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <Modal visible={!!lancamento} transparent animationType="slide" onRequestClose={() => setLancamento(null)}>
        <KeyboardAvoidingView
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View className="bg-white rounded-t-3xl border-t-2 border-ink p-5 pb-8">
            <Text className="text-lg font-extrabold text-ink mb-4">
              {MANUAIS.find((m) => m.tipo === lancamento?.tipo)?.rotulo}
            </Text>
            <Campo rotulo="Valor (R$)" valor={lancamento?.valor ?? ''} placeholder="50,00" tipoTeclado="decimal-pad"
              aoMudar={(v: string) => lancamento && setLancamento({ ...lancamento, valor: v })} />
            <Campo rotulo="Descrição" valor={lancamento?.descricao ?? ''} placeholder="Opcional"
              aoMudar={(v: string) => lancamento && setLancamento({ ...lancamento, descricao: v })} />
            <View className="flex-row gap-x-3 mt-2">
              <TouchableOpacity
                className="flex-1 border-2 border-ink rounded-2xl h-12 items-center justify-center bg-white"
                onPress={() => setLancamento(null)}
              >
                <Text className="text-base font-bold text-ink">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-brand border-2 border-ink rounded-2xl h-12 items-center justify-center"
                onPress={lancar} disabled={ocupado}
              >
                {ocupado ? <ActivityIndicator color={theme.ink} /> : (
                  <Text className="text-base font-bold text-ink">Lançar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function LinhaValor({ rotulo, valor }: { rotulo: string; valor: number }) {
  if (valor === 0) return null;
  return (
    <View className="flex-row justify-between py-1">
      <Text className="text-sm text-ink-soft">{rotulo}</Text>
      <Text className="text-sm font-semibold text-ink">
        {valor < 0 ? '−' : ''} R$ {Math.abs(valor).toFixed(2)}
      </Text>
    </View>
  );
}

function Cartao({ rotulo, valor, destaque }: { rotulo: string; valor: string; destaque?: boolean }) {
  return (
    <View className={`flex-1 rounded-2xl border-2 border-ink p-3 ${destaque ? 'bg-brand' : 'bg-white'}`}>
      <Text className="text-[10px] font-bold text-ink-soft">{rotulo.toUpperCase()}</Text>
      <Text className="text-base font-extrabold text-ink mt-1" numberOfLines={1} adjustsFontSizeToFit>
        {valor}
      </Text>
    </View>
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

function hora(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

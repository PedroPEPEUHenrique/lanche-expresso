import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { caixaAtual, abrirCaixa, fecharCaixa, lancarMovimento, carregarPainel } from '../../services/gestaoService';
import { Caixa, MovimentoCaixa, PainelRelatorio } from '../../types';
import { theme } from '../../style/theme';
import { Botao, BotaoVazado, Cabecalho, Colchetes, Divisor, Fundo, Halo, Numero, Regua, Rotulo, Selo } from '../cyber';
import { Campo } from '../cyber/Campo';
import { ModalBase } from './CardapioScreen';

type TipoManual = 'venda_externa' | 'despesa' | 'sangria' | 'suprimento';

const MANUAIS: { tipo: TipoManual; rotulo: string; entrada: boolean }[] = [
  { tipo: 'venda_externa', rotulo: 'Delivery', entrada: true },
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
  const [aberturaModal, setAberturaModal] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const [c, p] = await Promise.all([caixaAtual(), carregarPainel()]);
      setCaixa(c); setPainel(p);
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Não foi possível carregar o financeiro');
    } finally {
      setCarregando(false); setAtualizando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  const abrir = async () => {
    setOcupado(true);
    try {
      await abrirCaixa(Number((aberturaModal ?? '0').replace(',', '.')) || 0);
      setAberturaModal(null);
      await carregar();
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Tente novamente.');
    } finally { setOcupado(false); }
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
            try { await fecharCaixa(caixa.idCaixa, esperado, forcar); await carregar(); }
            catch (e: any) {
              const abertas = e?.dados?.comandasAbertas;
              if (abertas && !forcar) {
                Alert.alert(
                  'Mesa ainda aberta',
                  `${abertas} mesa(s) com comanda aberta. Essas vendas entrariam no turno seguinte.`,
                  [{ text: 'Voltar', style: 'cancel' }, { text: 'Fechar assim mesmo', style: 'destructive', onPress: () => fechar(true) }]
                );
              } else Alert.alert('Erro', e.message ?? 'Tente novamente.');
            } finally { setOcupado(false); }
          },
        },
      ]
    );
  };

  const lancar = async () => {
    if (!lancamento) return;
    const valor = Number(lancamento.valor.replace(',', '.'));
    if (!Number.isFinite(valor) || valor <= 0) return Alert.alert('Dados inválidos', 'Informe um valor maior que zero.');
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
      <Fundo><View className="flex-1 items-center justify-center"><ActivityIndicator size="large" color={theme.neon} /></View></Fundo>
    );
  }

  return (
    <Fundo>
      <SafeAreaView className="flex-1" edges={['top']}>
        <Cabecalho
          titulo="Caixa"
          sub={caixa ? `turno aberto desde ${hora(caixa.dtAbertura)}` : 'nenhum turno aberto'}
        />

        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={atualizando} onRefresh={() => { setAtualizando(true); carregar(); }}
              tintColor={theme.neon} colors={[theme.neon]} progressBackgroundColor={theme.surface} />
          }
        >
          {caixa ? (
            <Halo cor="neon" intensidade={1}>
              <View style={{ borderWidth: 1, borderColor: theme.neon, backgroundColor: theme.surface }}>
                <Regua />
                <View className="px-4 py-4" style={{ backgroundColor: theme.neon }}>
                  <Text style={{ fontFamily: theme.mono, fontSize: 10, fontWeight: '700', letterSpacing: 2, color: theme.void }}>
                    NA GAVETA AGORA
                  </Text>
                  <Text style={{ fontFamily: theme.mono, fontSize: 34, fontWeight: '700', color: theme.void, marginTop: 2 }}>
                    R$ {caixa.resumo.vlEsperado.toFixed(2)}
                  </Text>
                </View>

                <View className="px-4 py-3">
                  <Linha rotulo="Abertura" valor={caixa.resumo.vlAbertura} />
                  <Linha rotulo="Vendas de mesa" valor={caixa.resumo.vendas} cor={theme.cyan} />
                  <Linha rotulo="Delivery" valor={caixa.resumo.vendasExternas} cor={theme.cyan} />
                  <Linha rotulo="Suprimentos" valor={caixa.resumo.suprimentos} cor={theme.cyan} />
                  <Linha rotulo="Despesas" valor={-caixa.resumo.despesas} cor={theme.magenta} />
                  <Linha rotulo="Sangrias" valor={-caixa.resumo.sangrias} cor={theme.magenta} />
                </View>

                <View className="flex-row flex-wrap gap-2 px-4 pb-4">
                  {MANUAIS.map((m) => (
                    <TouchableOpacity
                      key={m.tipo}
                      className="px-3 py-2"
                      style={{ borderWidth: 1, borderColor: m.entrada ? theme.cyan : theme.magenta, backgroundColor: theme.raised }}
                      onPress={() => setLancamento({ tipo: m.tipo, valor: '', descricao: '' })}
                    >
                      <Text style={{
                        fontFamily: theme.mono, fontSize: 10, fontWeight: '700', letterSpacing: 1,
                        color: m.entrada ? theme.cyan : theme.magenta, textTransform: 'uppercase',
                      }}>
                        {m.entrada ? '+' : '−'} {m.rotulo}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  className="py-4 items-center"
                  style={{ borderTopWidth: 1, borderTopColor: theme.neon, backgroundColor: theme.raised }}
                  onPress={() => fechar()} disabled={ocupado} activeOpacity={0.8}
                >
                  {ocupado ? <ActivityIndicator color={theme.neon} /> : (
                    <Text style={{ fontFamily: theme.mono, fontSize: 13, fontWeight: '700', letterSpacing: 2, color: theme.neon }}>
                      {'>> '}FECHAR CAIXA
                    </Text>
                  )}
                </TouchableOpacity>

                <Colchetes cor="neon" tamanho={14} espessura={2} />
              </View>
            </Halo>
          ) : (
            <TouchableOpacity onPress={() => setAberturaModal('0')} activeOpacity={0.85}>
              <Halo cor="cyan" intensidade={0.9}>
                <View className="py-7 items-center" style={{ borderWidth: 1, borderColor: theme.cyan, backgroundColor: theme.surface }}>
                  <Ionicons name="lock-open-outline" size={30} color={theme.cyan} />
                  <Text className="mt-3" style={{ fontFamily: theme.mono, fontSize: 14, fontWeight: '700', letterSpacing: 2, color: theme.cyan }}>
                    ABRIR O CAIXA
                  </Text>
                  <Text className="mt-1" style={{ fontFamily: theme.mono, fontSize: 10, color: theme.muted }}>
                    vendas de mesa entram sozinhas depois
                  </Text>
                  <Colchetes cor="cyan" tamanho={14} espessura={2} />
                </View>
              </Halo>
            </TouchableOpacity>
          )}

          <Divisor cor="cyan">vendas de hoje</Divisor>

          <View className="flex-row gap-2">
            <Cartao rotulo="Faturamento" valor={`R$ ${(painel?.resumo.faturamento ?? 0).toFixed(2)}`} destaque />
            <Cartao rotulo="Mesas" valor={String(painel?.resumo.comandas ?? 0)} />
            <Cartao rotulo="Ticket médio" valor={`R$ ${(painel?.resumo.ticketMedio ?? 0).toFixed(2)}`} />
          </View>

          {!!painel?.maisVendidos.length && (
            <>
              <Divisor cor="magenta">mais vendidos</Divisor>
              <View style={{ borderWidth: 1, borderColor: theme.line, backgroundColor: theme.surface }}>
                {painel.maisVendidos.slice(0, 5).map((p, i) => (
                  <View key={p.nome} className="flex-row items-center px-3 py-2.5"
                    style={{ borderTopWidth: i > 0 ? 1 : 0, borderTopColor: theme.line }}>
                    <Text style={{ fontFamily: theme.mono, fontSize: 12, fontWeight: '700', color: theme.magenta, width: 26 }}>
                      {String(i + 1).padStart(2, '0')}
                    </Text>
                    <Text numberOfLines={1} className="flex-1" style={{ fontFamily: theme.mono, fontSize: 12, color: theme.text }}>
                      {p.nome}
                    </Text>
                    <Text style={{ fontFamily: theme.mono, fontSize: 11, color: theme.muted, marginRight: 10 }}>{p.quantidade}×</Text>
                    <Text style={{ fontFamily: theme.mono, fontSize: 12, fontWeight: '700', color: theme.neon }}>
                      {p.faturamento.toFixed(2)}
                    </Text>
                  </View>
                ))}
                <Colchetes cor="muted" tamanho={8} espessura={1} />
              </View>
            </>
          )}

          {!!painel?.equipe.length && (
            <>
              <Divisor cor="cyan">vendas por pessoa</Divisor>
              {/* Inclui mesas abertas: conta rodadas lançadas, não comandas
                  fechadas. Por isso pode superar o faturamento acima — são
                  bases diferentes, e o rótulo avisa. */}
              <View className="mb-2"><Rotulo cor="muted" tamanho={9}>inclui mesas ainda abertas</Rotulo></View>
              <View style={{ borderWidth: 1, borderColor: theme.line, backgroundColor: theme.surface }}>
                {painel.equipe.map((f, i) => (
                  <View key={f.idFuncionario} className="flex-row items-center px-3 py-2.5"
                    style={{ borderTopWidth: i > 0 ? 1 : 0, borderTopColor: theme.line }}>
                    <Text numberOfLines={1} className="flex-1" style={{ fontFamily: theme.mono, fontSize: 12, color: theme.text }}>
                      {f.nome}
                    </Text>
                    <Text style={{ fontFamily: theme.mono, fontSize: 10, color: theme.muted, marginRight: 10 }}>
                      {f.comandas} MESA(S)
                    </Text>
                    <Text style={{ fontFamily: theme.mono, fontSize: 12, fontWeight: '700', color: theme.cyan }}>
                      {f.faturamento.toFixed(2)}
                    </Text>
                  </View>
                ))}
                <Colchetes cor="muted" tamanho={8} espessura={1} />
              </View>
            </>
          )}

          {!!caixa?.movimentos.length && (
            <>
              <Divisor>movimentos do turno</Divisor>
              <View style={{ borderWidth: 1, borderColor: theme.line, backgroundColor: theme.surface }}>
                {caixa.movimentos.map((m, i) => (
                  <View key={m.idMovimento} className="flex-row items-center px-3 py-2.5"
                    style={{ borderTopWidth: i > 0 ? 1 : 0, borderTopColor: theme.line }}>
                    <View className="flex-1 pr-2">
                      <Text style={{ fontFamily: theme.mono, fontSize: 12, color: theme.text }}>
                        {ROTULO_MOV[m.tipo]}{m.numeroMesa ? ` · MESA ${m.numeroMesa}` : ''}
                      </Text>
                      {!!m.descricao && (
                        <Text numberOfLines={1} style={{ fontFamily: theme.mono, fontSize: 10, color: theme.muted }}>
                          {m.descricao}
                        </Text>
                      )}
                    </View>
                    <Text style={{
                      fontFamily: theme.mono, fontSize: 12, fontWeight: '700',
                      color: ENTRADA[m.tipo] ? theme.cyan : theme.magenta,
                    }}>
                      {ENTRADA[m.tipo] ? '+' : '−'} {m.valor.toFixed(2)}
                    </Text>
                  </View>
                ))}
                <Colchetes cor="muted" tamanho={8} espessura={1} />
              </View>
            </>
          )}
        </ScrollView>

        {/* Abertura */}
        <ModalBase visivel={aberturaModal !== null} aoFechar={() => setAberturaModal(null)}>
          <Text style={estilos.titulo}>ABRIR CAIXA</Text>
          <View className="mt-1 mb-4"><Rotulo cor="muted">quanto há de troco na gaveta agora?</Rotulo></View>
          <Campo rotulo="Valor de abertura (R$)" valor={aberturaModal ?? ''} placeholder="0,00"
            tipoTeclado="decimal-pad" aoMudar={(v) => setAberturaModal(v)} />
          <View className="flex-row gap-x-3 mt-5">
            <View className="flex-1"><BotaoVazado cor="muted" onPress={() => setAberturaModal(null)}>Cancelar</BotaoVazado></View>
            <View className="flex-1"><Botao onPress={abrir} carregando={ocupado}>Abrir</Botao></View>
          </View>
        </ModalBase>

        {/* Lançamento */}
        <ModalBase visivel={!!lancamento} aoFechar={() => setLancamento(null)}>
          <Text style={estilos.titulo}>
            {(MANUAIS.find((m) => m.tipo === lancamento?.tipo)?.rotulo ?? '').toUpperCase()}
          </Text>
          <View className="gap-y-3 mt-4">
            <Campo rotulo="Valor (R$)" valor={lancamento?.valor ?? ''} placeholder="50,00" tipoTeclado="decimal-pad"
              aoMudar={(v) => lancamento && setLancamento({ ...lancamento, valor: v })} />
            <Campo rotulo="Descrição" valor={lancamento?.descricao ?? ''} placeholder="opcional"
              aoMudar={(v) => lancamento && setLancamento({ ...lancamento, descricao: v })} />
          </View>
          <View className="flex-row gap-x-3 mt-5">
            <View className="flex-1"><BotaoVazado cor="muted" onPress={() => setLancamento(null)}>Cancelar</BotaoVazado></View>
            <View className="flex-1"><Botao onPress={lancar} carregando={ocupado}>Lançar</Botao></View>
          </View>
        </ModalBase>
      </SafeAreaView>
    </Fundo>
  );
}

function Linha({ rotulo, valor, cor }: { rotulo: string; valor: number; cor?: string }) {
  if (valor === 0) return null;
  return (
    <View className="flex-row justify-between py-1.5">
      <Rotulo cor="muted" tamanho={10}>{rotulo}</Rotulo>
      <Text style={{ fontFamily: theme.mono, fontSize: 13, fontWeight: '700', color: cor ?? theme.text }}>
        {valor < 0 ? '−' : ''} {Math.abs(valor).toFixed(2)}
      </Text>
    </View>
  );
}

function Cartao({ rotulo, valor, destaque }: { rotulo: string; valor: string; destaque?: boolean }) {
  return (
    <View className="flex-1 p-3" style={{
      borderWidth: 1, borderColor: destaque ? theme.neon : theme.line,
      backgroundColor: destaque ? theme.raised : theme.surface,
    }}>
      <Rotulo cor="muted" tamanho={8}>{rotulo}</Rotulo>
      <Text numberOfLines={1} adjustsFontSizeToFit className="mt-1" style={{
        fontFamily: theme.mono, fontSize: 15, fontWeight: '700',
        color: destaque ? theme.neon : theme.text,
      }}>
        {valor}
      </Text>
      <Colchetes cor={destaque ? 'neon' : 'muted'} tamanho={7} espessura={1} />
    </View>
  );
}

const estilos = {
  titulo: { fontFamily: theme.mono, fontSize: 16, fontWeight: '700' as const, letterSpacing: 2, color: theme.text },
};

function hora(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

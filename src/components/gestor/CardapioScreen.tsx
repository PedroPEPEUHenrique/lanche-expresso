import React, { useCallback, useState } from 'react';
import {
  View, Text, SectionList, TouchableOpacity, ActivityIndicator,
  RefreshControl, Alert, Modal, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import {
  listarCardapioCompleto, alternarDisponibilidade, criarProduto, atualizarProduto,
  removerProduto, criarCategoria, removerCategoria,
} from '../../services/cardapioService';
import { SecaoCardapio, Produto } from '../../types';
import { theme } from '../../style/theme';
import { Botao, BotaoVazado, Cabecalho, Colchetes, Fundo, Regua, Rotulo, Selo, Vazio } from '../cyber';
import { Campo } from '../cyber/Campo';

type Rascunho = {
  idProduto?: number; nome: string; descricao: string; valor: string;
  idProdutoCategoria: number; ativo: boolean;
};

/**
 * Cardápio do gestor.
 *
 * Mostra tudo — inclusive o que está em falta e o que saiu do cardápio —
 * porque é aqui que ele traz as coisas de volta. A lista do garçom é outra,
 * filtrada pela API.
 *
 * O toque de disponibilidade é otimista: a linha muda na hora e desfaz se a
 * API recusar. É o gesto mais repetido do dia e esperar a rede a cada toque
 * tornaria a tela irritante.
 */
export default function CardapioScreen() {
  const [secoes, setSecoes] = useState<SecaoCardapio[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [editando, setEditando] = useState<Rascunho | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      setSecoes(await listarCardapioCompleto());
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Não foi possível carregar o cardápio');
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  const alternar = async (produto: Produto) => {
    const novo = !produto.disponivel;
    const aplica = (v: boolean) => setSecoes((atual) =>
      atual.map((s) => ({
        ...s,
        produtos: s.produtos.map((p) => (p.idProduto === produto.idProduto ? { ...p, disponivel: v } : p)),
      }))
    );
    aplica(novo);
    try {
      await alternarDisponibilidade(produto.idProduto, novo);
    } catch (e: any) {
      aplica(!novo);
      Alert.alert('Falha na atualização', e.message ?? 'Tente novamente.');
    }
  };

  const salvar = async () => {
    if (!editando) return;
    const valor = Number(editando.valor.replace(',', '.'));
    if (!editando.nome.trim()) return Alert.alert('Dados incompletos', 'O produto precisa de um nome.');
    if (!Number.isFinite(valor) || valor < 0) return Alert.alert('Dados inválidos', 'Informe um preço válido.');

    setSalvando(true);
    try {
      const dados = {
        nome: editando.nome.trim(), descricao: editando.descricao.trim(),
        valor, idProdutoCategoria: editando.idProdutoCategoria,
      };
      if (editando.idProduto) await atualizarProduto(editando.idProduto, { ...dados, ativo: editando.ativo ? 1 : 0 });
      else await criarProduto(dados);
      setEditando(null);
      await carregar();
    } catch (e: any) {
      Alert.alert('Erro ao salvar', e.message ?? 'Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const excluirProduto = (produto: Produto) => {
    Alert.alert(
      'Remover do cardápio?',
      `"${produto.nome}" sai da lista do garçom. O histórico de vendas é preservado e você pode reativá-lo depois.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover', style: 'destructive',
          onPress: async () => {
            try { await removerProduto(produto.idProduto); await carregar(); }
            catch (e: any) { Alert.alert('Erro', e.message ?? 'Tente novamente.'); }
          },
        },
      ]
    );
  };

  const excluirCategoria = (secao: SecaoCardapio) => {
    Alert.alert('Excluir categoria?', `"${secao.categoria}" será removida.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive',
        onPress: async () => {
          try { await removerCategoria(secao.idProdutoCategoria); await carregar(); }
          // A API recusa categoria com produtos, porque a exclusão cascatearia
          // para o histórico de vendas. A mensagem dela já explica o caminho.
          catch (e: any) { Alert.alert('Não foi possível excluir', e.message ?? 'Tente novamente.'); }
        },
      },
    ]);
  };

  const salvarCategoria = async () => {
    if (!novaCategoria?.trim()) return;
    try {
      await criarCategoria(novaCategoria.trim());
      setNovaCategoria(null);
      await carregar();
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Tente novamente.');
    }
  };

  if (carregando) {
    return (
      <Fundo>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.neon} />
        </View>
      </Fundo>
    );
  }

  const emFalta = secoes.flatMap((s) => s.produtos).filter((p) => p.ativo && !p.disponivel).length;

  return (
    <Fundo>
      <SafeAreaView className="flex-1" edges={['top']}>
        <Cabecalho
          titulo="Cardápio"
          sub={emFalta > 0 ? `${emFalta} item(ns) em falta hoje` : 'tudo disponível'}
          direita={
            <View className="flex-row items-center gap-x-2">
              <IconeTopo icone="people-outline" cor={theme.cyan} onPress={() => router.push('/(gestor)/salao')} />
              <IconeTopo icone="grid-outline" cor={theme.cyan} onPress={() => router.push('/(gestor)/mesas')} />
              <TouchableOpacity
                className="px-3 items-center justify-center"
                style={{ height: 40, backgroundColor: theme.neon }}
                onPress={() => setNovaCategoria('')}
              >
                <Text style={{ fontFamily: theme.mono, fontSize: 10, fontWeight: '700', letterSpacing: 1, color: theme.void }}>
                  + CAT
                </Text>
                <Colchetes cor="neon" tamanho={7} espessura={2} />
              </TouchableOpacity>
            </View>
          }
        />

        <SectionList
          sections={secoes.map((s) => ({ ...s, data: s.produtos }))}
          keyExtractor={(p) => String(p.idProduto)}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={atualizando} onRefresh={() => { setAtualizando(true); carregar(); }}
              tintColor={theme.neon} colors={[theme.neon]} progressBackgroundColor={theme.surface} />
          }
          ListEmptyComponent={
            <Vazio icone="book-outline" titulo="Cardápio vazio"
              texto="Crie uma categoria para começar." />
          }
          renderSectionHeader={({ section }) => {
            const s = section as unknown as SecaoCardapio;
            return (
              <View className="mt-5">
                <Regua cor="cyan" />
                <View
                  className="flex-row items-center justify-between px-4 py-2.5"
                  style={{ backgroundColor: theme.raised, borderBottomWidth: 1, borderBottomColor: theme.line }}
                >
                  <Text style={{ fontFamily: theme.mono, fontSize: 12, fontWeight: '700', letterSpacing: 2, color: theme.cyan }}>
                    {s.categoria.toUpperCase()}
                  </Text>
                  <View className="flex-row items-center gap-x-4">
                    <TouchableOpacity
                      onPress={() => setEditando({
                        nome: '', descricao: '', valor: '',
                        idProdutoCategoria: s.idProdutoCategoria, ativo: true,
                      })}
                      disabled={s.idProdutoCategoria === null}
                    >
                      <Ionicons name="add-circle" size={22} color={theme.neon} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => excluirCategoria(s)} disabled={s.idProdutoCategoria === null}>
                      <Ionicons name="trash-outline" size={18} color={theme.muted} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
          renderItem={({ item }) => (
            <LinhaProduto
              produto={item}
              onAlternar={() => alternar(item)}
              onEditar={() => setEditando({
                idProduto: item.idProduto, nome: item.nome, descricao: item.descricao,
                valor: String(item.valor), idProdutoCategoria: item.idProdutoCategoria, ativo: item.ativo,
              })}
              onExcluir={() => excluirProduto(item)}
            />
          )}
        />

        {/* Produto */}
        <ModalBase visivel={!!editando} aoFechar={() => setEditando(null)}>
          <Text style={estilos.tituloModal}>
            {editando?.idProduto ? 'EDITAR PRODUTO' : 'NOVO PRODUTO'}
          </Text>
          <View className="gap-y-3 mt-4">
            <Campo rotulo="Nome" valor={editando?.nome ?? ''} placeholder="Filé à parmegiana"
              aoMudar={(v) => editando && setEditando({ ...editando, nome: v })} />
            <Campo rotulo="Descrição" valor={editando?.descricao ?? ''} placeholder="Acompanha arroz e fritas"
              aoMudar={(v) => editando && setEditando({ ...editando, descricao: v })} />
            <Campo rotulo="Preço (R$)" valor={editando?.valor ?? ''} placeholder="62,00" tipoTeclado="decimal-pad"
              aoMudar={(v) => editando && setEditando({ ...editando, valor: v })} />
          </View>

          {editando?.idProduto && (
            <TouchableOpacity
              className="flex-row items-center justify-between py-4 mt-2"
              onPress={() => setEditando({ ...editando, ativo: !editando.ativo })}
            >
              <View className="flex-1 pr-3">
                <Rotulo cor={editando.ativo ? 'neon' : 'muted'}>no cardápio</Rotulo>
                <Text style={{ fontFamily: theme.mono, fontSize: 10, color: theme.muted, marginTop: 3 }}>
                  desligar tira da lista do garçom sem apagar o histórico
                </Text>
              </View>
              <View style={{
                width: 52, height: 26, borderWidth: 1,
                borderColor: editando.ativo ? theme.neon : theme.line,
                backgroundColor: editando.ativo ? theme.neon : theme.surface,
                justifyContent: 'center', paddingHorizontal: 2,
              }}>
                <View style={{
                  width: 20, height: 20,
                  backgroundColor: editando.ativo ? theme.void : theme.muted,
                  alignSelf: editando.ativo ? 'flex-end' : 'flex-start',
                }} />
              </View>
            </TouchableOpacity>
          )}

          <View className="flex-row gap-x-3 mt-4">
            <View className="flex-1"><BotaoVazado cor="muted" onPress={() => setEditando(null)}>Cancelar</BotaoVazado></View>
            <View className="flex-1"><Botao onPress={salvar} carregando={salvando}>Salvar</Botao></View>
          </View>
        </ModalBase>

        {/* Categoria */}
        <ModalBase visivel={novaCategoria !== null} aoFechar={() => setNovaCategoria(null)}>
          <Text style={estilos.tituloModal}>NOVA CATEGORIA</Text>
          <View className="mt-4">
            <Campo rotulo="Nome" valor={novaCategoria ?? ''} placeholder="Pratos principais"
              aoMudar={(v) => setNovaCategoria(v)} />
          </View>
          <View className="flex-row gap-x-3 mt-4">
            <View className="flex-1"><BotaoVazado cor="muted" onPress={() => setNovaCategoria(null)}>Cancelar</BotaoVazado></View>
            <View className="flex-1"><Botao onPress={salvarCategoria}>Criar</Botao></View>
          </View>
        </ModalBase>
      </SafeAreaView>
    </Fundo>
  );
}

function LinhaProduto({ produto, onAlternar, onEditar, onExcluir }: {
  produto: Produto; onAlternar: () => void; onEditar: () => void; onExcluir: () => void;
}) {
  const fora = !produto.ativo;
  const emFalta = produto.ativo && !produto.disponivel;

  return (
    <View
      className="flex-row items-center px-4 py-3"
      style={{
        borderBottomWidth: 1, borderBottomColor: theme.line,
        backgroundColor: emFalta ? theme.raised : 'transparent',
      }}
    >
      <TouchableOpacity className="flex-1 pr-3" onPress={onEditar} activeOpacity={0.7}>
        <View className="flex-row items-center gap-x-2">
          <Text
            style={{
              fontFamily: theme.mono, fontSize: 13, fontWeight: '700', letterSpacing: 0.5,
              color: fora ? theme.muted : theme.text,
              textDecorationLine: fora ? 'line-through' : 'none',
            }}
          >
            {produto.nome.toUpperCase()}
          </Text>
          {fora && <Selo cor="muted">fora</Selo>}
        </View>
        <Text style={{ fontFamily: theme.mono, fontSize: 12, color: fora ? theme.muted : theme.neon, marginTop: 3 }}>
          R$ {produto.valor.toFixed(2)}
        </Text>
      </TouchableOpacity>

      {/* O toque principal da tela: acabou / voltou. */}
      {produto.ativo && (
        <TouchableOpacity className="mr-2" onPress={onAlternar} activeOpacity={0.8}>
          <Selo cor={produto.disponivel ? 'cyan' : 'magenta'} solido={!produto.disponivel}>
            {produto.disponivel ? 'tem' : 'acabou'}
          </Selo>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={onExcluir} className="p-1">
        <Ionicons name="ellipsis-vertical" size={16} color={theme.muted} />
      </TouchableOpacity>
    </View>
  );
}

export function ModalBase({ visivel, aoFechar, children }: {
  visivel: boolean; aoFechar: () => void; children: React.ReactNode;
}) {
  return (
    <Modal visible={visivel} transparent animationType="slide" onRequestClose={aoFechar}>
      <KeyboardAvoidingView
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(5,6,10,0.85)' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={{ backgroundColor: theme.surface, borderTopWidth: 1, borderTopColor: theme.neon, maxHeight: '88%' }}>
          <Regua />
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function IconeTopo({ icone, cor, onPress }: {
  icone: React.ComponentProps<typeof Ionicons>['name']; cor: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      className="items-center justify-center"
      style={{ width: 40, height: 40, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.surface }}
      onPress={onPress}
    >
      <Ionicons name={icone} size={17} color={cor} />
    </TouchableOpacity>
  );
}

const estilos = {
  tituloModal: {
    fontFamily: theme.mono, fontSize: 16, fontWeight: '700' as const,
    letterSpacing: 2, color: theme.text,
  },
};

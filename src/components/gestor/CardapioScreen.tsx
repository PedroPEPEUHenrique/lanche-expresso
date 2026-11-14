import React, { useCallback, useState } from 'react';
import {
  View, Text, SectionList, TouchableOpacity, ActivityIndicator,
  RefreshControl, Alert, Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView,
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

type Rascunho = {
  idProduto?: number;
  nome: string;
  descricao: string;
  valor: string;
  idProdutoCategoria: number;
  ativo: boolean;
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
    // Otimista: reflete já, desfaz se a API recusar.
    setSecoes((atual) =>
      atual.map((s) => ({
        ...s,
        produtos: s.produtos.map((p) => (p.idProduto === produto.idProduto ? { ...p, disponivel: novo } : p)),
      }))
    );
    try {
      await alternarDisponibilidade(produto.idProduto, novo);
    } catch (e: any) {
      setSecoes((atual) =>
        atual.map((s) => ({
          ...s,
          produtos: s.produtos.map((p) => (p.idProduto === produto.idProduto ? { ...p, disponivel: !novo } : p)),
        }))
      );
      Alert.alert('Não foi possível atualizar', e.message ?? 'Tente novamente.');
    }
  };

  const salvar = async () => {
    if (!editando) return;
    const valor = Number(editando.valor.replace(',', '.'));
    if (!editando.nome.trim()) return Alert.alert('Atenção', 'O produto precisa de um nome.');
    if (!Number.isFinite(valor) || valor < 0) return Alert.alert('Atenção', 'Informe um preço válido.');

    setSalvando(true);
    try {
      const dados = {
        nome: editando.nome.trim(),
        descricao: editando.descricao.trim(),
        valor,
        idProdutoCategoria: editando.idProdutoCategoria,
      };
      if (editando.idProduto) {
        await atualizarProduto(editando.idProduto, { ...dados, ativo: editando.ativo ? 1 : 0 });
      } else {
        await criarProduto(dados);
      }
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
      'Tirar do cardápio?',
      `"${produto.nome}" sai da lista do garçom. O histórico de vendas é preservado e você pode reativá-lo depois.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Tirar do cardápio', style: 'destructive',
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
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={theme.ink} />
      </SafeAreaView>
    );
  }

  const emFalta = secoes.flatMap((s) => s.produtos).filter((p) => p.ativo && !p.disponivel).length;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="px-5 pt-2 pb-4 border-b border-ink flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-extrabold text-ink">Cardápio</Text>
          {emFalta > 0 && (
            <Text className="text-sm font-semibold text-ink mt-0.5">{emFalta} item(ns) em falta hoje</Text>
          )}
        </View>
        <View className="flex-row items-center gap-x-2">
          <TouchableOpacity
            className="p-2 rounded-full border border-ink"
            onPress={() => router.push('/(gestor)/salao')}
          >
            <Ionicons name="people-outline" size={18} color={theme.ink} />
          </TouchableOpacity>
          <TouchableOpacity
            className="p-2 rounded-full border border-ink"
            onPress={() => router.push('/(gestor)/mesas')}
          >
            <Ionicons name="grid-outline" size={18} color={theme.ink} />
          </TouchableOpacity>
          <TouchableOpacity
            className="px-3 py-2 rounded-full border border-ink bg-brand"
            onPress={() => setNovaCategoria('')}
          >
            <Text className="text-xs font-bold text-ink">+ Categoria</Text>
          </TouchableOpacity>
        </View>
      </View>

      <SectionList
        sections={secoes.map((s) => ({ ...s, data: s.produtos }))}
        keyExtractor={(p) => String(p.idProduto)}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={atualizando} onRefresh={() => { setAtualizando(true); carregar(); }} tintColor={theme.ink} />
        }
        ListEmptyComponent={
          <View className="items-center mt-24 px-10">
            <Ionicons name="book-outline" size={48} color={theme.inkMuted} />
            <Text className="text-ink-soft text-center mt-3">
              Cardápio vazio. Crie uma categoria para começar.
            </Text>
          </View>
        }
        renderSectionHeader={({ section }) => {
          const s = section as unknown as SecaoCardapio;
          return (
            <View className="flex-row items-center justify-between px-5 py-3 bg-brand-light border-y border-ink mt-4">
              <Text className="text-sm font-extrabold text-ink">{s.categoria.toUpperCase()}</Text>
              <View className="flex-row items-center gap-x-3">
                <TouchableOpacity
                  onPress={() => setEditando({
                    nome: '', descricao: '', valor: '',
                    idProdutoCategoria: s.idProdutoCategoria, ativo: true,
                  })}
                  disabled={s.idProdutoCategoria === null}
                >
                  <Ionicons name="add-circle" size={24} color={theme.ink} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => excluirCategoria(s)} disabled={s.idProdutoCategoria === null}>
                  <Ionicons name="trash-outline" size={20} color={theme.inkMuted} />
                </TouchableOpacity>
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

      <ModalProduto
        rascunho={editando}
        salvando={salvando}
        onMudar={setEditando}
        onCancelar={() => setEditando(null)}
        onSalvar={salvar}
      />

      <ModalCategoria
        valor={novaCategoria}
        onMudar={setNovaCategoria}
        onCancelar={() => setNovaCategoria(null)}
        onSalvar={salvarCategoria}
      />
    </SafeAreaView>
  );
}

function LinhaProduto({
  produto, onAlternar, onEditar, onExcluir,
}: { produto: Produto; onAlternar: () => void; onEditar: () => void; onExcluir: () => void }) {
  const foraDoCardapio = !produto.ativo;
  const emFalta = produto.ativo && !produto.disponivel;

  return (
    <View className={`flex-row items-center px-5 py-3 border-b border-ink ${emFalta ? 'bg-brand-light' : 'bg-white'}`}>
      <TouchableOpacity className="flex-1 pr-3" onPress={onEditar} activeOpacity={0.7}>
        <View className="flex-row items-center gap-x-2">
          <Text
            className={`text-base font-semibold ${foraDoCardapio ? 'text-ink-muted' : 'text-ink'}`}
            style={foraDoCardapio ? { textDecorationLine: 'line-through' } : undefined}
          >
            {produto.nome}
          </Text>
          {foraDoCardapio && (
            <View className="px-2 py-0.5 rounded-full border border-ink-muted">
              <Text className="text-[10px] font-bold text-ink-muted">FORA</Text>
            </View>
          )}
        </View>
        <Text className={`text-sm mt-0.5 ${foraDoCardapio ? 'text-ink-muted' : 'text-ink-soft'}`}>
          R$ {produto.valor.toFixed(2)}
        </Text>
      </TouchableOpacity>

      {/* O toque principal da tela: acabou / voltou. */}
      {produto.ativo && (
        <TouchableOpacity
          className={`px-3 py-2 rounded-full border-2 border-ink mr-2 ${produto.disponivel ? 'bg-white' : 'bg-brand'}`}
          onPress={onAlternar}
          activeOpacity={0.8}
        >
          <Text className="text-[11px] font-bold text-ink">
            {produto.disponivel ? 'Tem' : 'ACABOU'}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={onExcluir} className="p-1">
        <Ionicons name="ellipsis-vertical" size={18} color={theme.inkMuted} />
      </TouchableOpacity>
    </View>
  );
}

function ModalProduto({
  rascunho, salvando, onMudar, onCancelar, onSalvar,
}: {
  rascunho: Rascunho | null; salvando: boolean;
  onMudar: (r: Rascunho) => void; onCancelar: () => void; onSalvar: () => void;
}) {
  return (
    <Modal visible={!!rascunho} transparent animationType="slide" onRequestClose={onCancelar}>
      <KeyboardAvoidingView
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="bg-white rounded-t-3xl border-t-2 border-ink p-5 pb-8">
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text className="text-lg font-extrabold text-ink mb-4">
              {rascunho?.idProduto ? 'Editar produto' : 'Novo produto'}
            </Text>

            <Campo
              rotulo="Nome" valor={rascunho?.nome ?? ''}
              aoMudar={(v: string) => rascunho && onMudar({ ...rascunho, nome: v })}
              placeholder="Filé à parmegiana"
            />
            <Campo
              rotulo="Descrição" valor={rascunho?.descricao ?? ''}
              aoMudar={(v: string) => rascunho && onMudar({ ...rascunho, descricao: v })}
              placeholder="Acompanha arroz e fritas"
            />
            <Campo
              rotulo="Preço (R$)" valor={rascunho?.valor ?? ''}
              aoMudar={(v: string) => rascunho && onMudar({ ...rascunho, valor: v })}
              placeholder="62,00" tipoTeclado="decimal-pad"
            />

            {rascunho?.idProduto && (
              <TouchableOpacity
                className="flex-row items-center justify-between py-3 mb-2"
                onPress={() => onMudar({ ...rascunho, ativo: !rascunho.ativo })}
              >
                <View className="flex-1 pr-3">
                  <Text className="text-sm font-semibold text-ink">No cardápio</Text>
                  <Text className="text-[11px] text-ink-soft">
                    Desligar tira da lista do garçom sem apagar o histórico.
                  </Text>
                </View>
                <View className={`w-12 h-7 rounded-full border-2 border-ink justify-center px-0.5 ${rascunho.ativo ? 'bg-brand' : 'bg-white'}`}>
                  <View className={`w-5 h-5 rounded-full bg-ink ${rascunho.ativo ? 'self-end' : 'self-start'}`} />
                </View>
              </TouchableOpacity>
            )}

            <View className="flex-row gap-x-3 mt-2">
              <TouchableOpacity
                className="flex-1 border-2 border-ink rounded-2xl h-12 items-center justify-center bg-white"
                onPress={onCancelar}
              >
                <Text className="text-base font-bold text-ink">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-brand border-2 border-ink rounded-2xl h-12 items-center justify-center"
                onPress={onSalvar}
                disabled={salvando}
              >
                {salvando ? <ActivityIndicator color={theme.ink} /> : (
                  <Text className="text-base font-bold text-ink">Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function ModalCategoria({
  valor, onMudar, onCancelar, onSalvar,
}: { valor: string | null; onMudar: (v: string) => void; onCancelar: () => void; onSalvar: () => void }) {
  return (
    <Modal visible={valor !== null} transparent animationType="slide" onRequestClose={onCancelar}>
      <KeyboardAvoidingView
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="bg-white rounded-t-3xl border-t-2 border-ink p-5 pb-8">
          <Text className="text-lg font-extrabold text-ink mb-4">Nova categoria</Text>
          <Campo
            rotulo="Nome" valor={valor ?? ''} aoMudar={onMudar}
            placeholder="Pratos principais"
          />
          <View className="flex-row gap-x-3 mt-2">
            <TouchableOpacity
              className="flex-1 border-2 border-ink rounded-2xl h-12 items-center justify-center bg-white"
              onPress={onCancelar}
            >
              <Text className="text-base font-bold text-ink">Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-brand border-2 border-ink rounded-2xl h-12 items-center justify-center"
              onPress={onSalvar}
            >
              <Text className="text-base font-bold text-ink">Criar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
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
          value={valor}
          onChangeText={aoMudar}
          onFocus={() => setFocado(true)}
          onBlur={() => setFocado(false)}
          placeholder={placeholder}
          placeholderTextColor={theme.inkMuted}
          keyboardType={tipoTeclado}
        />
      </View>
    </View>
  );
}

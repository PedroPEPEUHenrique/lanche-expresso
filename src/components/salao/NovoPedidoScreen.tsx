import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  ActivityIndicator, Alert, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { listarCardapio } from '../../services/salaoService';
import { useRascunhoStore, useRascunho } from '../../store/rascunhoStore';
import { useAuthStore } from '../../store/authStore';
import { enviarRodada } from '../../services/envioRodadas';
import { Produto, ProdutoCategoria } from '../../types';
import { theme } from '../../style/theme';

/**
 * Monta a rodada e envia para a cozinha.
 *
 * O cardápio é carregado uma vez e filtrado em memória: o garçom troca de
 * categoria a cada toque, e uma ida ao servidor por toque seria lenta
 * justamente no momento em que ele está de pé na frente do cliente.
 */
export default function NovoPedidoScreen({ idComanda }: { idComanda: number }) {
  const [categorias, setCategorias] = useState<ProdutoCategoria[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [emEdicao, setEmEdicao] = useState<Produto | null>(null);
  const [observacao, setObservacao] = useState('');

  const empresa = useAuthStore((s) => s.empresa);
  const { adicionar, alterarQuantidade, limpar } = useRascunhoStore();
  const { itens, total, quantidadeTotal } = useRascunho(idComanda);

  useEffect(() => {
    if (!empresa) return;
    listarCardapio(empresa.idEmpresa)
      .then(({ categorias, produtos }) => {
        setCategorias(categorias);
        setProdutos(produtos);
        setCategoriaAtiva(categorias[0]?.idProdutoCategoria ?? null);
      })
      .catch((e) => Alert.alert('Erro', e.message ?? 'Não foi possível carregar o cardápio'))
      .finally(() => setCarregando(false));
  }, [empresa]);

  const visiveis = useMemo(
    () => produtos.filter((p) => p.ativo && (categoriaAtiva === null || p.idProdutoCategoria === categoriaAtiva)),
    [produtos, categoriaAtiva]
  );

  const confirmarItem = () => {
    if (!emEdicao) return;
    adicionar(
      idComanda,
      { idProduto: emEdicao.idProduto, nome: emEdicao.nome, valor: emEdicao.valor },
      1,
      observacao.trim() || undefined
    );
    setEmEdicao(null);
    setObservacao('');
  };

  /**
   * Envia a rodada. O envio é otimista por desenho: a rodada entra na fila
   * persistida e a tela volta na hora, porque o garçom não pode ficar parado
   * esperando a rede. A comanda mostra "aguardando envio" até a confirmação.
   */
  const enviar = async () => {
    if (!itens.length) return;
    setEnviando(true);
    const resultado = await enviarRodada(idComanda, itens);
    limpar(idComanda);
    setEnviando(false);

    if (!resultado.confirmado) {
      Alert.alert(
        'Sem conexão agora',
        'A rodada ficou salva no aparelho e será enviada assim que a rede voltar. Ela aparece como "aguardando envio" na comanda.'
      );
    }
    router.back();
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
      <View className="px-5 pt-2 pb-3 border-b border-ink flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
          <Ionicons name="arrow-back" size={24} color={theme.ink} />
        </TouchableOpacity>
        <Text className="text-xl font-extrabold text-ink flex-1">Lançar pedido</Text>
      </View>

      <View className="border-b border-ink">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 12, gap: 8 }}>
          {categorias.map((c) => {
            const ativa = c.idProdutoCategoria === categoriaAtiva;
            return (
              <TouchableOpacity
                key={c.idProdutoCategoria}
                className={`px-4 py-2 rounded-full border border-ink ${ativa ? 'bg-brand' : 'bg-white'}`}
                onPress={() => setCategoriaAtiva(c.idProdutoCategoria)}
                activeOpacity={0.8}
              >
                <Text className="text-xs font-bold text-ink">{c.categoria.toUpperCase()}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 20 }}>
        {visiveis.map((p) => (
          <TouchableOpacity
            key={p.idProduto}
            className="flex-row items-center justify-between py-3 border-b border-ink"
            onPress={() => { setEmEdicao(p); setObservacao(''); }}
            activeOpacity={0.7}
          >
            <View className="flex-1 pr-3">
              <Text className="text-base font-semibold text-ink">{p.nome}</Text>
              {!!p.descricao && (
                <Text className="text-xs text-ink-soft mt-0.5" numberOfLines={1}>{p.descricao}</Text>
              )}
            </View>
            <Text className="text-base font-extrabold text-ink mr-3">R$ {p.valor.toFixed(2)}</Text>
            <Ionicons name="add-circle" size={26} color={theme.ink} />
          </TouchableOpacity>
        ))}
        {visiveis.length === 0 && (
          <Text className="text-center text-ink-soft mt-10">Nenhum produto nesta categoria.</Text>
        )}
      </ScrollView>

      {itens.length > 0 && (
        <View className="border-t border-ink bg-white px-5 pt-3 pb-6">
          <ScrollView style={{ maxHeight: 160 }} className="mb-3">
            {itens.map((i) => (
              <View key={`${i.idProduto}-${i.observacao ?? ''}`} className="flex-row items-center py-1.5">
                <View className="flex-1 pr-2">
                  <Text className="text-sm text-ink">{i.nome}</Text>
                  {!!i.observacao && (
                    <Text className="text-[11px] text-ink-soft italic">{i.observacao}</Text>
                  )}
                </View>
                <View className="flex-row items-center gap-x-3">
                  <TouchableOpacity onPress={() => alterarQuantidade(idComanda, i.idProduto, i.quantidade - 1)}>
                    <Ionicons name="remove-circle-outline" size={24} color={theme.ink} />
                  </TouchableOpacity>
                  <Text className="text-base font-bold text-ink w-6 text-center">{i.quantidade}</Text>
                  <TouchableOpacity onPress={() => alterarQuantidade(idComanda, i.idProduto, i.quantidade + 1)}>
                    <Ionicons name="add-circle-outline" size={24} color={theme.ink} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-sm text-ink-soft">{quantidadeTotal} item(ns)</Text>
            <Text className="text-xl font-extrabold text-ink">R$ {total.toFixed(2)}</Text>
          </View>

          <TouchableOpacity
            className="bg-brand border-2 border-ink rounded-2xl h-14 items-center justify-center flex-row gap-x-2"
            onPress={enviar}
            disabled={enviando}
            activeOpacity={0.85}
          >
            {enviando ? (
              <ActivityIndicator color={theme.ink} />
            ) : (
              <>
                <Ionicons name="restaurant-outline" size={20} color={theme.ink} />
                <Text className="text-base font-bold text-ink">Enviar para a cozinha</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={!!emEdicao} transparent animationType="slide" onRequestClose={() => setEmEdicao(null)}>
        <KeyboardAvoidingView
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View className="bg-white rounded-t-3xl border-t-2 border-ink p-5 pb-8">
            <Text className="text-lg font-extrabold text-ink">{emEdicao?.nome}</Text>
            <Text className="text-sm text-ink-soft mb-4">
              R$ {emEdicao?.valor.toFixed(2)}
            </Text>

            <Text className="text-sm font-semibold text-ink-soft mb-1.5">Observação para a cozinha</Text>
            <TextInput
              className="border-[1.5px] border-ink rounded-2xl p-3 text-sm text-ink bg-white mb-4"
              style={{ height: 90 }}
              multiline
              placeholder="Ex: sem cebola, carne ao ponto..."
              placeholderTextColor={theme.inkMuted}
              value={observacao}
              onChangeText={setObservacao}
            />

            <View className="flex-row gap-x-3">
              <TouchableOpacity
                className="flex-1 border-2 border-ink rounded-2xl h-12 items-center justify-center bg-white"
                onPress={() => setEmEdicao(null)}
              >
                <Text className="text-base font-bold text-ink">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-brand border-2 border-ink rounded-2xl h-12 items-center justify-center"
                onPress={confirmarItem}
              >
                <Text className="text-base font-bold text-ink">Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal,
  KeyboardAvoidingView, Platform,
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
import { Botao, BotaoVazado, Colchetes, Divisor, Fundo, Halo, Numero, Regua, Rotulo } from '../cyber';
import { Campo } from '../cyber/Campo';

/**
 * Monta a rodada e envia para a cozinha.
 *
 * O cardápio é carregado uma vez e filtrado em memória: o garçom troca de
 * categoria a cada toque, e uma ida ao servidor por toque seria lenta
 * justamente quando ele está de pé na frente do cliente.
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
        'Sem conexão',
        'A rodada ficou salva no aparelho e será enviada assim que a rede voltar. Aparece como "aguardando envio" na comanda.'
      );
    }
    router.back();
  };

  if (carregando) {
    return (
      <Fundo>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.neon} />
          <View className="mt-4"><Rotulo cor="muted">carregando cardápio</Rotulo></View>
        </View>
      </Fundo>
    );
  }

  return (
    <Fundo>
      <SafeAreaView className="flex-1" edges={['top']}>
        <View style={{ backgroundColor: theme.void, borderBottomWidth: 1, borderBottomColor: theme.line }}>
          <Regua cor="cyan" />
          <View className="px-4 pt-3 pb-3 flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
              <Ionicons name="arrow-back" size={24} color={theme.cyan} />
            </TouchableOpacity>
            <Text className="flex-1" style={{ fontFamily: theme.mono, fontSize: 20, fontWeight: '700', color: theme.text, letterSpacing: 2 }}>
              LANÇAR PEDIDO
            </Text>
          </View>
        </View>

        <View style={{ borderBottomWidth: 1, borderBottomColor: theme.line }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 12, gap: 8 }}>
            {categorias.map((c) => {
              const ativa = c.idProdutoCategoria === categoriaAtiva;
              return (
                <TouchableOpacity
                  key={c.idProdutoCategoria}
                  className="px-3 py-2"
                  style={{
                    borderWidth: 1,
                    borderColor: ativa ? theme.neon : theme.line,
                    backgroundColor: ativa ? theme.neon : theme.surface,
                  }}
                  onPress={() => setCategoriaAtiva(c.idProdutoCategoria)}
                  activeOpacity={0.8}
                >
                  <Text style={{
                    fontFamily: theme.mono, fontSize: 10, fontWeight: '700', letterSpacing: 1.5,
                    color: ativa ? theme.void : theme.muted, textTransform: 'uppercase',
                  }}>
                    {c.categoria}
                  </Text>
                  <Colchetes cor={ativa ? 'neon' : 'muted'} tamanho={6} espessura={1} />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 16 }}>
          {visiveis.map((p) => (
            <TouchableOpacity
              key={p.idProduto}
              className="flex-row items-center px-3 py-3 mb-2"
              style={{ borderWidth: 1, borderColor: theme.line, backgroundColor: theme.surface }}
              onPress={() => { setEmEdicao(p); setObservacao(''); }}
              activeOpacity={0.75}
            >
              <View className="flex-1 pr-3">
                <Text style={{ fontFamily: theme.mono, fontSize: 14, fontWeight: '700', color: theme.text, letterSpacing: 0.5 }}>
                  {p.nome.toUpperCase()}
                </Text>
                {!!p.descricao && (
                  <Text numberOfLines={1} style={{ fontFamily: theme.mono, fontSize: 10, color: theme.muted, marginTop: 2 }}>
                    {p.descricao}
                  </Text>
                )}
              </View>
              <Text style={{ fontFamily: theme.mono, fontSize: 15, fontWeight: '700', color: theme.neon, marginRight: 10 }}>
                {p.valor.toFixed(2)}
              </Text>
              <Ionicons name="add-circle" size={24} color={theme.neon} />
              <Colchetes cor="muted" tamanho={7} espessura={1} />
            </TouchableOpacity>
          ))}
          {visiveis.length === 0 && (
            <View className="items-center mt-10">
              <Rotulo cor="muted">nenhum produto nesta categoria</Rotulo>
            </View>
          )}
        </ScrollView>

        {itens.length > 0 && (
          <View className="px-4 pt-3 pb-5" style={{ backgroundColor: theme.void, borderTopWidth: 1, borderTopColor: theme.neon }}>
            <Divisor cor="neon">rascunho</Divisor>

            <ScrollView style={{ maxHeight: 150 }} className="mb-3">
              {itens.map((i) => (
                <View key={`${i.idProduto}-${i.observacao ?? ''}`} className="flex-row items-center py-1.5">
                  <View className="flex-1 pr-2">
                    <Text style={{ fontFamily: theme.mono, fontSize: 12, color: theme.text }}>{i.nome}</Text>
                    {!!i.observacao && (
                      <Text style={{ fontFamily: theme.mono, fontSize: 10, color: theme.magenta }}>// {i.observacao}</Text>
                    )}
                  </View>
                  <View className="flex-row items-center gap-x-3">
                    <TouchableOpacity onPress={() => alterarQuantidade(idComanda, i.idProduto, i.quantidade - 1)}>
                      <Ionicons name="remove-circle-outline" size={24} color={theme.cyan} />
                    </TouchableOpacity>
                    <Text style={{ fontFamily: theme.mono, fontSize: 15, fontWeight: '700', color: theme.neon, width: 24, textAlign: 'center' }}>
                      {i.quantidade}
                    </Text>
                    <TouchableOpacity onPress={() => alterarQuantidade(idComanda, i.idProduto, i.quantidade + 1)}>
                      <Ionicons name="add-circle-outline" size={24} color={theme.cyan} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View className="flex-row justify-between items-center mb-3">
              <Rotulo cor="muted">{quantidadeTotal} item(ns)</Rotulo>
              <Numero cor="neon" tamanho={22}>R$ {total.toFixed(2)}</Numero>
            </View>

            <Botao icone="restaurant-outline" onPress={enviar} carregando={enviando}>
              Enviar à cozinha
            </Botao>
          </View>
        )}

        <Modal visible={!!emEdicao} transparent animationType="slide" onRequestClose={() => setEmEdicao(null)}>
          <KeyboardAvoidingView
            className="flex-1 justify-end"
            style={{ backgroundColor: 'rgba(5,6,10,0.85)' }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={{ backgroundColor: theme.surface, borderTopWidth: 1, borderTopColor: theme.neon }}>
              <Regua />
              <View className="p-5 pb-8">
                <Text style={{ fontFamily: theme.mono, fontSize: 18, fontWeight: '700', color: theme.text, letterSpacing: 1 }}>
                  {emEdicao?.nome.toUpperCase()}
                </Text>
                <Numero cor="neon" tamanho={20}>R$ {emEdicao?.valor.toFixed(2)}</Numero>

                <View className="mt-5">
                  <Campo
                    rotulo="Observação para a cozinha"
                    valor={observacao}
                    aoMudar={setObservacao}
                    placeholder="sem cebola, ponto da carne..."
                    multilinha
                    altura={88}
                  />
                </View>

                <View className="flex-row gap-x-3 mt-5">
                  <View className="flex-1">
                    <BotaoVazado cor="muted" onPress={() => setEmEdicao(null)}>Cancelar</BotaoVazado>
                  </View>
                  <View className="flex-1">
                    <Botao onPress={confirmarItem}>Adicionar</Botao>
                  </View>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </Fundo>
  );
}

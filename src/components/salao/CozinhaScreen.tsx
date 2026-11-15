import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { listarFilaCozinha, avancarStatus } from '../../services/salaoService';
import { useAuthStore } from '../../store/authStore';
import { Rodada, StatusRodada } from '../../types';
import { theme } from '../../style/theme';
import { Cabecalho, Colchetes, Fundo, Halo, Numero, Rotulo, Selo, Vazio, Regua } from '../cyber';

/** Intervalo do polling. Ver a nota sobre tempo real no fim do arquivo. */
const INTERVALO_MS = 10_000;

const PROXIMO: Partial<Record<StatusRodada, { status: StatusRodada; rotulo: string }>> = {
  enviado: { status: 'em_preparo', rotulo: 'Iniciar preparo' },
  em_preparo: { status: 'pronto', rotulo: 'Marcar pronto' },
};

// Escala de calor: ciano = esperando, neon = em preparo, magenta = pronto.
// Cor aqui não é decoração — é o que diz à cozinha onde olhar primeiro.
const COR: Record<StatusRodada, 'cyan' | 'neon' | 'magenta' | 'muted'> = {
  enviado: 'cyan', em_preparo: 'neon', pronto: 'magenta',
  entregue: 'muted', cancelado: 'muted',
};

const ROTULO: Record<StatusRodada, string> = {
  enviado: 'na fila', em_preparo: 'preparando', pronto: 'pronto',
  entregue: 'entregue', cancelado: 'cancelado',
};

/**
 * Painel da cozinha (KDS).
 *
 * Ordenado pela chegada: o que entrou primeiro sai primeiro. Tipografia
 * grande e alto contraste porque é lido de pé, a dois metros, por alguém com
 * as mãos ocupadas.
 */
export default function CozinhaScreen() {
  const [fila, setFila] = useState<Rodada[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [agindo, setAgindo] = useState<number | null>(null);
  const empresa = useAuthStore((s) => s.empresa);
  const montado = useRef(true);

  const carregar = useCallback(async () => {
    try {
      const nova = await listarFilaCozinha();
      if (montado.current) { setFila(nova); setErro(null); }
    } catch (e: any) {
      if (montado.current) setErro(e.message ?? 'Erro ao carregar a fila');
    } finally {
      if (montado.current) setCarregando(false);
    }
  }, []);

  useEffect(() => {
    montado.current = true;
    carregar();
    const t = setInterval(carregar, INTERVALO_MS);
    return () => { montado.current = false; clearInterval(t); };
  }, [carregar]);

  const avancar = async (rodada: Rodada, status: StatusRodada) => {
    setAgindo(rodada.idPedido);
    try {
      await avancarStatus(rodada.idPedido, status);
      await carregar();
    } catch (e: any) {
      Alert.alert('Falha na atualização', e.message ?? 'Tente novamente.');
    } finally {
      setAgindo(null);
    }
  };

  if (carregando) {
    return (
      <Fundo>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.neon} />
          <View className="mt-4"><Rotulo cor="muted">sincronizando fila</Rotulo></View>
        </View>
      </Fundo>
    );
  }

  const prontos = fila.filter((r) => r.status === 'pronto').length;

  return (
    <Fundo>
      <SafeAreaView className="flex-1" edges={['top']}>
        <Cabecalho
          titulo="Cozinha"
          sub={`${fila.length} na fila · ${prontos} pronto(s) · ${empresa?.nome ?? ''}`}
          direita={
            <View className="flex-row gap-x-2">
              <TouchableOpacity
                onPress={carregar}
                className="items-center justify-center"
                style={{ width: 40, height: 40, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.surface }}
              >
                <Ionicons name="refresh" size={18} color={theme.neon} />
                <Colchetes cor="neon" tamanho={7} espessura={1} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/conta')}
                className="items-center justify-center"
                style={{ width: 40, height: 40, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.surface }}
              >
                <Ionicons name="person-outline" size={18} color={theme.cyan} />
                <Colchetes cor="cyan" tamanho={7} espessura={1} />
              </TouchableOpacity>
            </View>
          }
        />

        {erro && (
          <View className="mx-4 mt-3 px-3 py-2.5" style={{ borderWidth: 1, borderColor: theme.danger, backgroundColor: theme.surface }}>
            <Rotulo cor="danger">{erro}</Rotulo>
          </View>
        )}

        <FlatList
          data={fila}
          keyExtractor={(r) => String(r.idPedido)}
          contentContainerStyle={{ padding: 16, gap: 16 }}
          ListEmptyComponent={
            <Vazio icone="checkmark-done-circle-outline" titulo="Fila vazia"
              texto="Nenhum pedido aguardando preparo." />
          }
          renderItem={({ item, index }) => (
            <CartaoRodada
              rodada={item}
              posicao={index + 1}
              ocupado={agindo === item.idPedido}
              onAvancar={(st) => avancar(item, st)}
            />
          )}
        />
      </SafeAreaView>
    </Fundo>
  );
}

function CartaoRodada({
  rodada, posicao, ocupado, onAvancar,
}: { rodada: Rodada; posicao: number; ocupado: boolean; onAvancar: (s: StatusRodada) => void }) {
  const proximo = PROXIMO[rodada.status];
  const cor = COR[rodada.status];
  const corSolida = cor === 'neon' ? theme.neon : cor === 'magenta' ? theme.magenta : cor === 'cyan' ? theme.cyan : theme.muted;

  const corpo = (
    <View style={{ backgroundColor: theme.surface, borderWidth: 1, borderColor: corSolida }}>
      <Regua cor={cor} />

      <View
        className="flex-row items-center justify-between px-3 py-2.5"
        style={{ backgroundColor: theme.raised, borderBottomWidth: 1, borderBottomColor: corSolida }}
      >
        <View className="flex-row items-baseline gap-x-3">
          <Text style={{ fontFamily: theme.mono, fontSize: 11, color: theme.muted }}>
            #{String(posicao).padStart(2, '0')}
          </Text>
          <Numero cor={cor} tamanho={22}>
            {rodada.numeroMesa ? `MESA ${rodada.numeroMesa}` : 'BALCÃO'}
          </Numero>
        </View>
        <View className="flex-row items-center gap-x-2">
          <Rotulo cor="muted" tamanho={10}>{espera(rodada.dtPedido)}</Rotulo>
          <Selo cor={cor} solido={rodada.status === 'pronto'}>{ROTULO[rodada.status]}</Selo>
        </View>
      </View>

      <View className="px-3 py-3">
        {rodada.itens.map((item) => (
          <View key={item.idItensPedido} className="py-2 flex-row">
            <View
              className="items-center justify-center mr-3"
              style={{ width: 34, height: 34, borderWidth: 1, borderColor: corSolida, backgroundColor: theme.raised }}
            >
              <Text style={{ fontFamily: theme.mono, fontSize: 15, fontWeight: '700', color: corSolida }}>
                {item.quantidade}
              </Text>
            </View>
            <View className="flex-1 justify-center">
              <Text style={{ fontFamily: theme.mono, fontSize: 16, fontWeight: '700', color: theme.text, letterSpacing: 0.5 }}>
                {item.nomeProduto.toUpperCase()}
              </Text>
              {!!item.observacao && (
                <View className="flex-row items-center gap-x-1 mt-1">
                  <Ionicons name="warning" size={12} color={theme.magenta} />
                  <Text style={{ fontFamily: theme.mono, fontSize: 12, fontWeight: '700', color: theme.magenta, flex: 1 }}>
                    {item.observacao.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}

        {!!rodada.nomeGarcom && (
          <View className="mt-2 pt-2" style={{ borderTopWidth: 1, borderTopColor: theme.line }}>
            <Rotulo cor="muted" tamanho={9}>lançado por {rodada.nomeGarcom}</Rotulo>
          </View>
        )}
      </View>

      {proximo && (
        <TouchableOpacity
          className="py-4 items-center"
          style={{ borderTopWidth: 1, borderTopColor: corSolida, backgroundColor: theme.raised }}
          onPress={() => onAvancar(proximo.status)}
          disabled={ocupado}
          activeOpacity={0.8}
        >
          {ocupado ? (
            <ActivityIndicator color={corSolida} />
          ) : (
            <Text style={{ fontFamily: theme.mono, fontSize: 14, fontWeight: '700', letterSpacing: 2, color: corSolida, textTransform: 'uppercase' }}>
              {'>> '}{proximo.rotulo}
            </Text>
          )}
        </TouchableOpacity>
      )}

      <Colchetes cor={cor} tamanho={14} espessura={2} />
    </View>
  );

  // Só o prato pronto pulsa em halo: é o que precisa ser recolhido agora.
  return rodada.status === 'pronto'
    ? <Halo cor="magenta" intensidade={1.2}>{corpo}</Halo>
    : corpo;
}

/** Tempo de espera: o número que diz à cozinha o que está atrasando. */
function espera(iso: string): string {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return 'AGORA';
  if (min < 60) return `${min}MIN`;
  return `${Math.floor(min / 60)}H${String(min % 60).padStart(2, '0')}`;
}

/*
 * Sobre tempo real: o polling de 10s é deliberado para esta fase. Um prato
 * leva 15 minutos; 10 segundos de latência não atrapalham ninguém, e isto são
 * cinco linhas em vez de um canal SSE com reconexão, heartbeat e dependência
 * nova. O SSE entra depois, mantendo este polling como rede de segurança:
 * conexão SSE em celular morre em silêncio quando o app vai para segundo
 * plano, e um painel de cozinha que perde pedido sem avisar é o pior modo de
 * falha possível.
 */

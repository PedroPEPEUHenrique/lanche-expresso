import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { listarFilaCozinha, avancarStatus } from '../../services/salaoService';
import { useAuthStore } from '../../store/authStore';
import { Rodada, StatusRodada } from '../../types';
import { theme } from '../../style/theme';

/** Intervalo do polling. Ver a nota sobre tempo real no fim do arquivo. */
const INTERVALO_MS = 10_000;

const PROXIMO: Partial<Record<StatusRodada, { status: StatusRodada; rotulo: string }>> = {
  enviado: { status: 'em_preparo', rotulo: 'Começar preparo' },
  em_preparo: { status: 'pronto', rotulo: 'Marcar pronto' },
};

/**
 * Painel da cozinha (KDS).
 *
 * Ordenado pela chegada: o que entrou primeiro sai primeiro. Cada cartão é
 * grande e de alto contraste porque é lido de pé, a dois metros, por alguém
 * com as mãos ocupadas.
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
      Alert.alert('Não foi possível atualizar', e.message ?? 'Tente novamente.');
    } finally {
      setAgindo(null);
    }
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
      <View className="px-5 pt-2 pb-4 border-b border-ink flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-extrabold text-ink">Cozinha</Text>
          <Text className="text-sm text-ink-soft mt-0.5">
            {fila.length} pedido(s) na fila · {empresa?.nome}
          </Text>
        </View>
        <TouchableOpacity onPress={carregar} className="p-2 rounded-full border border-ink">
          <Ionicons name="refresh" size={20} color={theme.ink} />
        </TouchableOpacity>
      </View>

      {erro && (
        <View className="mx-5 mt-3 px-4 py-3 rounded-2xl bg-danger-light border border-danger">
          <Text className="text-sm font-semibold text-danger">{erro}</Text>
        </View>
      )}

      <FlatList
        data={fila}
        keyExtractor={(r) => String(r.idPedido)}
        contentContainerStyle={{ padding: 20, gap: 14 }}
        ListEmptyComponent={
          <View className="items-center mt-24">
            <Ionicons name="checkmark-done-circle-outline" size={56} color={theme.inkMuted} />
            <Text className="text-lg font-bold text-ink mt-3">Fila vazia</Text>
            <Text className="text-sm text-ink-soft mt-1">Nenhum pedido aguardando preparo.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <CartaoRodada
            rodada={item}
            ocupado={agindo === item.idPedido}
            onAvancar={(st) => avancar(item, st)}
          />
        )}
      />
    </SafeAreaView>
  );
}

function CartaoRodada({
  rodada, ocupado, onAvancar,
}: { rodada: Rodada; ocupado: boolean; onAvancar: (s: StatusRodada) => void }) {
  const proximo = PROXIMO[rodada.status];
  // Amarelo cheio = em preparo agora; contorno = ainda na fila; a borda mais
  // grossa no que está pronto puxa o olho de quem vai entregar.
  const fundo = rodada.status === 'em_preparo' ? 'bg-brand' : 'bg-white';
  const borda = rodada.status === 'pronto' ? 'border-4' : 'border-2';

  return (
    <View className={`rounded-2xl ${borda} border-ink ${fundo} overflow-hidden`}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-ink">
        <View className="flex-row items-baseline gap-x-2">
          <Text className="text-2xl font-extrabold text-ink">
            {rodada.numeroMesa ? `Mesa ${rodada.numeroMesa}` : 'Balcão'}
          </Text>
          <Text className="text-xs font-semibold text-ink-soft">{espera(rodada.dtPedido)}</Text>
        </View>
        {rodada.status === 'pronto' && (
          <View className="px-3 py-1 rounded-full bg-ink">
            <Text className="text-[11px] font-bold text-white">PRONTO</Text>
          </View>
        )}
      </View>

      <View className="px-4 py-3">
        {rodada.itens.map((item) => (
          <View key={item.idItensPedido} className="py-1.5">
            <Text className="text-lg font-bold text-ink">
              {item.quantidade}× {item.nomeProduto}
            </Text>
            {!!item.observacao && (
              <View className="flex-row items-center gap-x-1 mt-0.5">
                <Ionicons name="alert-circle" size={14} color={theme.ink} />
                <Text className="text-sm font-semibold text-ink italic">{item.observacao}</Text>
              </View>
            )}
          </View>
        ))}
        {!!rodada.nomeGarcom && (
          <Text className="text-[11px] text-ink-soft mt-2">Lançado por {rodada.nomeGarcom}</Text>
        )}
      </View>

      {proximo && (
        <TouchableOpacity
          className="border-t-2 border-ink py-4 items-center bg-white"
          onPress={() => onAvancar(proximo.status)}
          disabled={ocupado}
          activeOpacity={0.85}
        >
          {ocupado ? (
            <ActivityIndicator color={theme.ink} />
          ) : (
            <Text className="text-base font-extrabold text-ink">{proximo.rotulo}</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

/** Tempo de espera: o número que diz à cozinha o que está atrasando. */
function espera(iso: string): string {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)}h${String(min % 60).padStart(2, '0')}`;
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

import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { useFilaEnvioStore } from '../store/filaEnvioStore';
import { theme } from '../style/theme';
import { BotaoVazado, Cabecalho, Colchetes, Divisor, Fundo, Halo, LinhaDado, Rotulo, Selo } from './cyber';

const ROTULO_PAPEL: Record<string, string> = {
  gestor: 'Gestor', garcom: 'Garçom', cozinha: 'Cozinha',
};

/**
 * Conta do funcionário. Serve aos três papéis — até a Fase 1 não havia
 * nenhuma forma de sair do app, o que num tablet compartilhado significava
 * ficar preso à sessão de quem entrou primeiro.
 */
export default function ContaScreen() {
  const { user, papel, empresa, clearAuth } = useAuthStore();
  const pendentes = useFilaEnvioStore((s) => s.pendentes.length);

  const sair = () => {
    // Sair com rodada na fila perde o que o garçom lançou e a cozinha nunca
    // viu. Avisa antes, porque o dado só existe neste aparelho.
    const aviso = pendentes > 0
      ? `Há ${pendentes} rodada(s) ainda não enviadas. Elas serão perdidas.`
      : 'Você precisará entrar novamente.';

    Alert.alert('Encerrar sessão?', aviso, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => { clearAuth(); router.replace('/'); } },
    ]);
  };

  return (
    <Fundo>
      <SafeAreaView className="flex-1" edges={['top']}>
        <Cabecalho
          titulo="Conta"
          sub="sessão ativa"
          direita={
            router.canGoBack() ? (
              <TouchableOpacity
                onPress={() => router.back()}
                className="items-center justify-center"
                style={{ width: 40, height: 40, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.surface }}
              >
                <Ionicons name="close" size={18} color={theme.muted} />
              </TouchableOpacity>
            ) : undefined
          }
        />

        <View className="px-4 pt-8">
          <View className="items-center">
            <Halo cor="neon" intensidade={1.1}>
              <View className="items-center justify-center" style={{ width: 80, height: 80, backgroundColor: theme.neon }}>
                <Ionicons name="person" size={38} color={theme.void} />
                <Colchetes cor="neon" tamanho={14} espessura={3} />
              </View>
            </Halo>

            <Text className="mt-5" style={{ fontFamily: theme.mono, fontSize: 18, fontWeight: '700', color: theme.text, letterSpacing: 1 }}>
              {(user?.nome ?? '').toUpperCase()}
            </Text>
            <Text style={{ fontFamily: theme.mono, fontSize: 11, color: theme.muted, marginTop: 4 }}>
              {user?.email ?? ''}
            </Text>
            <View className="mt-3">
              <Selo cor="neon" solido>{ROTULO_PAPEL[papel ?? ''] ?? papel}</Selo>
            </View>
          </View>

          <Divisor cor="cyan">sessão</Divisor>

          <View className="px-4 py-2" style={{ borderWidth: 1, borderColor: theme.line, backgroundColor: theme.surface }}>
            <LinhaDado rotulo="Unidade" valor={empresa?.nome ?? '—'} cor="cyan" />
            <LinhaDado rotulo="ID operador" valor={String(user?.idUsuario ?? '—').padStart(4, '0')} />
            <LinhaDado
              rotulo="Fila de envio"
              valor={pendentes > 0 ? `${pendentes} pendente(s)` : 'vazia'}
              cor={pendentes > 0 ? 'magenta' : 'text'}
            />
            <Colchetes cor="muted" tamanho={9} espessura={1} />
          </View>

          <View className="mt-8">
            <BotaoVazado cor="danger" icone="log-out-outline" onPress={sair}>
              Encerrar sessão
            </BotaoVazado>
          </View>
        </View>
      </SafeAreaView>
    </Fundo>
  );
}

import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { useFilaEnvioStore } from '../store/filaEnvioStore';
import { theme } from '../style/theme';

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

    Alert.alert('Sair da conta?', aviso, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair', style: 'destructive',
        onPress: () => { clearAuth(); router.replace('/'); },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="px-5 pt-2 pb-4 border-b border-ink">
        <Text className="text-2xl font-extrabold text-ink">Conta</Text>
      </View>

      <View className="items-center mt-8 mb-8">
        <View className="w-20 h-20 rounded-2xl bg-brand border-2 border-ink items-center justify-center mb-3">
          <Ionicons name="person" size={38} color={theme.ink} />
        </View>
        <Text className="text-xl font-bold text-ink">{user?.nome ?? ''}</Text>
        <Text className="text-sm text-ink-soft mt-0.5">{user?.email ?? ''}</Text>
        <View className="mt-3 px-4 py-1.5 rounded-full border-2 border-ink bg-brand">
          <Text className="text-xs font-bold text-ink">
            {ROTULO_PAPEL[papel ?? ''] ?? papel}
          </Text>
        </View>
      </View>

      <View className="mx-5 rounded-2xl border border-ink overflow-hidden">
        <Linha icone="storefront-outline" rotulo="Restaurante" valor={empresa?.nome ?? '—'} />
        {pendentes > 0 && (
          <Linha icone="cloud-offline-outline" rotulo="Aguardando envio" valor={`${pendentes} rodada(s)`} />
        )}
      </View>

      <TouchableOpacity
        className="mx-5 mt-6 border-2 border-danger rounded-2xl h-12 items-center justify-center bg-danger-light flex-row gap-x-2"
        onPress={sair}
        activeOpacity={0.85}
      >
        <Ionicons name="log-out-outline" size={20} color={theme.danger} />
        <Text className="text-base font-bold text-danger">Sair da conta</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function Linha({ icone, rotulo, valor }: { icone: any; rotulo: string; valor: string }) {
  return (
    <View className="flex-row items-center px-4 py-3 border-b border-ink last:border-b-0">
      <Ionicons name={icone} size={20} color={theme.ink} />
      <Text className="flex-1 ml-3 text-sm font-semibold text-ink">{rotulo}</Text>
      <Text className="text-sm text-ink-soft">{valor}</Text>
    </View>
  );
}

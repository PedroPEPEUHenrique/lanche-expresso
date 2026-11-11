import { useEffect, useRef } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AppState, StatusBar } from 'react-native';
import '../style/global.css';
import { useAuthStore, rotaInicial } from '../store/authStore';
import { useFilaEnvioStore } from '../store/filaEnvioStore';
import { reprocessarFila } from '../services/envioRodadas';
import { theme } from '../style/theme';

/** Grupos de rota que cada papel pode abrir. */
const GRUPOS = ['(garcom)', '(cozinha)', '(gestor)', 'comanda'] as const;

const PERMITIDO: Record<string, string[]> = {
  gestor: ['(gestor)', '(garcom)', '(cozinha)', 'comanda'],
  garcom: ['(garcom)', 'comanda'],
  cozinha: ['(cozinha)'],
};

/**
 * Guarda de rota por papel.
 *
 * Duas direções: quem não tem token sai de qualquer área protegida; e quem
 * tem token não entra em área de outro papel — um garçom que digitasse a
 * rota do gestor cairia numa tela cujas chamadas a API recusaria de qualquer
 * forma, mas com erro em vez de redirecionamento.
 */
function GuardaDeRota() {
  const { token, papel, _hasHydrated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Espera a reidratação do AsyncStorage: redirecionar antes disso expulsaria
    // alguém já logado na abertura do app.
    if (!_hasHydrated) return;

    const grupo = segments[0] as string | undefined;
    const emAreaProtegida = GRUPOS.includes(grupo as any);

    if (!token) {
      if (emAreaProtegida) router.replace('/');
      return;
    }

    if (emAreaProtegida && papel && !PERMITIDO[papel]?.includes(grupo!)) {
      router.replace(rotaInicial(papel) as any);
    }
  }, [token, papel, segments, _hasHydrated]);

  return null;
}

/**
 * Reenvia as rodadas que ficaram pendentes.
 *
 * Dispara ao autenticar e sempre que o app volta do segundo plano — o momento
 * típico em que o garçom tira o aparelho do bolso de volta numa área com
 * sinal. O reenvio é seguro porque cada rodada carrega seu idLocal e o
 * servidor devolve a que já existe em vez de duplicar.
 */
function SincronizaFila() {
  const { token, _hasHydrated } = useAuthStore();
  const pendentes = useFilaEnvioStore((s) => s.pendentes.length);
  const rodando = useRef(false);

  const tentar = async () => {
    if (rodando.current || !useAuthStore.getState().token) return;
    if (useFilaEnvioStore.getState().pendentes.length === 0) return;
    rodando.current = true;
    try { await reprocessarFila(); } finally { rodando.current = false; }
  };

  useEffect(() => {
    if (!_hasHydrated || !token) return;
    tentar();
    const sub = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') tentar();
    });
    return () => sub.remove();
  }, [token, _hasHydrated, pendentes]);

  return null;
}

export default function RootLayout() {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={theme.white} />
      <GuardaDeRota />
      <SincronizaFila />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(garcom)" />
        <Stack.Screen name="(cozinha)" />
        <Stack.Screen name="comanda/[id]/index" />
        <Stack.Screen name="comanda/[id]/novo-pedido" />
      </Stack>
    </>
  );
}

import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'react-native';
import '../style/global.css';
import { useAuthStore } from '../store/authStore';
import { useFavoritesStore } from '../store/favoritesStore';

function AuthGuard() {
  const { token, _hasHydrated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Espera a reidratação do AsyncStorage: redirecionar antes disso expulsaria
    // um usuário já logado na abertura do app.
    if (!_hasHydrated) return;

    const inProtected =
      segments[0] === '(tabs)' ||
      segments[0] === 'restaurant' ||
      segments[0] === 'product' ||
      segments[0] === 'cart' ||
      segments[0] === 'user';

    if (!token && inProtected) {
      router.replace('/');
    }
  }, [token, segments, _hasHydrated]);

  return null;
}

/**
 * Os favoritos vivem no servidor, então acompanham a sessão: carrega ao
 * autenticar e limpa o cache ao sair, para não vazar dados entre contas.
 */
function FavoritesSync() {
  const { token, _hasHydrated } = useAuthStore();
  const { carregar, reset } = useFavoritesStore();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (token) carregar();
    else reset();
  }, [token, _hasHydrated]);

  return null;
}

export default function RootLayout() {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <AuthGuard />
      <FavoritesSync />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="register" />
        <Stack.Screen name="address" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="restaurant/[id]" />
        <Stack.Screen name="product/[id]" />
        <Stack.Screen name="cart" />
        <Stack.Screen name="user/edit-profile" />
        <Stack.Screen name="user/edit-address" />
      </Stack>
    </>
  );
}

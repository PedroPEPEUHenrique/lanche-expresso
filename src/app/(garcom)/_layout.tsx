import { Stack } from 'expo-router';

// O garçom tem uma tela só na raiz — o mapa do salão. Comanda e lançamento
// são empilhados a partir dela, na raiz do app, porque a cozinha e o gestor
// também abrem comanda.
export default function GarcomLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

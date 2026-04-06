import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import { CartProvider } from '@/hooks/useCart';
import '../style/global.css';

export default function RootLayout() {
  return (
    <CartProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
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
    </CartProvider>
  );
}

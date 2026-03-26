# 🍔 Rassi Food Express

App de delivery de comida desenvolvido em React Native + Expo + TypeScript + NativeWind.

---

## 📱 Telas implementadas

| Tela | Arquivo |
|------|---------|
| Login | `src/screens/LoginScreen.tsx` |
| Cadastro | `src/screens/RegisterScreen.tsx` |
| Endereço | `src/screens/AddressScreen.tsx` |
| Home | `src/screens/HomeScreen.tsx` |
| Lista de Restaurantes | `src/screens/RestaurantsScreen.tsx` |
| Detalhe do Restaurante | `src/screens/RestaurantDetailScreen.tsx` |
| Detalhe do Produto | `src/screens/ProductDetailScreen.tsx` |
| Carrinho | `src/screens/CartScreen.tsx` |
| Favoritos | `src/screens/FavoritesScreen.tsx` |
| Pedidos | `src/screens/OrdersScreen.tsx` |
| Perfil | `src/screens/ProfileScreen.tsx` |

---

## 🚀 Como rodar

### Pré-requisitos
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- App **Expo Go** no celular (iOS ou Android)

### Instalação

```bash
cd RassiFoodExpress
npm install
npx expo start
```

Escaneie o QR Code com o **Expo Go** no celular.

---

## 🗂️ Estrutura de pastas

```
RassiFoodExpress/
├── App.tsx                        # Entrada do app
├── src/
│   ├── screens/                   # Todas as telas
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── AddressScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── RestaurantsScreen.tsx
│   │   ├── RestaurantDetailScreen.tsx
│   │   ├── ProductDetailScreen.tsx
│   │   ├── CartScreen.tsx
│   │   ├── FavoritesScreen.tsx
│   │   ├── OrdersScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── navigation/
│   │   └── AppNavigator.tsx       # Stack + Tab Navigator
│   ├── hooks/
│   │   └── useCart.tsx            # Context + hook do carrinho
│   └── data/
│       └── mockData.ts            # Dados mock (restaurantes, produtos, categorias)
├── package.json
├── tsconfig.json
└── babel.config.js
```

---

## ✨ Funcionalidades

- **Autenticação**: Login, cadastro e endereço em etapas
- **Home**: Categorias horizontais, busca e lista de destaques
- **Animações**: Efeito de spring nos cards ao pressionar, hero image com parallax no detalhe do restaurante
- **Carrinho**: Context global, adicionar/remover itens, contador no ícone
- **Checkout**: Modal com seleção de método de pagamento (PIX, Crédito, Débito, Dinheiro)
- **Rastreamento simulado**: Widget de acompanhamento com barra de progresso após confirmação
- **Perfil**: Opções de endereço, dados e desconectar
- **Navegação**: Bottom Tab (5 tabs) + Stack para telas de detalhe

---

## 🎨 Design System

| Token | Valor |
|-------|-------|
| Primary | `#7EC8E3` |
| Primary Dark | `#5BB5D5` |
| Danger | `#FF6B6B` |
| Text | `#222222` |
| Subtle | `#888888` |
| Background | `#FFFFFF` |
| Card BG | `#FAFAFA` |
| Input BG | `#F7FBFD` |

---

## 📦 Dependências principais

- `expo` ~51
- `react-navigation` v6 (native-stack + bottom-tabs)
- `react-native-screens`
- `react-native-safe-area-context`
- TypeScript

---

## 🔧 Próximos passos sugeridos

- [ ] Integrar com API real (Node.js / Supabase / Firebase)
- [ ] Adicionar NativeWind para estilos Tailwind
- [ ] Implementar push notifications de pedido
- [ ] Adicionar mapa real com `react-native-maps`
- [ ] Autenticação com AsyncStorage / SecureStore
- [ ] Adicionar splash screen e ícone do app

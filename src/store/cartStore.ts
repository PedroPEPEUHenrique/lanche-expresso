import { create } from 'zustand';
import { CartItem, Product, Restaurant } from '../types';

interface CartState {
  items: CartItem[];
  addItem: (product: Product, restaurant: Restaurant, observations?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (product, restaurant, observations) =>
    set((state) => {
      const existing = state.items.find((i) => i.product.id === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { product, restaurant, quantity: 1, observations }] };
    }),
  removeItem: (productId) =>
    set((state) => ({ items: state.items.filter((i) => i.product.id !== productId) })),
  updateQuantity: (productId, quantity) =>
    set((state) => {
      if (quantity <= 0) return { items: state.items.filter((i) => i.product.id !== productId) };
      return { items: state.items.map((i) => (i.product.id === productId ? { ...i, quantity } : i)) };
    }),
  clearCart: () => set({ items: [] }),
}));

export function useCart() {
  const { items, addItem, removeItem, updateQuantity, clearCart } = useCartStore();
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const deliveryFee = items.length > 0 ? (items[0].restaurant.deliveryFee ?? 5) : 0;
  const total = subtotal + deliveryFee;
  return { items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal, deliveryFee, total };
}

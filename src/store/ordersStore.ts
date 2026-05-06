import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order } from '../types';

interface OrdersState {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'date'>) => void;
}

const useOrdersStore = create<OrdersState>()(
  persist(
    (set) => ({
      orders: [],
      addOrder: (order) =>
        set((state) => ({
          orders: [
            { ...order, id: Date.now().toString(), date: new Date().toISOString() },
            ...state.orders,
          ],
        })),
    }),
    {
      name: 'orders',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export function useOrders() {
  return useOrdersStore();
}

export type { Order };

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Papel } from '../types';

export interface User {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
}

/** O restaurante em que a pessoa está operando neste login. */
export interface Empresa {
  idEmpresa: number;
  nome: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  /** Decide quais grupos de rota abrem. Vem do token, não é escolhido no app. */
  papel: Papel | null;
  empresa: Empresa | null;
  _hasHydrated: boolean;
  setAuth: (dados: { token: string; user: User; papel: Papel; empresa: Empresa }) => void;
  clearAuth: () => void;
  updateUser: (partial: Partial<User>) => void;
  setHasHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      papel: null,
      empresa: null,
      _hasHydrated: false,
      setAuth: ({ token, user, papel, empresa }) => set({ token, user, papel, empresa }),
      clearAuth: () => set({ token: null, user: null, papel: null, empresa: null }),
      updateUser: (partial) =>
        set((state) => ({ user: state.user ? { ...state.user, ...partial } : null })),
      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: 'auth',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

/** Rota inicial de cada papel, usada pelo guard depois do login. */
export function rotaInicial(papel: Papel | null): string {
  if (papel === 'cozinha') return '/(cozinha)';
  if (papel === 'gestor') return '/(gestor)';
  return '/(garcom)';
}

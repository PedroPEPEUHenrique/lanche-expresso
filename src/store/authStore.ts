import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Papel, RespostaLogin, UsuarioContrato, EmpresaResumo } from '../types';

/**
 * Sessão.
 *
 * As formas vêm do contrato da API: guardar aqui uma cópia reescrita delas
 * recriaria a tradução manual que o contrato veio eliminar.
 */
interface AuthState {
  token: string | null;
  user: UsuarioContrato | null;
  /** Decide quais grupos de rota abrem. Vem do token, não é escolhido no app. */
  papel: Papel | null;
  empresa: EmpresaResumo | null;
  _hasHydrated: boolean;
  setAuth: (dados: RespostaLogin) => void;
  clearAuth: () => void;
  updateUser: (partial: Partial<UsuarioContrato>) => void;
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
      setAuth: ({ token, usuario, papel, empresa }) => set({ token, user: usuario, papel, empresa }),
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

export type { UsuarioContrato as User, EmpresaResumo as Empresa };

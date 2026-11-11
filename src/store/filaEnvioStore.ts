import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ItemRascunho } from '../types';

/**
 * Rodadas enviadas que ainda não tiveram confirmação do servidor.
 *
 * WiFi de restaurante cai, e o garçom não pode perder a rodada por causa
 * disso. A rodada entra aqui no momento do envio e só sai quando a API
 * confirma; enquanto estiver aqui, a interface mostra "pendente", nunca
 * "enviado para a cozinha".
 *
 * `idLocal` é o que torna o reenvio seguro. Se a rede cair depois de o
 * servidor gravar mas antes de a resposta chegar, a tentativa seguinte manda
 * o mesmo idLocal, o índice único de PEDIDO.id_local reconhece, e a API
 * devolve a rodada que já existe em vez de o prato ser feito duas vezes.
 * Sem isso, repetir o envio seria pior do que não repetir.
 */
export interface RodadaPendente {
  idLocal: string;
  idComanda: number;
  numeroMesa: string;
  itens: ItemRascunho[];
  tentativas: number;
  ultimoErro?: string;
  criadoEm: string;
}

interface FilaState {
  pendentes: RodadaPendente[];
  enfileirar: (rodada: Omit<RodadaPendente, 'tentativas' | 'criadoEm'>) => void;
  confirmar: (idLocal: string) => void;
  registrarFalha: (idLocal: string, erro: string) => void;
  descartar: (idLocal: string) => void;
}

export const useFilaEnvioStore = create<FilaState>()(
  persist(
    (set) => ({
      pendentes: [],

      enfileirar: (rodada) =>
        set((s) => ({
          pendentes: [...s.pendentes, { ...rodada, tentativas: 0, criadoEm: new Date().toISOString() }],
        })),

      // Chamado quando a API confirma. Só aqui a rodada deixa de ser pendente.
      confirmar: (idLocal) =>
        set((s) => ({ pendentes: s.pendentes.filter((p) => p.idLocal !== idLocal) })),

      registrarFalha: (idLocal, erro) =>
        set((s) => ({
          pendentes: s.pendentes.map((p) =>
            p.idLocal === idLocal ? { ...p, tentativas: p.tentativas + 1, ultimoErro: erro } : p
          ),
        })),

      // Desistência explícita do garçom, para o caso de uma rodada que a API
      // recusa de forma definitiva (comanda fechada, produto fora de linha).
      descartar: (idLocal) =>
        set((s) => ({ pendentes: s.pendentes.filter((p) => p.idLocal !== idLocal) })),
    }),
    {
      name: 'fila-envio-rodadas',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ pendentes: s.pendentes }),
    }
  )
);

export function usePendentesDaComanda(idComanda: number) {
  return useFilaEnvioStore((s) => s.pendentes.filter((p) => p.idComanda === idComanda));
}

/**
 * UUID v4 suficiente para identificar a rodada.
 *
 * `crypto.randomUUID` não existe no runtime do React Native, e trazer uma
 * biblioteca de uuid para gerar um identificador que só precisa não colidir
 * dentro de um restaurante seria peso sem retorno.
 */
export function gerarIdLocal(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

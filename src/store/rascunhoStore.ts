import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ItemRascunho } from '../types';

/**
 * A rodada que o garçom está montando, antes de enviar para a cozinha.
 *
 * Duas diferenças em relação ao carrinho do app de delivery, e as duas vêm da
 * realidade do salão:
 *
 * 1. **Indexado por mesa.** Um garçom atende quatro mesas ao mesmo tempo e
 *    alterna entre elas. Um array único perderia o rascunho a cada troca.
 *
 * 2. **Persistido.** O carrinho antigo era só memória: se o app morresse, o
 *    cliente refazia o pedido. Com meia comanda digitada no meio do salão,
 *    isso é inaceitável, então o rascunho sobrevive a fechar o app e a ficar
 *    sem bateria.
 */
interface RascunhoState {
  /** idComanda -> itens ainda não enviados. */
  porComanda: Record<number, ItemRascunho[]>;
  adicionar: (idComanda: number, item: Omit<ItemRascunho, 'quantidade'>, quantidade?: number, observacao?: string) => void;
  alterarQuantidade: (idComanda: number, idProduto: number, quantidade: number) => void;
  alterarObservacao: (idComanda: number, idProduto: number, observacao: string) => void;
  remover: (idComanda: number, idProduto: number) => void;
  limpar: (idComanda: number) => void;
  _hidratado: boolean;
}

export const useRascunhoStore = create<RascunhoState>()(
  persist(
    (set) => ({
      porComanda: {},
      _hidratado: false,

      adicionar: (idComanda, item, quantidade = 1, observacao) =>
        set((state) => {
          const atuais = state.porComanda[idComanda] ?? [];
          // Mesmo produto com observação diferente é outra linha: "sem cebola"
          // e "ao ponto" não podem virar quantidade 2 do mesmo item, porque a
          // cozinha precisa ver os dois pedidos separados.
          const i = atuais.findIndex(
            (x) => x.idProduto === item.idProduto && (x.observacao ?? '') === (observacao ?? '')
          );
          const novos =
            i >= 0
              ? atuais.map((x, idx) => (idx === i ? { ...x, quantidade: x.quantidade + quantidade } : x))
              : [...atuais, { ...item, quantidade, observacao }];
          return { porComanda: { ...state.porComanda, [idComanda]: novos } };
        }),

      alterarQuantidade: (idComanda, idProduto, quantidade) =>
        set((state) => {
          const atuais = state.porComanda[idComanda] ?? [];
          const novos =
            quantidade <= 0
              ? atuais.filter((x) => x.idProduto !== idProduto)
              : atuais.map((x) => (x.idProduto === idProduto ? { ...x, quantidade } : x));
          return { porComanda: { ...state.porComanda, [idComanda]: novos } };
        }),

      alterarObservacao: (idComanda, idProduto, observacao) =>
        set((state) => {
          const atuais = state.porComanda[idComanda] ?? [];
          return {
            porComanda: {
              ...state.porComanda,
              [idComanda]: atuais.map((x) => (x.idProduto === idProduto ? { ...x, observacao } : x)),
            },
          };
        }),

      remover: (idComanda, idProduto) =>
        set((state) => ({
          porComanda: {
            ...state.porComanda,
            [idComanda]: (state.porComanda[idComanda] ?? []).filter((x) => x.idProduto !== idProduto),
          },
        })),

      limpar: (idComanda) =>
        set((state) => {
          const { [idComanda]: _, ...resto } = state.porComanda;
          return { porComanda: resto };
        }),
    }),
    {
      name: 'rascunho-rodada',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ porComanda: s.porComanda }),
      onRehydrateStorage: () => (state) => {
        if (state) state._hidratado = true;
      },
    }
  )
);

/** Itens e total estimado de uma comanda em montagem. */
export function useRascunho(idComanda: number) {
  const itens = useRascunhoStore((s) => s.porComanda[idComanda] ?? []);
  const total = itens.reduce((soma, i) => soma + i.valor * i.quantidade, 0);
  const quantidadeTotal = itens.reduce((soma, i) => soma + i.quantidade, 0);
  return { itens, total, quantidadeTotal };
}

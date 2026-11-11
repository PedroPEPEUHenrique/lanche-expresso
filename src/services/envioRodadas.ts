import { lancarRodada } from './salaoService';
import { ApiError } from './apiClient';
import { useFilaEnvioStore, gerarIdLocal } from '../store/filaEnvioStore';
import { ItemRascunho } from '../types';

/**
 * Envio de rodadas com fila persistida.
 *
 * O desenho é otimista: a rodada entra na fila ANTES de tentar a rede, e a
 * tela volta imediatamente. O garçom não fica parado olhando um spinner no
 * meio do salão, e se a rede estiver fora a rodada não se perde.
 *
 * A fila só libera a rodada quando a API confirma. Até lá a comanda mostra
 * "aguardando envio" — nunca "enviado para a cozinha", porque a cozinha
 * realmente ainda não viu.
 */

/** Erros definitivos: repetir não vai mudar o resultado. */
function ehDefinitivo(erro: unknown): boolean {
  if (!(erro instanceof ApiError)) return false;
  // 0 = falha de rede, 401 = sessão expirada (o apiClient já desloga),
  // 5xx = problema do servidor. Esses merecem nova tentativa.
  if (erro.status === 0 || erro.status === 401 || erro.status >= 500) return false;
  // 404 produto, 409 comanda fechada, 422 corpo inválido: reenviar repete o
  // mesmo erro para sempre e entope a fila.
  return true;
}

export interface ResultadoEnvio {
  confirmado: boolean;
  idLocal: string;
  erro?: string;
}

export async function enviarRodada(
  idComanda: number,
  itens: ItemRascunho[],
  numeroMesa = ''
): Promise<ResultadoEnvio> {
  const idLocal = gerarIdLocal();
  const { enfileirar, confirmar, registrarFalha, descartar } = useFilaEnvioStore.getState();

  enfileirar({ idLocal, idComanda, numeroMesa, itens });

  try {
    await lancarRodada(idComanda, itens, idLocal);
    confirmar(idLocal);
    return { confirmado: true, idLocal };
  } catch (erro: any) {
    if (ehDefinitivo(erro)) {
      descartar(idLocal);
      return { confirmado: false, idLocal, erro: erro.message };
    }
    registrarFalha(idLocal, erro.message ?? 'Falha de rede');
    return { confirmado: false, idLocal, erro: erro.message };
  }
}

/**
 * Reenvia tudo que está pendente.
 *
 * Seguro de chamar quantas vezes quiser: cada rodada carrega seu idLocal, e o
 * índice único de PEDIDO.id_local garante que uma rodada que já chegou seja
 * devolvida em vez de duplicada. Sem essa garantia no servidor, este retry
 * seria perigoso — mandaria o prato duas vezes.
 */
export async function reprocessarFila(): Promise<{ confirmadas: number; restantes: number }> {
  const { pendentes, confirmar, registrarFalha, descartar } = useFilaEnvioStore.getState();
  let confirmadas = 0;

  for (const rodada of pendentes) {
    try {
      await lancarRodada(rodada.idComanda, rodada.itens, rodada.idLocal);
      confirmar(rodada.idLocal);
      confirmadas++;
    } catch (erro: any) {
      if (ehDefinitivo(erro)) {
        descartar(rodada.idLocal);
      } else {
        registrarFalha(rodada.idLocal, erro.message ?? 'Falha de rede');
        // Rede fora: parar aqui evita marcar falha em todas as rodadas da
        // fila por um problema que é o mesmo para todas.
        if (erro instanceof ApiError && erro.status === 0) break;
      }
    }
  }

  return { confirmadas, restantes: useFilaEnvioStore.getState().pendentes.length };
}

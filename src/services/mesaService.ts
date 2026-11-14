import { apiFetch } from './apiClient';

interface DadosMesa {
  numero: string;
  setor?: string;
  capacidade?: number;
}

export async function criarMesa(dados: DadosMesa): Promise<void> {
  await apiFetch<void>('/mesas', {
    method: 'POST', body: dados, mensagemErro: 'Erro ao criar a mesa',
  });
}

export async function atualizarMesa(idMesa: number, dados: Partial<DadosMesa>): Promise<void> {
  await apiFetch<void>(`/mesas/${idMesa}`, {
    method: 'PUT', body: dados, mensagemErro: 'Erro ao salvar a mesa',
  });
}

export async function removerMesa(idMesa: number): Promise<void> {
  await apiFetch<void>(`/mesas/${idMesa}`, {
    method: 'DELETE', mensagemErro: 'Erro ao remover a mesa',
  });
}

import { apiFetch } from './apiClient';
import {
  Funcionario, Papel, Caixa, MovimentoCaixa, PainelRelatorio,
  Insumo, FichaTecnica,
} from '../types';

/**
 * Chamadas do gestor.
 *
 * Sem conversão de nomes: a API responde no contrato. Este arquivo tinha 11
 * linhas de tradução manual antes de o contrato existir.
 */

// ---------------------------------------------------------------------------
// Equipe
// ---------------------------------------------------------------------------

export async function listarEquipe(): Promise<Funcionario[]> {
  return await apiFetch<Funcionario[]>('/funcionarios', { mensagemErro: 'Erro ao carregar a equipe' });
}

export async function criarFuncionario(dados: {
  nome: string; email: string; senha: string; telefone?: string; papel: Papel;
}): Promise<void> {
  await apiFetch<void>('/funcionarios', {
    method: 'POST', body: dados, mensagemErro: 'Erro ao criar o funcionário',
  });
}

export async function alterarPapel(idFuncionario: number, papel: Papel): Promise<void> {
  await apiFetch<void>(`/funcionarios/${idFuncionario}/papel`, {
    method: 'PATCH', body: { papel }, mensagemErro: 'Erro ao alterar o papel',
  });
}

export async function alterarAtivo(idFuncionario: number, ativo: boolean): Promise<void> {
  await apiFetch<void>(`/funcionarios/${idFuncionario}/ativo`, {
    method: 'PATCH', body: { ativo }, mensagemErro: 'Erro ao alterar o acesso',
  });
}

// ---------------------------------------------------------------------------
// Caixa
// ---------------------------------------------------------------------------

/** Devolve null quando não há turno aberto — a tela mostra "abrir caixa". */
export async function caixaAtual(): Promise<Caixa | null> {
  return await apiFetch<Caixa | null>('/caixa', { mensagemErro: 'Erro ao carregar o caixa' });
}

export async function abrirCaixa(vlAbertura: number, observacao?: string): Promise<Caixa> {
  return await apiFetch<Caixa>('/caixa', {
    method: 'POST', body: { vlAbertura, observacao }, mensagemErro: 'Erro ao abrir o caixa',
  });
}

export async function fecharCaixa(idCaixa: number, vlInformado: number, forcar = false): Promise<Caixa> {
  return await apiFetch<Caixa>(`/caixa/${idCaixa}/fechar`, {
    method: 'PATCH', body: { vlInformado, forcar }, mensagemErro: 'Erro ao fechar o caixa',
  });
}

export async function lancarMovimento(
  tipo: MovimentoCaixa['tipo'], valor: number, descricao?: string
): Promise<Caixa> {
  return await apiFetch<Caixa>('/caixa/movimentos', {
    method: 'POST', body: { tipo, valor, descricao }, mensagemErro: 'Erro ao lançar o movimento',
  });
}

// ---------------------------------------------------------------------------
// Relatórios
// ---------------------------------------------------------------------------

export async function carregarPainel(de?: string, ate?: string): Promise<PainelRelatorio> {
  const q = new URLSearchParams();
  if (de) q.set('de', de);
  if (ate) q.set('ate', ate);
  const sufixo = q.toString() ? `?${q}` : '';
  return await apiFetch<PainelRelatorio>(`/relatorios/painel${sufixo}`, {
    mensagemErro: 'Erro ao carregar os relatórios',
  });
}

// ---------------------------------------------------------------------------
// Estoque
// ---------------------------------------------------------------------------

export async function listarInsumos(): Promise<Insumo[]> {
  return await apiFetch<Insumo[]>('/insumos', { mensagemErro: 'Erro ao carregar o estoque' });
}

export async function criarInsumo(dados: {
  nome: string; unidade: Insumo['unidade']; qtdMinima?: number;
}): Promise<void> {
  await apiFetch<void>('/insumos', { method: 'POST', body: dados, mensagemErro: 'Erro ao criar o insumo' });
}

export async function movimentarInsumo(idInsumo: number, dados: {
  tipo: 'entrada' | 'perda' | 'ajuste'; quantidade: number; vlUnitario?: number; motivo?: string;
}): Promise<void> {
  await apiFetch<void>(`/insumos/${idInsumo}/movimentos`, {
    method: 'POST', body: dados, mensagemErro: 'Erro ao movimentar o estoque',
  });
}

export async function obterFicha(idProduto: number): Promise<FichaTecnica> {
  return await apiFetch<FichaTecnica>(`/produtos/${idProduto}/ficha`, {
    mensagemErro: 'Erro ao carregar a ficha técnica',
  });
}

export async function salvarFicha(
  idProduto: number, itens: { idInsumo: number; quantidade: number }[]
): Promise<FichaTecnica> {
  return await apiFetch<FichaTecnica>(`/produtos/${idProduto}/ficha`, {
    method: 'PUT', body: { itens }, mensagemErro: 'Erro ao salvar a ficha técnica',
  });
}

export async function removerDaFicha(idProduto: number, idInsumo: number): Promise<void> {
  await apiFetch<void>(`/produtos/${idProduto}/ficha/${idInsumo}`, {
    method: 'DELETE', mensagemErro: 'Erro ao remover o insumo da ficha',
  });
}

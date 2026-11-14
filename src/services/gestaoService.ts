import { apiFetch } from './apiClient';
import { Funcionario, Papel, Caixa, MovimentoCaixa, PainelRelatorio, Insumo, FichaTecnica } from '../types';

// ---------------------------------------------------------------------------
// Equipe
// ---------------------------------------------------------------------------

export async function listarEquipe(): Promise<Funcionario[]> {
  const data = await apiFetch<any[]>('/funcionarios', { mensagemErro: 'Erro ao carregar a equipe' });
  return data.map(mapFuncionario);
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
  const data = await apiFetch<any>('/caixa', { mensagemErro: 'Erro ao carregar o caixa' });
  return data ? mapCaixa(data) : null;
}

export async function abrirCaixa(vlAbertura: number, observacao?: string): Promise<Caixa> {
  return mapCaixa(await apiFetch<any>('/caixa', {
    method: 'POST', body: { vlAbertura, observacao }, mensagemErro: 'Erro ao abrir o caixa',
  }));
}

export async function fecharCaixa(idCaixa: number, vlInformado: number, forcar = false): Promise<Caixa> {
  return mapCaixa(await apiFetch<any>(`/caixa/${idCaixa}/fechar`, {
    method: 'PATCH', body: { vlInformado, forcar }, mensagemErro: 'Erro ao fechar o caixa',
  }));
}

export async function lancarMovimento(
  tipo: MovimentoCaixa['tipo'], valor: number, descricao?: string
): Promise<Caixa> {
  return mapCaixa(await apiFetch<any>('/caixa/movimentos', {
    method: 'POST', body: { tipo, valor, descricao }, mensagemErro: 'Erro ao lançar o movimento',
  }));
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

// ---------------------------------------------------------------------------

function mapFuncionario(f: any): Funcionario {
  return {
    idFuncionario: f.id_funcionario,
    idUsuario: f.id_usuario,
    nome: f.nome,
    email: f.email,
    telefone: f.telefone ?? undefined,
    papel: f.papel,
    ativo: !!f.ativo,
    dtAdmissao: f.dt_admissao,
  };
}

function mapCaixa(c: any): Caixa {
  return {
    idCaixa: c.id_caixa,
    status: c.status,
    dtAbertura: c.dt_abertura,
    dtFechamento: c.dt_fechamento ?? null,
    nomeAbertura: c.nome_abertura ?? undefined,
    resumo: c.resumo,
    movimentos: (c.movimentos ?? []).map((m: any) => ({
      idMovimento: m.id_movimento,
      tipo: m.tipo,
      descricao: m.descricao ?? '',
      valor: Number(m.valor),
      numeroMesa: m.numero_mesa ?? undefined,
      nomeFuncionario: m.nome_funcionario ?? undefined,
      dtMovimento: m.dt_movimento,
    })),
  };
}

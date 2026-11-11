import { apiFetch, ApiError } from './apiClient';
import { User, Empresa } from '../store/authStore';
import { Papel } from '../types';

interface UsuarioApi {
  id_usuario: number;
  nome: string;
  email: string;
  telefone?: string | null;
}

export interface ResultadoLogin {
  token: string;
  user: User;
  papel: Papel;
  empresa: Empresa;
}

/** Opção devolvida quando a pessoa trabalha em mais de um restaurante. */
export interface EscolhaEmpresa {
  idEmpresa: number;
  nome: string;
  papel: Papel;
}

export class PrecisaEscolherEmpresa extends Error {
  constructor(public empresas: EscolhaEmpresa[]) {
    super('Escolha o restaurante');
    this.name = 'PrecisaEscolherEmpresa';
  }
}

/**
 * Autentica. Senha correta não basta: sem vínculo ativo com um restaurante a
 * API não emite token, porque toda rota depende de saber onde a pessoa está
 * operando e com qual papel.
 *
 * Quem tem vínculo com mais de um restaurante recebe 409 com a lista; o app
 * pergunta e repete o login com o idEmpresa escolhido.
 */
export async function login(email: string, senha: string, idEmpresa?: number): Promise<ResultadoLogin> {
  try {
    const data = await apiFetch<{
      token: string;
      usuario: UsuarioApi;
      papel: Papel;
      empresa: { idEmpresa: number; nome: string };
    }>('/usuarios/login', {
      method: 'POST',
      body: { email, senha, idEmpresa },
      autenticado: false,
      mensagemErro: 'E-mail ou senha inválidos',
    });

    return {
      token: data.token,
      user: mapUser(data.usuario),
      papel: data.papel,
      empresa: data.empresa,
    };
  } catch (erro) {
    if (erro instanceof ApiError && erro.status === 409 && erro.dados?.empresas) {
      throw new PrecisaEscolherEmpresa(erro.dados.empresas as EscolhaEmpresa[]);
    }
    throw erro;
  }
}

export async function alterarSenha(senhaAtual: string, novaSenha: string): Promise<void> {
  await apiFetch<void>('/usuarios/senha', {
    method: 'PATCH',
    body: { senhaAtual, novaSenha },
    mensagemErro: 'Erro ao alterar senha',
  });
}

export function mapUser(u: UsuarioApi): User {
  return {
    id: u.id_usuario,
    nome: u.nome,
    email: u.email,
    telefone: u.telefone ?? undefined,
  };
}

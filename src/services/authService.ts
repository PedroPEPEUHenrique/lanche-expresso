import { apiFetch, ApiError } from './apiClient';
import { Papel, RespostaLogin, EscolhaDeEmpresa } from '../types';

/**
 * Autenticação.
 *
 * `RespostaLogin` vem do contrato — não há mais conversão de `id_usuario`
 * para `id` aqui. O que o servidor manda é exatamente o que o tipo diz.
 */

export class PrecisaEscolherEmpresa extends Error {
  constructor(public empresas: EscolhaDeEmpresa[]) {
    super('Escolha o restaurante');
    this.name = 'PrecisaEscolherEmpresa';
  }
}

/**
 * Senha correta não basta: sem vínculo ativo com um restaurante a API não
 * emite token, porque toda rota depende de saber onde a pessoa está operando
 * e com qual papel.
 *
 * Quem tem vínculo com mais de um restaurante recebe 409 com a lista; o app
 * pergunta e repete o login com o idEmpresa escolhido.
 */
export async function login(email: string, senha: string, idEmpresa?: number): Promise<RespostaLogin> {
  try {
    return await apiFetch<RespostaLogin>('/usuarios/login', {
      method: 'POST',
      body: { email, senha, idEmpresa },
      autenticado: false,
      mensagemErro: 'E-mail ou senha inválidos',
    });
  } catch (erro) {
    if (erro instanceof ApiError && erro.status === 409 && erro.dados?.empresas) {
      throw new PrecisaEscolherEmpresa(erro.dados.empresas as EscolhaDeEmpresa[]);
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

export type { Papel, EscolhaDeEmpresa };

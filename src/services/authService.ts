import { apiFetch } from './apiClient';
import { User } from '../store/authStore';

interface UsuarioApi {
  id_usuario: number;
  nome: string;
  email: string;
  telefone?: string | null;
  cep?: string | null;
  endereco?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
}

export async function login(email: string, senha: string): Promise<{ token: string; user: User }> {
  const data = await apiFetch<{ token: string; usuario: UsuarioApi }>('/usuarios/login', {
    method: 'POST',
    body: { email, senha },
    autenticado: false,
    mensagemErro: 'E-mail ou senha inválidos',
  });
  return { token: data.token, user: mapUser(data.usuario) };
}

export async function register(data: {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
}): Promise<void> {
  await apiFetch<void>('/usuarios', {
    method: 'POST',
    body: data,
    autenticado: false,
    mensagemErro: 'Erro ao cadastrar',
  });
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
    cep: u.cep ?? undefined,
    endereco: u.endereco ?? undefined,
    numero: u.numero ?? undefined,
    complemento: u.complemento ?? undefined,
    bairro: u.bairro ?? undefined,
    cidade: u.cidade ?? undefined,
    estado: u.estado ?? undefined,
  };
}

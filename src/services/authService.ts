import { User } from '../store/authStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function login(email: string, senha: string): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_URL}/usuarios/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).mensagem || 'E-mail ou senha inválidos');
  }
  const data = await res.json();
  return { token: data.token, user: mapUser(data.usuario) };
}

export async function register(data: {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
}): Promise<void> {
  const res = await fetch(`${API_URL}/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).mensagem || 'Erro ao cadastrar');
  }
}

function mapUser(u: any): User {
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

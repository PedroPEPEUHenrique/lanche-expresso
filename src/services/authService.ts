import { api } from './api';
import { AuthUser } from '../store/authStore';

interface RegisterBody {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
}

function mapUsuario(raw: any): AuthUser {
  return {
    id: String(raw.id_usuario ?? raw.id),
    nome: raw.nome,
    email: raw.email,
    telefone: raw.telefone,
    cep: raw.cep,
    endereco: raw.endereco,
    numero: raw.numero,
    complemento: raw.complemento,
    bairro: raw.bairro,
    cidade: raw.cidade,
    estado: raw.estado,
  };
}

export async function login(email: string, senha: string): Promise<{ token: string; user: AuthUser }> {
  const res = await api.post<{ token: string; usuario: any }>('/usuarios/login', { email, senha });
  return { token: res.token, user: mapUsuario(res.usuario) };
}

export async function register(body: RegisterBody): Promise<void> {
  await api.post('/usuarios', body);
}

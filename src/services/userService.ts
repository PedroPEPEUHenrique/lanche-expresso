import { User } from '../store/authStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function atualizarUsuario(
  userId: number,
  data: Partial<Omit<User, 'id' | 'email'>>
): Promise<User> {
  const res = await fetch(`${API_URL}/usuarios/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).mensagem || 'Erro ao atualizar usuário');
  }
  const u = await res.json();
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

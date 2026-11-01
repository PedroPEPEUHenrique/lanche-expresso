import { apiFetch } from './apiClient';
import { mapUser } from './authService';
import { User } from '../store/authStore';

export async function atualizarUsuario(
  userId: number,
  data: Partial<Omit<User, 'id' | 'email'>>
): Promise<User> {
  const usuario = await apiFetch<Parameters<typeof mapUser>[0]>(`/usuarios/${userId}`, {
    method: 'PUT',
    body: data,
    mensagemErro: 'Erro ao atualizar usuário',
  });
  return mapUser(usuario);
}

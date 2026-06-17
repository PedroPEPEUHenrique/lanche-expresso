import { api } from './api';
import { AuthUser } from '../store/authStore';

export async function atualizarUsuario(
  idUsuario: string,
  body: Partial<Omit<AuthUser, 'id' | 'email'>>
): Promise<Partial<AuthUser>> {
  const data = await api.put<any>(`/usuarios/${idUsuario}`, body);
  return {
    nome: data.nome,
    telefone: data.telefone,
    cep: data.cep,
    endereco: data.endereco,
    numero: data.numero,
    complemento: data.complemento,
    bairro: data.bairro,
    cidade: data.cidade,
    estado: data.estado,
  };
}

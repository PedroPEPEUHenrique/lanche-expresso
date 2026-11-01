import { useAuthStore } from '../store/authStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

type Metodo = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: Metodo;
  body?: unknown;
  /** false para rotas públicas (catálogo) e para login/cadastro. */
  autenticado?: boolean;
  /** Mensagem exibida quando a API não devolve uma. */
  mensagemErro?: string;
}

/**
 * Ponto único de saída HTTP do app. Centraliza base URL, injeção do token
 * Bearer, desserialização e normalização de erro — assim nenhuma tela precisa
 * saber como a autenticação é transportada.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, autenticado = true, mensagemErro = 'Erro na requisição' } = options;

  if (!API_URL) {
    throw new ApiError(0, 'EXPO_PUBLIC_API_URL não configurada. Defina a variável no .env do app.');
  }

  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  if (autenticado) {
    const { token } = useAuthStore.getState();
    if (!token) throw new ApiError(401, 'Sessão expirada. Faça login novamente.');
    headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'Não foi possível conectar ao servidor. Verifique sua conexão.');
  }

  if (!res.ok) {
    // Token recusado pelo servidor: encerra a sessão para o guard de rotas
    // devolver o usuário ao login em vez de deixá-lo numa tela quebrada.
    if (res.status === 401 && autenticado) {
      useAuthStore.getState().clearAuth();
    }
    const erro = await res.json().catch(() => ({}));
    throw new ApiError(res.status, (erro as { mensagem?: string }).mensagem || mensagemErro);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

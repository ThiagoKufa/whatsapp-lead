import { api } from './api';
import { 
  AuthResponse, 
  LoginCredentials, 
  RegisterCredentials,
  User
} from '../types/auth';

export const authService = {
  async login({ email, password }: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', {
      email,
      password
    });
    return response.data;
  },

  async register({ name, email, password }: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', {
      name,
      email,
      password
    });
    return response.data;
  },

  async refreshToken(token: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/refresh', {
      refresh_token: token
    });
    return response.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await api.post('/auth/logout', { refresh_token: refreshToken });
  },

  async getMe(): Promise<User> {
    try {
      const response = await api.get<User>('/me');
      
      if (!response.data) {
        throw new Error('Resposta vazia do servidor');
      }
      
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar informações do usuário:', error);
      throw error;
    }
  }
}; 
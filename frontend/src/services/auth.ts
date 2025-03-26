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
    const response = await api.get<User>('/me');
    return response.data;
  }
}; 
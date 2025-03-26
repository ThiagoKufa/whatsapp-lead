import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const API_URL = 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setupInterceptors = (
  getToken: () => string | null,
  refreshToken: () => Promise<string | null>,
  logout: () => void
) => {
  // Interceptar requisições
  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getToken();
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  );

  // Interceptar respostas
  api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig;
      
      // Se o erro for 401 (Unauthorized) e não estivermos na rota de refresh
      if (
        error.response?.status === 401 && 
        originalRequest && 
        originalRequest.url !== '/auth/refresh'
      ) {
        try {
          // Tenta renovar o token
          const newToken = await refreshToken();
          
          if (newToken && originalRequest.headers) {
            // Atualiza o token na requisição original
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            
            // Refaz a requisição original com o novo token
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Se não conseguir renovar o token, faz logout
          logout();
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );
}; 
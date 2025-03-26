import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthState, LoginCredentials, RegisterCredentials, User } from '../types/auth';
import { authService } from '../services/auth';
import { api, setupInterceptors } from '../services/api';

// Constantes para o localStorage
const TOKEN_KEY = '@whatsapp:token';
const REFRESH_TOKEN_KEY = '@whatsapp:refreshToken';
const USER_KEY = '@whatsapp:user';
const EXPIRES_IN_KEY = '@whatsapp:expiresIn';

// Estado inicial
const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  expiresIn: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Tipos do contexto
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

// Criação do contexto
const AuthContext = createContext<AuthContextType | null>(null);

// Provider do contexto
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>(initialState);

  // Função para salvar os dados de autenticação
  const saveAuthData = (token: string, refreshToken: string, expiresIn: number, user: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(EXPIRES_IN_KEY, expiresIn.toString());
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    setState({
      user,
      token,
      refreshToken,
      expiresIn,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  };

  // Função para limpar os dados de autenticação
  const clearAuthData = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(EXPIRES_IN_KEY);
    localStorage.removeItem(USER_KEY);

    setState({
      user: null,
      token: null,
      refreshToken: null,
      expiresIn: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  // Login
  const login = async (credentials: LoginCredentials) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { access_token, refresh_token, expires_in } = await authService.login(credentials);
      
      // Obter informações do usuário
      api.defaults.headers.common.Authorization = `Bearer ${access_token}`;
      const userData = await authService.getMe();
      
      saveAuthData(access_token, refresh_token, expires_in, userData);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Falha ao fazer login. Verifique suas credenciais.' 
      }));
      throw error;
    }
  };

  // Registro
  const register = async (credentials: RegisterCredentials) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { access_token, refresh_token, expires_in } = await authService.register(credentials);
      
      // Obter informações do usuário
      api.defaults.headers.common.Authorization = `Bearer ${access_token}`;
      const userData = await authService.getMe();
      
      saveAuthData(access_token, refresh_token, expires_in, userData);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Falha ao realizar o cadastro. Tente novamente.' 
      }));
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      if (state.refreshToken) {
        await authService.logout(state.refreshToken);
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      clearAuthData();
    }
  };

  // Função para renovar o token
  const refreshToken = async (): Promise<string | null> => {
    if (!state.refreshToken) return null;

    try {
      const { access_token, refresh_token, expires_in } = await authService.refreshToken(state.refreshToken);
      
      if (state.user) {
        saveAuthData(access_token, refresh_token, expires_in, state.user);
      }
      
      return access_token;
    } catch {
      
      clearAuthData();
      return null;
    }
  };

  // Função para obter o token atual
  const getToken = (): string | null => {
    return state.token;
  };

  // Configurar interceptors do Axios
  useEffect(() => {
    setupInterceptors(getToken, refreshToken, logout);
  }, [state.token, state.refreshToken]);

  // Verificar se o usuário já está autenticado ao iniciar
  useEffect(() => {
    const loadStoredAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      const storedExpiresIn = localStorage.getItem(EXPIRES_IN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (storedToken && storedRefreshToken && storedExpiresIn && storedUser) {
        api.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
        
        setState({
          token: storedToken,
          refreshToken: storedRefreshToken,
          expiresIn: parseInt(storedExpiresIn, 10),
          user: JSON.parse(storedUser),
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadStoredAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook para uso do contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}; 
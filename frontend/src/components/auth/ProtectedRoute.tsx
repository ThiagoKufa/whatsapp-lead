import { Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Mostra um spinner enquanto verifica o status de autenticação
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Verificando autenticação...
        </Typography>
      </Box>
    );
  }

  // Redireciona para a página de login se não estiver autenticado
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Renderiza o conteúdo protegido se estiver autenticado
  return <>{children}</>;
}; 
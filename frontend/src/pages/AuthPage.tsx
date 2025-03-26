import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  Typography,
  useTheme,
  Avatar,
  useMediaQuery,
  Fade,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuth } from '../contexts/AuthContext';

enum AuthMode {
  LOGIN,
  REGISTER,
}

export const AuthPage = () => {
  const [mode, setMode] = useState<AuthMode>(AuthMode.LOGIN);
  const [fadeIn, setFadeIn] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirecionar para a página inicial se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSwitchMode = (newMode: AuthMode) => {
    setFadeIn(false);
    setTimeout(() => {
      setMode(newMode);
      setFadeIn(true);
    }, 300);
  };

  const handleSwitchToRegister = () => handleSwitchMode(AuthMode.REGISTER);
  const handleSwitchToLogin = () => handleSwitchMode(AuthMode.LOGIN);

  // Se estiver autenticado, não renderiza nada enquanto redireciona
  if (isAuthenticated) {
    return null;
  }

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        height: '100vh',
        display: 'flex',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Botão ThemeToggle movido para o Container */}
      <Box sx={{ 
        position: 'absolute', 
        top: 16, 
        right: 16, 
        zIndex: 100
      }}>
        <ThemeToggle />
      </Box>

      {/* Background com split design para desktop */}
      {!isMobile && (
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            zIndex: -1,
            background: `linear-gradient(to right, ${theme.palette.background.paper} 50%, ${theme.palette.primary.main} 50%)`,
          }}
        />
      )}

      {/* Background para mobile */}
      {isMobile && (
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            zIndex: -1,
            bgcolor: theme.palette.background.default,
          }}
        />
      )}

      <Grid 
        container 
        sx={{ 
          height: '100%', 
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Lado esquerdo com o formulário */}
        <Grid 
          item 
          xs={12} 
          md={6} 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 2, sm: 4 },
            height: '100%',
          }}
        >
          <Paper
            elevation={isMobile ? 2 : 0}
            sx={{
              p: { xs: 3, sm: 4, md: 5 },
              width: '100%',
              maxWidth: 480,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: 2,
              position: 'relative',
              ...(isMobile ? {} : {
                backgroundColor: theme.palette.background.paper,
                boxShadow: theme.shadows[10],
              }),
            }}
          >
            <Avatar 
              sx={{ 
                m: 1, 
                bgcolor: theme.palette.secondary.main,
                width: 56,
                height: 56,
              }}
            >
              <LockOutlinedIcon fontSize="large" />
            </Avatar>

            <Typography 
              component="h1" 
              variant="h4" 
              gutterBottom
              sx={{ 
                mb: 4, 
                fontWeight: 700,
                color: theme.palette.text.primary,
              }}
            >
              {mode === AuthMode.LOGIN ? 'Login' : 'Cadastro'}
            </Typography>

            <Fade in={fadeIn} timeout={500}>
              <Box sx={{ width: '100%' }}>
                {mode === AuthMode.LOGIN ? (
                  <LoginForm onRegisterClick={handleSwitchToRegister} />
                ) : (
                  <RegisterForm onLoginClick={handleSwitchToLogin} />
                )}
              </Box>
            </Fade>
          </Paper>
        </Grid>

        {/* Lado direito com imagem ou mensagem (apenas em desktop) */}
        {!isMobile && (
          <Grid 
            item 
            md={6} 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
              height: '100%',
              color: 'white',
              position: 'relative',
            }}
          >
            <Box
              sx={{
                maxWidth: 500,
                textAlign: 'center',
                zIndex: 2,
              }}
            >
              <Typography variant="h3" sx={{ mb: 3, fontWeight: 700 }}>
                Bem-vindo ao Whatsapp
              </Typography>
              
              <Typography variant="h6" sx={{ mb: 4, fontWeight: 400 }}>
                Conecte-se com seus amigos e familiares de forma segura e rápida.
              </Typography>
            </Box>
            
            {/* Pattern overlay */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.1,
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%23ffffff" fill-opacity="1" fill-rule="evenodd"/%3E%3C/svg%3E")',
              }}
            />
          </Grid>
        )}
      </Grid>
    </Container>
  );
}; 
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Zoom,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

// Esquema de validação
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onRegisterClick: () => void;
}

export const LoginForm = ({ onRegisterClick }: LoginFormProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      setError(null);
      await login(data);
    } catch {
      // Exibir mensagem de erro amigável
      setError('Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        width: '100%',
      }}
      noValidate
    >
      {error && (
        <Zoom in={!!error}>
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: 1,
              '& .MuiAlert-icon': {
                display: 'flex',
                alignItems: 'center',
              }
            }}
          >
            {error}
          </Alert>
        </Zoom>
      )}

      <TextField
        label="Email"
        type="email"
        fullWidth
        variant="outlined"
        autoComplete="email"
        autoFocus
        {...register('email')}
        error={!!errors.email}
        helperText={errors.email?.message}
        disabled={loading}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Email color={errors.email ? 'error' : touchedFields.email ? 'primary' : 'action'} />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        label="Senha"
        type={showPassword ? 'text' : 'password'}
        fullWidth
        variant="outlined"
        autoComplete="current-password"
        {...register('password')}
        error={!!errors.password}
        helperText={errors.password?.message}
        disabled={loading}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock color={errors.password ? 'error' : touchedFields.password ? 'primary' : 'action'} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={toggleShowPassword}
                edge="end"
                size="small"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={loading}
        size="large"
        sx={{
          py: 1.5,
          mt: 1,
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            backgroundImage: 'radial-gradient(circle, #fff 10%, transparent 10.01%)',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: '50%',
            transform: 'scale(10, 10)',
            opacity: 0,
            transition: 'transform .5s, opacity 1s',
          },
          '&:active::after': {
            transform: 'scale(0, 0)',
            opacity: 0.3,
            transition: '0s',
          },
        }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
      </Button>

      <Typography variant="body2" align="center" sx={{ mt: 2 }}>
        Não tem uma conta?{' '}
        <Link
          component="button"
          type="button"
          variant="body2"
          onClick={onRegisterClick}
          sx={{
            textDecoration: 'none',
            fontWeight: 600,
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          Cadastre-se
        </Link>
      </Typography>
    </Box>
  );
}; 
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
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  Lock, 
  Person,
  VerifiedUser
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

// Esquema de validação
const registerSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'A confirmação de senha é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não conferem',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onLoginClick: () => void;
}

export const RegisterForm = ({ onLoginClick }: RegisterFormProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const watchPassword = watch('password', '');
  const watchConfirmPassword = watch('confirmPassword', '');

  const passwordsMatch = watchPassword === watchConfirmPassword && 
                        watchPassword.length >= 6 && 
                        watchConfirmPassword.length >= 6;

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      const { name, email, password } = data;
      await registerUser({ name, email, password });
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

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
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
        label="Nome"
        type="text"
        fullWidth
        variant="outlined"
        autoComplete="name"
        autoFocus
        {...register('name')}
        error={!!errors.name}
        helperText={errors.name?.message}
        disabled={loading}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Person color={errors.name ? 'error' : touchedFields.name ? 'primary' : 'action'} />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        label="Email"
        type="email"
        fullWidth
        variant="outlined"
        autoComplete="email"
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
        autoComplete="new-password"
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

      <TextField
        label="Confirmar Senha"
        type={showConfirmPassword ? 'text' : 'password'}
        fullWidth
        variant="outlined"
        autoComplete="new-password"
        {...register('confirmPassword')}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
        disabled={loading}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <VerifiedUser 
                color={
                  errors.confirmPassword 
                    ? 'error' 
                    : passwordsMatch 
                      ? 'success' 
                      : touchedFields.confirmPassword 
                        ? 'primary' 
                        : 'action'
                } 
              />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle confirm password visibility"
                onClick={toggleShowConfirmPassword}
                edge="end"
                size="small"
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Cadastrar'}
      </Button>

      <Typography variant="body2" align="center" sx={{ mt: 2 }}>
        Já tem uma conta?{' '}
        <Link
          component="button"
          type="button"
          variant="body2"
          onClick={onLoginClick}
          sx={{
            textDecoration: 'none',
            fontWeight: 600,
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          Faça login
        </Link>
      </Typography>
    </Box>
  );
}; 